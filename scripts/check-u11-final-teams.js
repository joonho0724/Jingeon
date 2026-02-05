/**
 * U11 최종 참가 팀 수 확인 (63개)
 * 
 * 사용법: node scripts/check-u11-final-teams.js
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

async function checkU11FinalTeams() {
  console.log('🔍 U11 최종 참가 팀 수 확인 중 (목표: 63개)...\n');

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
      console.log(`   ${teams.length - 63}개의 중복 또는 불필요한 팀이 있습니다.\n`);
    } else {
      console.log(`⚠️  경고: U11 팀 수가 부족합니다! (현재: ${teams.length}개)`);
      console.log(`   ${63 - teams.length}개의 팀이 누락되었습니다.\n`);
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
    let totalExpected = 0;
    sortedGroups.forEach(groupName => {
      const count = groupsByCount[groupName].length;
      const expected = groupName === '16' ? 3 : 4; // 16조는 3팀
      totalExpected += expected;
      const status = count === expected ? '✅' : count > expected ? '⚠️  (초과)' : '❌ (부족)';
      console.log(`  ${groupName}조: ${count}개 팀 ${status} (예상: ${expected}개)`);
    });

    console.log(`\n📈 총계: ${teams.length}개 팀 (예상: ${totalExpected}개)`);

    // 조별 팀 목록 출력 (간단 버전)
    console.log('\n📋 조별 팀 목록 (간단):\n');
    sortedGroups.forEach(groupName => {
      const groupTeams = groupsByCount[groupName];
      console.log(`${groupName}조 (${groupTeams.length}개):`);
      groupTeams.forEach(team => {
        console.log(`  ${team.group_team_no1 || '?'}. ${team.name}`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkU11FinalTeams();
