/**
 * 1차리그-A조와 2차리그-A조 데이터 삭제 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteStandingsData() {
  console.log('=== 1차리그-A조와 2차리그-A조 데이터 삭제 시작 ===\n');
  
  // 1차리그-A조 경기 조회
  const { data: matches1st, error: error1st } = await supabase
    .from('matches')
    .select('id, round, group_name, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .eq('round', '1차')
    .eq('group_name', 'A');
  
  if (error1st) {
    console.error('1차리그-A조 경기 조회 오류:', error1st);
  } else {
    console.log(`1차리그-A조 경기: ${matches1st?.length || 0}개`);
  }
  
  // 2차리그-A조 경기 조회
  const { data: matches2nd, error: error2nd } = await supabase
    .from('matches')
    .select('id, round, group_name, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .eq('round', '2차')
    .eq('group_name', 'A');
  
  if (error2nd) {
    console.error('2차리그-A조 경기 조회 오류:', error2nd);
  } else {
    console.log(`2차리그-A조 경기: ${matches2nd?.length || 0}개`);
  }
  
  const totalMatches = (matches1st?.length || 0) + (matches2nd?.length || 0);
  console.log(`\n총 삭제할 경기: ${totalMatches}개\n`);
  
  if (totalMatches === 0) {
    console.log('삭제할 데이터가 없습니다.');
    return;
  }
  
  // 확인 메시지
  console.log('삭제할 경기 목록:');
  matches1st?.forEach(m => {
    console.log(`  [1차-A조] ${m.home_team?.name || '?'} vs ${m.away_team?.name || '?'} (${m.id.substring(0, 8)}...)`);
  });
  matches2nd?.forEach(m => {
    console.log(`  [2차-A조] ${m.home_team?.name || '?'} vs ${m.away_team?.name || '?'} (${m.id.substring(0, 8)}...)`);
  });
  
  console.log('\n위 경기들을 삭제합니다...\n');
  
  // 1차리그-A조 경기 삭제
  if (matches1st && matches1st.length > 0) {
    const matchIds1st = matches1st.map(m => m.id);
    const { error: deleteError1st } = await supabase
      .from('matches')
      .delete()
      .in('id', matchIds1st);
    
    if (deleteError1st) {
      console.error('1차리그-A조 경기 삭제 오류:', deleteError1st);
    } else {
      console.log(`✓ 1차리그-A조 경기 ${matches1st.length}개 삭제 완료`);
    }
  }
  
  // 2차리그-A조 경기 삭제
  if (matches2nd && matches2nd.length > 0) {
    const matchIds2nd = matches2nd.map(m => m.id);
    const { error: deleteError2nd } = await supabase
      .from('matches')
      .delete()
      .in('id', matchIds2nd);
    
    if (deleteError2nd) {
      console.error('2차리그-A조 경기 삭제 오류:', deleteError2nd);
    } else {
      console.log(`✓ 2차리그-A조 경기 ${matches2nd.length}개 삭제 완료`);
    }
  }
  
  // fair_play_points는 CASCADE로 자동 삭제됨
  console.log('\n=== 삭제 완료 ===');
  console.log('참고: fair_play_points는 CASCADE로 자동 삭제되었습니다.');
}

deleteStandingsData().catch(console.error);
