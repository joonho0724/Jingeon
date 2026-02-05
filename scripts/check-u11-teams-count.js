/**
 * U11 팀 수 확인 스크립트
 * 
 * 사용법: node scripts/check-u11-teams-count.js
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

async function checkU11TeamsCount() {
  console.log('🔍 U11 팀 수 확인 중...\n');

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

    console.log(`✅ U11 팀 수: ${teams.length}개\n`);

    if (teams.length !== 56) {
      console.log(`⚠️  경고: U11 팀 수가 56개가 아닙니다! (현재: ${teams.length}개)\n`);
    } else {
      console.log(`✅ U11 팀 수가 정확합니다! (56개)\n`);
    }

    // 조별 팀 수 확인
    const groupsByCount = {};
    teams.forEach(team => {
      const groupName = team.group_name1 || '미지정';
      if (!groupsByCount[groupName]) {
        groupsByCount[groupName] = 0;
      }
      groupsByCount[groupName]++;
    });

    console.log('📊 조별 팀 수:\n');
    const sortedGroups = Object.keys(groupsByCount).sort((a, b) => parseInt(a) - parseInt(b));
    sortedGroups.forEach(groupName => {
      const count = groupsByCount[groupName];
      const status = count === 4 ? '✅' : count > 4 ? '⚠️  (초과)' : '❌ (부족)';
      console.log(`  ${groupName}조: ${count}개 팀 ${status}`);
    });

    // 조별 팀 목록 출력
    console.log('\n📋 조별 팀 목록:\n');
    sortedGroups.forEach(groupName => {
      const groupTeams = teams.filter(t => t.group_name1 === groupName);
      console.log(`${groupName}조 (${groupTeams.length}개):`);
      groupTeams.forEach(team => {
        console.log(`  - ${team.name} (팀번호: ${team.group_team_no1 || 'N/A'}, 전체번호: ${team.registration_no || 'N/A'})`);
      });
      console.log('');
    });

    // 전체 팀 목록 (간단 버전)
    console.log('\n📝 전체 U11 팀 목록:\n');
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (${team.group_name1}조, 팀번호: ${team.group_team_no1 || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkU11TeamsCount();
