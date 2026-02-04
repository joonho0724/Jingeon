/**
 * standings에 표시되는 팀들이 데이터베이스에 존재하는지 확인하는 스크립트
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

async function checkStandingsTeams() {
  console.log('=== Standings 팀 확인 ===\n');
  
  // 1차리그-A조 경기 조회 (종료된 경기만)
  const { data: matches1st, error: error1st } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .eq('round', '1차')
    .eq('group_name', 'A')
    .eq('status', '종료');
  
  if (error1st) {
    console.error('1차리그-A조 경기 조회 오류:', error1st);
  } else {
    console.log(`1차리그-A조 종료된 경기: ${matches1st?.length || 0}개`);
    if (matches1st && matches1st.length > 0) {
      console.log('\n경기 목록:');
      matches1st.forEach(m => {
        console.log(`  - ${m.home_team?.name || '?'} vs ${m.away_team?.name || '?'} (${m.home_score}:${m.away_score})`);
      });
    }
  }
  
  // 2차리그-A조 경기 조회 (종료된 경기만)
  const { data: matches2nd, error: error2nd } = await supabase
    .from('matches')
    .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
    .eq('round', '2차')
    .eq('group_name', 'A')
    .eq('status', '종료');
  
  if (error2nd) {
    console.error('2차리그-A조 경기 조회 오류:', error2nd);
  } else {
    console.log(`\n2차리그-A조 종료된 경기: ${matches2nd?.length || 0}개`);
    if (matches2nd && matches2nd.length > 0) {
      console.log('\n경기 목록:');
      matches2nd.forEach(m => {
        console.log(`  - ${m.home_team?.name || '?'} vs ${m.away_team?.name || '?'} (${m.home_score}:${m.away_score})`);
      });
    }
  }
  
  // A조 팀 목록 조회
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('group_name', 'A')
    .order('age_group', { ascending: true })
    .order('name', { ascending: true });
  
  if (teamsError) {
    console.error('A조 팀 조회 오류:', teamsError);
  } else {
    console.log(`\n=== A조 팀 목록 (총 ${teams?.length || 0}개) ===`);
    if (teams && teams.length > 0) {
      const teamsByAge = {};
      teams.forEach(team => {
        if (!teamsByAge[team.age_group]) {
          teamsByAge[team.age_group] = [];
        }
        teamsByAge[team.age_group].push(team);
      });
      
      Object.keys(teamsByAge).sort().forEach(ageGroup => {
        console.log(`\n${ageGroup}:`);
        teamsByAge[ageGroup].forEach(team => {
          console.log(`  - ${team.name} (ID: ${team.id.substring(0, 8)}...)`);
        });
      });
    } else {
      console.log('A조에 등록된 팀이 없습니다.');
    }
  }
  
  // test data로 보이는 팀 확인 (FC진건_레드, FC진건_블루 등)
  console.log('\n=== Test Data 팀 확인 ===');
  const testTeamNames = ['FC진건_레드', 'FC진건_블루', 'FC진건블루', 'FC진건레드', '진건초', 'FC진건'];
  
  for (const teamName of testTeamNames) {
    const { data: testTeams, error: testError } = await supabase
      .from('teams')
      .select('*')
      .ilike('name', `%${teamName}%`);
    
    if (!testError && testTeams && testTeams.length > 0) {
      console.log(`\n"${teamName}" 관련 팀:`);
      testTeams.forEach(team => {
        console.log(`  - ${team.name} (${team.age_group}, ${team.group_name}조, ID: ${team.id.substring(0, 8)}...)`);
      });
    }
  }
}

checkStandingsTeams().catch(console.error);
