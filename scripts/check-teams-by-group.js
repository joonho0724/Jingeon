/**
 * 조별 팀 목록 확인 스크립트
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

async function checkTeamsByGroup() {
  console.log('=== 조별 팀 목록 확인 ===\n');
  
  // 모든 팀 조회
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .order('age_group', { ascending: true })
    .order('group_name', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) {
    console.error('팀 조회 오류:', error);
    return;
  }
  
  // 연령대별, 조별로 그룹화
  const teamsByAgeAndGroup = {};
  
  teams?.forEach(team => {
    const key = `${team.age_group}-${team.group_name}`;
    if (!teamsByAgeAndGroup[key]) {
      teamsByAgeAndGroup[key] = [];
    }
    teamsByAgeAndGroup[key].push(team);
  });
  
  // 결과 출력
  ['U11', 'U12'].forEach(ageGroup => {
    console.log(`\n${ageGroup}:`);
    for (let i = 1; i <= 16; i++) {
      const groupName = String(i);
      const key = `${ageGroup}-${groupName}`;
      const groupTeams = teamsByAgeAndGroup[key] || [];
      
      if (groupTeams.length > 0) {
        console.log(`  ${groupName}조: ${groupTeams.length}개 팀`);
        groupTeams.forEach(team => {
          console.log(`    - ${team.name}`);
        });
      }
    }
  });
  
  console.log(`\n총 ${teams?.length || 0}개 팀`);
}

checkTeamsByGroup().catch(console.error);
