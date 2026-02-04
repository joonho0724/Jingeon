const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllMatches() {
  console.log('전체 경기 데이터 확인 중...\n');

  // 전체 경기 조회
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (matchesError) {
    console.error('경기 조회 오류:', matchesError);
    return;
  }

  console.log(`전체 경기 수: ${matches.length}\n`);

  // 날짜별로 그룹화
  const matchesByDate = {};
  matches.forEach(match => {
    const date = match.date;
    if (!matchesByDate[date]) {
      matchesByDate[date] = [];
    }
    matchesByDate[date].push(match);
  });

  console.log('날짜별 경기 수:');
  Object.keys(matchesByDate).sort().forEach(date => {
    console.log(`- ${date}: ${matchesByDate[date].length}개`);
  });

  // FC진건블루 관련 경기 확인
  const { data: fcJingeonBlue } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', '%FC진건블루%')
    .eq('age_group', 'U11')
    .single();

  if (fcJingeonBlue) {
    console.log(`\nFC진건블루 (${fcJingeonBlue.name}, ${fcJingeonBlue.group_name}조) 경기:`);
    
    const teamMatches = matches.filter(m => 
      m.home_team_id === fcJingeonBlue.id || m.away_team_id === fcJingeonBlue.id
    );

    console.log(`총 ${teamMatches.length}개 경기`);
    
    teamMatches.forEach(m => {
      const opponent = m.home_team_id === fcJingeonBlue.id ? m.away_team : m.home_team;
      console.log(`- ${m.date} ${m.time || '시간 미정'}: vs ${opponent.name} (${m.round}, ${m.group_name}조)`);
    });
  }

  // 2월 8일 경기 상세 확인
  const feb8Matches = matches.filter(m => m.date === '2026-02-08');
  console.log(`\n2월 8일 경기 (${feb8Matches.length}개):`);
  if (feb8Matches.length === 0) {
    console.log('❌ 2월 8일 경기가 없습니다.');
    
    // 가장 가까운 날짜 확인
    const dates = Object.keys(matchesByDate).sort();
    console.log(`\n가장 가까운 날짜:`);
    dates.slice(0, 5).forEach(date => {
      console.log(`- ${date}: ${matchesByDate[date].length}개 경기`);
    });
  } else {
    feb8Matches.forEach(m => {
      console.log(`- ${m.time || '시간 미정'}: ${m.home_team.name} vs ${m.away_team.name} (${m.round}, ${m.group_name}조)`);
    });
  }

  // 리그별 경기 수
  const matchesByRound = {
    '1차': matches.filter(m => m.round === '1차').length,
    '2차': matches.filter(m => m.round === '2차').length,
  };
  console.log(`\n리그별 경기 수:`);
  console.log(`- 1차: ${matchesByRound['1차']}개`);
  console.log(`- 2차: ${matchesByRound['2차']}개`);

  // 연령대별 경기 수
  const matchesByAgeGroup = {
    'U11': matches.filter(m => {
      const ageGroup = m.age_group || m.home_team?.age_group;
      return ageGroup === 'U11';
    }).length,
    'U12': matches.filter(m => {
      const ageGroup = m.age_group || m.home_team?.age_group;
      return ageGroup === 'U12';
    }).length,
  };
  console.log(`\n연령대별 경기 수:`);
  console.log(`- U11: ${matchesByAgeGroup['U11']}개`);
  console.log(`- U12: ${matchesByAgeGroup['U12']}개`);
}

checkAllMatches().catch(console.error);
