const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatches() {
  console.log('🔍 matches 테이블 데이터 확인 중...\n');

  // 1) 전체 matches 개수
  const { count: totalCount, error: countError } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ matches 개수 조회 오류:', countError);
    console.error('오류 상세:', JSON.stringify(countError, null, 2));
    return;
  }

  console.log(`📊 전체 matches 개수: ${totalCount || 0}`);

  if (totalCount === 0) {
    console.log('\n⚠️  matches 테이블에 데이터가 없습니다!');
    console.log('   관리자 페이지에서 경기를 등록했는지 확인해주세요.');
    return;
  }

  // 2) 연령대별 개수
  const { data: ageGroupData, error: ageGroupError } = await supabase
    .from('matches')
    .select('age_group')
    .not('age_group', 'is', null);

  if (!ageGroupError && ageGroupData) {
    const u11Count = ageGroupData.filter(m => m.age_group === 'U11').length;
    const u12Count = ageGroupData.filter(m => m.age_group === 'U12').length;
    const nullCount = totalCount - ageGroupData.length;

    console.log(`\n📈 연령대별 개수:`);
    console.log(`   U11: ${u11Count}`);
    console.log(`   U12: ${u12Count}`);
    if (nullCount > 0) {
      console.log(`   age_group 없음: ${nullCount}`);
    }
  }

  // 3) 라운드별 개수
  const { data: roundData, error: roundError } = await supabase
    .from('matches')
    .select('round');

  if (!roundError && roundData) {
    const round1Count = roundData.filter(m => m.round === '1차').length;
    const round2Count = roundData.filter(m => m.round === '2차').length;

    console.log(`\n📅 라운드별 개수:`);
    console.log(`   1차: ${round1Count}`);
    console.log(`   2차: ${round2Count}`);
  }

  // 4) 상태별 개수
  const { data: statusData, error: statusError } = await supabase
    .from('matches')
    .select('status');

  if (!statusError && statusData) {
    const scheduled = statusData.filter(m => m.status === '예정').length;
    const inProgress = statusData.filter(m => m.status === '진행중').length;
    const finished = statusData.filter(m => m.status === '종료').length;

    console.log(`\n🎯 상태별 개수:`);
    console.log(`   예정: ${scheduled}`);
    console.log(`   진행중: ${inProgress}`);
    console.log(`   종료: ${finished}`);
  }

  // 5) 샘플 데이터 5개 출력
  const { data: sampleData, error: sampleError } = await supabase
    .from('matches')
    .select('id, date, time, round, group_name, age_group, status, home_team_id, away_team_id')
    .limit(5);

  if (!sampleError && sampleData && sampleData.length > 0) {
    console.log(`\n📋 샘플 데이터 (최대 5개):`);
    sampleData.forEach((match, idx) => {
      console.log(`\n   ${idx + 1}. ID: ${match.id.substring(0, 8)}...`);
      console.log(`      날짜: ${match.date} ${match.time || ''}`);
      console.log(`      ${match.round} 리그 - ${match.group_name}조`);
      console.log(`      연령대: ${match.age_group || 'NULL'}`);
      console.log(`      상태: ${match.status}`);
      console.log(`      홈팀 ID: ${match.home_team_id?.substring(0, 8) || 'NULL'}...`);
      console.log(`      원정팀 ID: ${match.away_team_id?.substring(0, 8) || 'NULL'}...`);
    });
  }

  // 6) RLS 정책 확인 (간접적으로)
  console.log(`\n🔐 RLS 정책:`);
  console.log(`   현재 사용자(anon key)로 조회 가능: ${totalCount !== null ? '✅' : '❌'}`);
  if (totalCount === 0) {
    console.log(`   ⚠️  데이터가 0개이므로 RLS 문제인지 데이터 부재인지 확인 필요`);
  }
}

checkMatches()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  });
