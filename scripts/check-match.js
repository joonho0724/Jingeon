const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatch() {
  console.log('경기 확인 중...\n');

  // 팀 찾기
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .or('name.ilike.%FC진건블루%,name.ilike.%위례FC%');

  if (teamsError) {
    console.error('팀 조회 오류:', teamsError);
    return;
  }

  console.log('찾은 팀:');
  teams.forEach(team => {
    console.log(`- ${team.name} (${team.age_group}, ${team.group_name}조, ID: ${team.id})`);
  });

  const fcJingeonBlue = teams.find(t => t.name.includes('FC진건블루') || t.name.includes('진건블루'));
  const wiryeFC = teams.find(t => t.name.includes('위례FC') || t.name.includes('위례'));

  if (!fcJingeonBlue) {
    console.log('\n❌ FC진건블루 팀을 찾을 수 없습니다.');
    return;
  }

  if (!wiryeFC) {
    console.log('\n❌ 위례FC 팀을 찾을 수 없습니다.');
    return;
  }

  console.log(`\n팀 확인:`);
  console.log(`- FC진건블루: ${fcJingeonBlue.name} (${fcJingeonBlue.age_group})`);
  console.log(`- 위례FC: ${wiryeFC.name} (${wiryeFC.age_group})`);

  // 경기 찾기
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .or(`home_team_id.eq.${fcJingeonBlue.id},away_team_id.eq.${fcJingeonBlue.id}`)
    .or(`home_team_id.eq.${wiryeFC.id},away_team_id.eq.${wiryeFC.id}`)
    .eq('date', '2026-02-08');

  if (matchesError) {
    console.error('경기 조회 오류:', matchesError);
    return;
  }

  console.log(`\n2월 8일 경기 (총 ${matches.length}개):`);
  matches.forEach(match => {
    const isHome = match.home_team_id === fcJingeonBlue.id;
    const opponent = isHome ? match.away_team : match.home_team;
    const matchTime = match.time || '시간 미정';
    
    console.log(`\n- ${match.home_team.name} vs ${match.away_team.name}`);
    console.log(`  날짜: ${match.date}, 시간: ${matchTime}`);
    console.log(`  리그: ${match.round}, 조: ${match.group_name}조`);
    console.log(`  상태: ${match.status}`);
    
    if (opponent.name.includes('위례') || opponent.name.includes('위례FC')) {
      console.log(`  ✅ 찾는 경기입니다!`);
    }
  });

  // 특정 시간 경기 확인
  const targetMatch = matches.find(m => 
    m.time === '11:40' && 
    ((m.home_team_id === fcJingeonBlue.id && m.away_team_id === wiryeFC.id) ||
     (m.home_team_id === wiryeFC.id && m.away_team_id === fcJingeonBlue.id))
  );

  if (targetMatch) {
    console.log(`\n✅ 찾았습니다!`);
    console.log(`경기 ID: ${targetMatch.id}`);
    console.log(`홈팀: ${targetMatch.home_team.name}`);
    console.log(`원정팀: ${targetMatch.away_team.name}`);
    console.log(`날짜: ${targetMatch.date}, 시간: ${targetMatch.time}`);
  } else {
    console.log(`\n❌ 2월 8일 11:40 FC진건블루 vs 위례FC 경기를 찾을 수 없습니다.`);
    
    // 비슷한 경기 확인
    const similarMatches = matches.filter(m => 
      m.time && m.time.includes('11:4')
    );
    
    if (similarMatches.length > 0) {
      console.log(`\n비슷한 시간대 경기:`);
      similarMatches.forEach(m => {
        console.log(`- ${m.home_team.name} vs ${m.away_team.name} (${m.time})`);
      });
    }
  }

  // 전체 경기 수 확인
  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  console.log(`\n전체 경기 수: ${totalMatches}`);
}

checkMatch().catch(console.error);
