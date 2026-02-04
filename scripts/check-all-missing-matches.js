/**
 * 모든 조의 누락된 경기를 확인하는 스크립트
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

async function checkAllMissingMatches() {
  console.log('전체 조별 누락 경기 확인 중...\n');

  // 모든 조별 팀 목록 가져오기
  const { data: allTeams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('age_group')
    .order('group_name')
    .order('name');

  if (teamsError) {
    console.error('팀 조회 오류:', teamsError);
    return;
  }

  if (!allTeams || allTeams.length === 0) {
    console.log('팀 데이터가 없습니다.');
    return;
  }

  // 연령대별, 조별로 그룹화
  const teamsByGroup = {};
  
  allTeams.forEach(team => {
    const key = `${team.age_group}-${team.group_name}`;
    if (!teamsByGroup[key]) {
      teamsByGroup[key] = {
        ageGroup: team.age_group,
        groupName: team.group_name,
        teams: []
      };
    }
    teamsByGroup[key].teams.push(team);
  });

  // 각 조별로 누락된 경기 확인
  let totalMissing = 0;
  const missingByGroup = {};

  for (const key in teamsByGroup) {
    const group = teamsByGroup[key];
    const teams = group.teams;
    
    // 풀리그 방식이면 각 팀당 (팀 수 - 1) 경기 필요
    const expectedMatchesPerTeam = teams.length - 1;
    const totalExpectedMatches = (teams.length * expectedMatchesPerTeam) / 2; // 중복 제거

    // 실제 경기 수 확인
    const { count: actualMatches, error: countError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('round', '1차')
      .eq('group_name', group.groupName);
    
    // age_group 컬럼이 없을 수 있으므로 필터링 제거

    // 각 팀별 경기 수 확인
    const teamMatchCounts = {};
    teams.forEach(team => {
      teamMatchCounts[team.id] = {
        name: team.name,
        count: 0
      };
    });

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        home_team_id,
        away_team_id,
        home_team:teams!matches_home_team_id_fkey(age_group),
        away_team:teams!matches_away_team_id_fkey(age_group)
      `)
      .eq('round', '1차')
      .eq('group_name', group.groupName);

    if (matchesError) {
      console.error(`경기 조회 오류 (${group.ageGroup} ${group.groupName}조):`, matchesError);
      continue;
    }

    // 연령대 필터링 (age_group 컬럼이 없을 수 있으므로 팀 정보로 확인)
    const filteredMatches = (matches || []).filter(m => {
      const homeAgeGroup = m.home_team?.age_group;
      const awayAgeGroup = m.away_team?.age_group;
      return homeAgeGroup === group.ageGroup || awayAgeGroup === group.ageGroup;
    });

    filteredMatches.forEach(match => {
      if (teamMatchCounts[match.home_team_id]) {
        teamMatchCounts[match.home_team_id].count++;
      }
      if (teamMatchCounts[match.away_team_id]) {
        teamMatchCounts[match.away_team_id].count++;
      }
    });

    // 누락된 경기 찾기
    const missingMatches = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];

        const exists = filteredMatches.some(m => 
          (m.home_team_id === team1.id && m.away_team_id === team2.id) ||
          (m.home_team_id === team2.id && m.away_team_id === team1.id)
        );

        if (!exists) {
          missingMatches.push({
            team1: team1.name,
            team2: team2.name,
            team1Id: team1.id,
            team2Id: team2.id
          });
        }
      }
    }

    const actualCount = filteredMatches.length;
    if (missingMatches.length > 0 || actualCount < totalExpectedMatches) {
      missingByGroup[key] = {
        ageGroup: group.ageGroup,
        groupName: group.groupName,
        teams: teams.map(t => t.name),
        expectedMatches: totalExpectedMatches,
        actualMatches: actualCount,
        missingMatches: missingMatches,
        teamMatchCounts: Object.values(teamMatchCounts)
      };
      totalMissing += missingMatches.length;
    }
  }

  // 결과 출력
  console.log('=== 누락된 경기 확인 결과 ===\n');

  if (Object.keys(missingByGroup).length === 0) {
    console.log('✅ 모든 조의 경기가 완전히 등록되어 있습니다.\n');
    return;
  }

  console.log(`총 ${Object.keys(missingByGroup).length}개 조에서 누락된 경기 발견\n`);
  console.log(`총 누락 경기 수: ${totalMissing}개\n`);

  Object.keys(missingByGroup).sort().forEach(key => {
    const group = missingByGroup[key];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${group.ageGroup} ${group.groupName}조`);
    console.log(`${'='.repeat(60)}`);
    console.log(`팀 목록: ${group.teams.join(', ')}`);
    console.log(`예상 경기 수: ${group.expectedMatches}개`);
    console.log(`실제 경기 수: ${group.actualMatches}개`);
    console.log(`누락 경기 수: ${group.missingMatches.length}개\n`);

    if (group.missingMatches.length > 0) {
      console.log('누락된 경기:');
      group.missingMatches.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.team1} vs ${m.team2}`);
      });
    }

    console.log('\n팀별 경기 수:');
    group.teamMatchCounts.forEach(team => {
      const expected = group.teams.length - 1;
      const status = team.count === expected ? '✅' : '⚠️';
      console.log(`  ${status} ${team.name}: ${team.count}경기 (예상: ${expected}경기)`);
    });
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n총 ${totalMissing}개 경기가 누락되었습니다.`);
  console.log('원본 대진표를 확인하여 누락된 경기를 추가해주세요.');
}

checkAllMissingMatches().catch(console.error);
