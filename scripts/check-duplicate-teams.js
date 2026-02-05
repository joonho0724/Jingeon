/**
 * 중복 팀 확인 스크립트
 * 
 * 사용법: node scripts/check-duplicate-teams.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateTeams() {
  console.log('🔍 중복 팀 확인 중...\n');

  try {
    // 모든 팀 조회
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('age_group')
      .order('group_name1')
      .order('name');

    if (error) {
      console.error('❌ 팀 목록 조회 실패:', error);
      return;
    }

    console.log(`✅ 전체 팀 수: ${teams.length}개\n`);

    // 연령대별, 조별로 그룹화
    const groupsByAge = {
      U11: {},
      U12: {},
    };

    teams.forEach(team => {
      if (!team.group_name1) return;
      
      const key = `${team.age_group}-${team.group_name1}`;
      if (!groupsByAge[team.age_group][team.group_name1]) {
        groupsByAge[team.age_group][team.group_name1] = [];
      }
      groupsByAge[team.age_group][team.group_name1].push(team);
    });

    // 각 조별로 팀 수 확인 및 중복 검사
    console.log('📊 조별 팀 현황:\n');

    for (const ageGroup of ['U11', 'U12']) {
      console.log(`\n${ageGroup}:`);
      for (const groupName of Object.keys(groupsByAge[ageGroup]).sort((a, b) => parseInt(a) - parseInt(b))) {
        const teamsInGroup = groupsByAge[ageGroup][groupName];
        console.log(`\n  ${groupName}조: ${teamsInGroup.length}개 팀`);
        
        if (teamsInGroup.length > 4) {
          console.log(`    ⚠️  경고: 4팀을 초과합니다!`);
        }

        // 팀명 정규화하여 중복 검사
        const normalizedNames = new Map();
        teamsInGroup.forEach(team => {
          const normalized = team.name
            .replace(/\s+/g, '')
            .toLowerCase()
            .replace(/fc/g, '')
            .replace(/u12/g, '')
            .replace(/u11/g, '');
          
          if (!normalizedNames.has(normalized)) {
            normalizedNames.set(normalized, []);
          }
          normalizedNames.get(normalized).push(team);
        });

        // 중복된 팀명 출력
        let hasDuplicates = false;
        normalizedNames.forEach((teamList, normalized) => {
          if (teamList.length > 1) {
            if (!hasDuplicates) {
              console.log(`    ⚠️  중복 가능성 있는 팀:`);
              hasDuplicates = true;
            }
            console.log(`      - "${normalized}":`);
            teamList.forEach(team => {
              console.log(`        • ID: ${team.id}, 이름: "${team.name}" (${team.age_group}, ${team.group_name1}조)`);
            });
          }
        });

        // 모든 팀 목록 출력
        if (!hasDuplicates) {
          teamsInGroup.forEach(team => {
            console.log(`    • ${team.name} (ID: ${team.id})`);
          });
        } else {
          teamsInGroup.forEach(team => {
            console.log(`    • ${team.name} (ID: ${team.id})`);
          });
        }
      }
    }

    // 전체 중복 팀 통계
    console.log('\n\n📈 중복 팀 통계:\n');
    const allNormalized = new Map();
    teams.forEach(team => {
      const normalized = team.name
        .replace(/\s+/g, '')
        .toLowerCase()
        .replace(/fc/g, '')
        .replace(/u12/g, '')
        .replace(/u11/g, '');
      
      if (!allNormalized.has(normalized)) {
        allNormalized.set(normalized, []);
      }
      allNormalized.get(normalized).push(team);
    });

    let totalDuplicates = 0;
    allNormalized.forEach((teamList, normalized) => {
      if (teamList.length > 1) {
        totalDuplicates += teamList.length - 1;
        console.log(`  "${normalized}": ${teamList.length}개`);
        teamList.forEach(team => {
          console.log(`    - ${team.name} (${team.age_group}, ${team.group_name1}조, ID: ${team.id})`);
        });
      }
    });

    if (totalDuplicates === 0) {
      console.log('  ✅ 중복된 팀이 없습니다.');
    } else {
      console.log(`\n  ⚠️  총 ${totalDuplicates}개의 중복 가능성이 있습니다.`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkDuplicateTeams();
