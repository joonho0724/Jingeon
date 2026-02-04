require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeamMatches(teamId) {
  console.log(`\n팀 ID: ${teamId}\n`);

  // 팀 정보 조회
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (teamError || !team) {
    console.error('팀을 찾을 수 없습니다:', teamError);
    return;
  }

  console.log(`팀명: ${team.name}`);
  console.log(`연령대: ${team.age_group}`);
  console.log(`조: ${team.group_name}조\n`);

  // 해당 팀의 모든 경기 조회
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (matchesError) {
    console.error('경기 조회 오류:', matchesError);
    return;
  }

  console.log(`총 경기 수: ${matches.length}\n`);

  // 상태별 분류
  const byStatus = {
    '예정': matches.filter(m => m.status === '예정'),
    '진행중': matches.filter(m => m.status === '진행중'),
    '종료': matches.filter(m => m.status === '종료'),
  };

  console.log('=== 상태별 경기 수 ===');
  console.log(`예정: ${byStatus['예정'].length}경기`);
  console.log(`진행중: ${byStatus['진행중'].length}경기`);
  console.log(`종료: ${byStatus['종료'].length}경기\n`);

  // 예정 + 진행중 경기 상세
  const upcoming = [...byStatus['예정'], ...byStatus['진행중']].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  console.log(`=== 예정/진행중 경기 (총 ${upcoming.length}경기) ===`);
  upcoming.forEach((match, index) => {
    const opponent = match.home_team_id === teamId 
      ? match.away_team.name 
      : match.home_team.name;
    const isHome = match.home_team_id === teamId;
    console.log(`${index + 1}. ${match.date} ${match.time || ''} - ${isHome ? '(홈)' : '(원정)'} vs ${opponent} [${match.status}]`);
  });

  console.log(`\n현재 페이지에서는 최대 2개만 표시됩니다.`);
}

const teamId = process.argv[2] || '54cc15ce-b828-4d0e-9756-ff138034bb3d';
checkTeamMatches(teamId).then(() => process.exit(0));
