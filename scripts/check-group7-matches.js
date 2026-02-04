const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroup7Matches() {
  console.log('7조 경기 확인 중...\n');

  // 7조 팀 목록
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('group_name', '7')
    .eq('age_group', 'U11')
    .order('name');

  console.log('7조 팀 목록:');
  teams.forEach(team => {
    console.log(`- ${team.name} (ID: ${team.id})`);
  });

  // 7조 모든 경기
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('group_name', '7')
    .eq('round', '1차')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  console.log(`\n7조 전체 경기 수: ${matches.length}개\n`);

  // 각 팀별 경기 수 확인
  const teamMatchCount = {};
  teams.forEach(team => {
    teamMatchCount[team.id] = {
      name: team.name,
      count: 0,
      matches: []
    };
  });

  matches.forEach(match => {
    if (teamMatchCount[match.home_team_id]) {
      teamMatchCount[match.home_team_id].count++;
      teamMatchCount[match.home_team_id].matches.push({
        date: match.date,
        time: match.time,
        opponent: match.away_team.name,
        isHome: true
      });
    }
    if (teamMatchCount[match.away_team_id]) {
      teamMatchCount[match.away_team_id].count++;
      teamMatchCount[match.away_team_id].matches.push({
        date: match.date,
        time: match.time,
        opponent: match.home_team.name,
        isHome: false
      });
    }
  });

  console.log('팀별 경기 수:');
  Object.values(teamMatchCount).forEach(team => {
    console.log(`\n${team.name}: ${team.count}경기`);
    team.matches.forEach(m => {
      console.log(`  - ${m.date} ${m.time || '시간 미정'}: ${m.isHome ? '홈' : '원정'} vs ${m.opponent}`);
    });
  });

  // 풀리그 방식이면 4개 팀이면 각 팀당 3경기여야 함
  const expectedMatchesPerTeam = teams.length - 1;
  console.log(`\n예상 경기 수 (풀리그): 각 팀당 ${expectedMatchesPerTeam}경기`);
  
  Object.values(teamMatchCount).forEach(team => {
    if (team.count < expectedMatchesPerTeam) {
      console.log(`⚠️ ${team.name}: ${team.count}경기 (부족: ${expectedMatchesPerTeam - team.count}경기)`);
    }
  });

  // 누락된 경기 찾기
  console.log('\n누락된 경기 확인:');
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const team1 = teams[i];
      const team2 = teams[j];
      
      const exists = matches.some(m => 
        (m.home_team_id === team1.id && m.away_team_id === team2.id) ||
        (m.home_team_id === team2.id && m.away_team_id === team1.id)
      );
      
      if (!exists) {
        console.log(`❌ 누락: ${team1.name} vs ${team2.name}`);
      }
    }
  }
}

checkGroup7Matches().catch(console.error);
