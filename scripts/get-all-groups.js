/**
 * 모든 조 목록 확인 스크립트
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

async function getAllGroups() {
  // 모든 팀의 조 정보 조회
  const { data: teams, error } = await supabase
    .from('teams')
    .select('age_group, group_name')
    .order('age_group', { ascending: true })
    .order('group_name', { ascending: true });
  
  if (error) {
    console.error('팀 조회 오류:', error);
    return;
  }
  
  // 연령대별, 조별로 그룹화
  const groups = new Set();
  
  teams?.forEach(team => {
    groups.add(`${team.age_group}-${team.group_name}`);
  });
  
  const groupsArray = Array.from(groups).sort();
  
  console.log('모든 조 목록:');
  groupsArray.forEach(group => {
    const [ageGroup, groupName] = group.split('-');
    console.log(`  ${ageGroup} ${groupName}조`);
  });
  
  console.log(`\n총 ${groupsArray.length}개 조`);
}

getAllGroups().catch(console.error);
