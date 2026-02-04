/**
 * Test data 팀들 삭제 스크립트
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

async function deleteTestTeams() {
  console.log('=== Test Data 팀 삭제 ===\n');
  
  // A조의 test data 팀들
  const testTeamNames = ['FC진건_레드', 'FC진건_블루', 'FC진건', '진건초'];
  
  // A조 팀 조회
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('group_name', 'A');
  
  if (teamsError) {
    console.error('A조 팀 조회 오류:', teamsError);
    return;
  }
  
  console.log(`A조 팀 목록 (${teams?.length || 0}개):`);
  teams?.forEach(team => {
    console.log(`  - ${team.name} (${team.age_group}, ID: ${team.id.substring(0, 8)}...)`);
  });
  
  console.log('\n위 팀들을 삭제합니다...\n');
  
  let deletedCount = 0;
  let errorCount = 0;
  
  for (const team of teams || []) {
    // 해당 팀의 경기 확인
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id')
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);
    
    if (matchesError) {
      console.error(`${team.name} 경기 조회 오류:`, matchesError);
      continue;
    }
    
    if (matches && matches.length > 0) {
      console.log(`⚠ ${team.name}: ${matches.length}개 경기가 있어 삭제하지 않습니다.`);
      continue;
    }
    
    // 팀 삭제
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', team.id);
    
    if (deleteError) {
      console.error(`${team.name} 삭제 오류:`, deleteError.message);
      errorCount++;
    } else {
      console.log(`✓ ${team.name} (${team.age_group}) 삭제 완료`);
      deletedCount++;
    }
  }
  
  console.log(`\n=== 삭제 완료 ===`);
  console.log(`성공: ${deletedCount}개`);
  console.log(`실패: ${errorCount}개`);
  console.log(`스킵 (경기 있음): ${(teams?.length || 0) - deletedCount - errorCount}개`);
}

deleteTestTeams().catch(console.error);
