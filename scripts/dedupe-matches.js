/**
 * matches 테이블의 중복 row를 제거합니다.
 * 중복 기준: (round, group_name, date, time, venue, home_team_id, away_team_id)
 *
 * 주의: 결과/페어플레이 등 연관 데이터가 있을 수 있으므로
 * "가장 오래된 1개"를 남기고 나머지 중복 row만 삭제합니다.
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function makeKey(m) {
  const normTime = m.time ? String(m.time).slice(0, 5) : '';
  return [
    m.round,
    m.group_name,
    m.date,
    normTime,
    m.venue || '',
    m.home_team_id,
    m.away_team_id,
  ].join('|');
}

async function main() {
  console.log('중복 경기 제거 시작...\n');

  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, round, group_name, date, time, venue, home_team_id, away_team_id, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('matches 조회 오류:', error);
    process.exit(1);
  }

  const byKey = new Map();
  for (const m of matches || []) {
    const key = makeKey(m);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(m);
  }

  const toDelete = [];
  let dupGroups = 0;
  for (const [key, arr] of byKey.entries()) {
    if (arr.length > 1) {
      dupGroups++;
      // 가장 오래된 1개(첫번째)만 남기고 나머지 삭제
      toDelete.push(...arr.slice(1).map((x) => x.id));
    }
  }

  console.log(`전체 경기: ${(matches || []).length}개`);
  console.log(`중복 그룹: ${dupGroups}개`);
  console.log(`삭제 대상 row: ${toDelete.length}개\n`);

  if (toDelete.length === 0) {
    console.log('✅ 중복이 없습니다.');
    return;
  }

  // 배치 삭제
  const chunkSize = 100;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += chunkSize) {
    const chunk = toDelete.slice(i, i + chunkSize);
    const { error: delError } = await supabase.from('matches').delete().in('id', chunk);
    if (delError) {
      console.error('삭제 오류:', delError);
      process.exit(1);
    }
    deleted += chunk.length;
    if (deleted % 500 === 0 || deleted === toDelete.length) {
      console.log(`... 삭제 진행: ${deleted}/${toDelete.length}`);
    }
  }

  console.log('\n✅ 중복 경기 제거 완료');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

