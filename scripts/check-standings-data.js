/**
 * 대회결과 페이지 데이터 확인 스크립트
 * 
 * 사용법: node scripts/check-standings-data.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStandingsData() {
  console.log('📊 대회결과 데이터 확인 중...\n');

  try {
    // 1. 팀 목록 확인
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('age_group')
      .order('group_name1');

    if (teamsError) {
      console.error('❌ 팀 목록 조회 실패:', teamsError);
      return;
    }

    console.log(`✅ 팀 목록: ${teams.length}개\n`);

    // 연령대별, 조별로 그룹화
    const groupsByAge = {
      U11: new Set(),
      U12: new Set(),
    };

    teams.forEach(team => {
      if (team.group_name1) {
        groupsByAge[team.age_group].add(team.group_name1);
      }
    });

    console.log('📋 조 목록:');
    console.log(`  U11: ${Array.from(groupsByAge.U11).sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}`);
    console.log(`  U12: ${Array.from(groupsByAge.U12).sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}\n`);

    // 2. 경기 목록 확인
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .order('date')
      .order('time');

    if (matchesError) {
      console.error('❌ 경기 목록 조회 실패:', matchesError);
      return;
    }

    console.log(`✅ 경기 목록: ${matches.length}개\n`);

    // 3. 경기 결과가 있는 경기 확인
    const matchesWithResults = matches.filter(m => 
      m.status === '종료' && 
      m.home_score !== null && 
      m.away_score !== null
    );

    console.log(`✅ 경기 결과가 있는 경기: ${matchesWithResults.length}개\n`);

    // 4. 조별로 경기 결과 확인
    console.log('📊 조별 경기 결과 현황:\n');

    for (const ageGroup of ['U11', 'U12']) {
      for (const round of ['1차', '2차']) {
        const roundMatches = matches.filter(m => m.round === round);
        
        if (roundMatches.length === 0) continue;

        console.log(`  ${ageGroup} ${round} 리그:`);
        
        for (const groupName of Array.from(groupsByAge[ageGroup]).sort((a, b) => parseInt(a) - parseInt(b))) {
          const groupMatches = roundMatches.filter(m => m.group_name === groupName);
          const groupMatchesWithResults = groupMatches.filter(m => 
            m.status === '종료' && 
            m.home_score !== null && 
            m.away_score !== null
          );

          // 해당 조의 팀 수 확인
          const teamsInGroup = teams.filter(t => 
            t.age_group === ageGroup && 
            t.group_name1 === groupName
          );

          console.log(`    ${groupName}조: ${teamsInGroup.length}개 팀, ${groupMatches.length}개 경기, ${groupMatchesWithResults.length}개 경기 결과`);

          if (groupMatchesWithResults.length > 0) {
            console.log(`      ✅ 경기 결과 있음 - 순위표에 표시됨`);
          } else if (groupMatches.length > 0) {
            console.log(`      ⚠️  경기 결과 없음 - "아직 경기 결과가 없습니다." 표시됨`);
          } else {
            console.log(`      ℹ️  경기 없음`);
          }
        }
        console.log('');
      }
    }

    // 5. 샘플 경기 결과 확인
    if (matchesWithResults.length > 0) {
      console.log('📝 샘플 경기 결과 (최근 5개):\n');
      matchesWithResults.slice(-5).forEach(match => {
        console.log(`  ${match.date} ${match.time || ''} | ${match.round} | ${match.group_name}조 | ${match.home_score}:${match.away_score} | ${match.status}`);
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkStandingsData();
