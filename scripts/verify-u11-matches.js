/**
 * U11 1차 리그 경기 수 검증 스크립트
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

async function verifyU11Matches() {
  console.log('U11 1차 리그 경기 수 검증 중...\n');

  // U11 팀 목록 (1차 리그)
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('age_group', 'U11')
    .order('group_name')
    .order('name');

  if (teamsError) {
    console.error('팀 조회 오류:', teamsError);
    return;
  }

  // 조별로 그룹화
  const teamsByGroup = {};
  teams.forEach(team => {
    const groupName = team.group_name;
    if (!teamsByGroup[groupName]) {
      teamsByGroup[groupName] = [];
    }
    teamsByGroup[groupName].push(team);
  });

  console.log('=== 조별 팀 수 ===');
  Object.keys(teamsByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupName => {
    const teams = teamsByGroup[groupName];
    console.log(`${groupName}조: ${teams.length}개 팀`);
  });

  // 이론적 경기 수 계산 (풀리그 방식)
  let expectedTotalMatches = 0;
  const expectedByGroup = {};

  Object.keys(teamsByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupName => {
    const teams = teamsByGroup[groupName];
    const teamCount = teams.length;
    // 풀리그: n개 팀이면 n * (n-1) / 2 경기
    const expectedMatches = (teamCount * (teamCount - 1)) / 2;
    expectedByGroup[groupName] = expectedMatches;
    expectedTotalMatches += expectedMatches;
  });

  console.log(`\n=== 이론적 경기 수 (풀리그) ===`);
  console.log(`총 ${Object.keys(teamsByGroup).length}개 조`);
  Object.keys(expectedByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupName => {
    console.log(`${groupName}조: ${expectedByGroup[groupName]}경기`);
  });
  console.log(`\n총 예상 경기 수: ${expectedTotalMatches}경기`);

  // 실제 경기 수 확인
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(age_group),
      away_team:teams!matches_away_team_id_fkey(age_group)
    `)
    .eq('round', '1차');

  if (matchesError) {
    console.error('경기 조회 오류:', matchesError);
    return;
  }

  // U11 경기만 필터링
  const u11Matches = matches.filter(m => {
    const homeAgeGroup = m.home_team?.age_group;
    const awayAgeGroup = m.away_team?.age_group;
    return homeAgeGroup === 'U11' || awayAgeGroup === 'U11';
  });

  // 조별 실제 경기 수
  const actualByGroup = {};
  u11Matches.forEach(match => {
    const groupName = match.group_name;
    if (!actualByGroup[groupName]) {
      actualByGroup[groupName] = 0;
    }
    actualByGroup[groupName]++;
  });

  console.log(`\n=== 실제 경기 수 ===`);
  Object.keys(actualByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupName => {
    console.log(`${groupName}조: ${actualByGroup[groupName]}경기`);
  });
  console.log(`\n총 실제 경기 수: ${u11Matches.length}경기`);

  // 비교
  console.log(`\n=== 검증 결과 ===`);
  console.log(`예상 경기 수: ${expectedTotalMatches}경기`);
  console.log(`실제 경기 수: ${u11Matches.length}경기`);
  console.log(`차이: ${expectedTotalMatches - u11Matches.length}경기`);

  if (u11Matches.length === 93) {
    console.log(`\n✅ 사용자가 말한 93경기와 일치합니다!`);
  } else {
    console.log(`\n⚠️ 사용자가 말한 93경기와 다릅니다.`);
    console.log(`   차이: ${Math.abs(93 - u11Matches.length)}경기`);
  }

  // 조별 비교
  console.log(`\n=== 조별 상세 비교 ===`);
  const allGroups = new Set([...Object.keys(expectedByGroup), ...Object.keys(actualByGroup)]);
  Array.from(allGroups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(groupName => {
    const expected = expectedByGroup[groupName] || 0;
    const actual = actualByGroup[groupName] || 0;
    const diff = expected - actual;
    const status = diff === 0 ? '✅' : '❌';
    console.log(`${status} ${groupName}조: 예상 ${expected}경기, 실제 ${actual}경기 (차이: ${diff})`);
  });
}

verifyU11Matches().catch(console.error);
