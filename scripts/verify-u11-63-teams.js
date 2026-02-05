/**
 * U11 팀 수 검증 스크립트 (63개 확인)
 * 
 * 사용법: node scripts/verify-u11-63-teams.js
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

async function verifyU11Teams() {
  console.log('🔍 U11 팀 수 검증 중 (목표: 63개)...\n');

  try {
    // U11 팀 조회
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .eq('age_group', 'U11')
      .order('group_name1')
      .order('group_team_no1');

    if (error) {
      console.error('❌ 팀 목록 조회 실패:', error);
      return;
    }

    console.log(`✅ 현재 U11 팀 수: ${teams.length}개\n`);

    if (teams.length === 63) {
      console.log(`✅ U11 팀 수가 정확합니다! (63개)\n`);
    } else if (teams.length > 63) {
      console.log(`⚠️  경고: U11 팀 수가 63개를 초과합니다! (현재: ${teams.length}개)`);
      console.log(`   ${teams.length - 63}개의 중복 팀이 있습니다.\n`);
    } else {
      console.log(`⚠️  경고: U11 팀 수가 63개보다 적습니다! (현재: ${teams.length}개)`);
      console.log(`   ${63 - teams.length}개의 팀이 부족합니다.\n`);
    }

    // 조별 팀 수 확인
    const groupsByCount = {};
    teams.forEach(team => {
      const groupName = team.group_name1 || '미지정';
      if (!groupsByCount[groupName]) {
        groupsByCount[groupName] = [];
      }
      groupsByCount[groupName].push(team);
    });

    console.log('📊 조별 팀 수:\n');
    const sortedGroups = Object.keys(groupsByCount).sort((a, b) => parseInt(a) - parseInt(b));
    sortedGroups.forEach(groupName => {
      const count = groupsByCount[groupName].length;
      let status = '';
      if (groupName === '16') {
        status = count === 3 ? '✅ (16조는 3팀)' : count > 3 ? '⚠️  (초과)' : '❌ (부족)';
      } else {
        status = count === 4 ? '✅' : count > 4 ? '⚠️  (초과)' : '❌ (부족)';
      }
      console.log(`  ${groupName}조: ${count}개 팀 ${status}`);
    });

    // 4팀을 초과하는 조 확인
    const overLimitGroups = sortedGroups.filter(groupName => {
      const count = groupsByCount[groupName].length;
      if (groupName === '16') {
        return count > 3;
      }
      return count > 4;
    });

    if (overLimitGroups.length > 0) {
      console.log(`\n⚠️  4팀을 초과하는 조: ${overLimitGroups.join(', ')}`);
      overLimitGroups.forEach(groupName => {
        const groupTeams = groupsByCount[groupName];
        console.log(`\n  ${groupName}조 상세 (${groupTeams.length}개):`);
        groupTeams.forEach(team => {
          console.log(`    - ${team.name} (ID: ${team.id}, 팀번호: ${team.group_team_no1 || 'N/A'})`);
        });
      });
    }

    // 전체 팀 목록 (간단 버전)
    console.log('\n📝 전체 U11 팀 목록:\n');
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (${team.group_name1}조, 팀번호: ${team.group_team_no1 || 'N/A'})`);
    });

    console.log(`\n📊 요약:`);
    console.log(`  - 목표: 63개 팀`);
    console.log(`  - 현재: ${teams.length}개 팀`);
    console.log(`  - 차이: ${teams.length - 63}개 ${teams.length > 63 ? '(초과)' : teams.length < 63 ? '(부족)' : '(정확)'}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

verifyU11Teams();
