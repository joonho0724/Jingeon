/**
 * 데이터베이스에 있는 조 목록 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGroups() {
  // 조별 팀 수 확인
  const { data: teams, error } = await supabase
    .from('teams')
    .select('group_name, age_group')
    .order('age_group', { ascending: true })
    .order('group_name', { ascending: true });
  
  if (error) {
    console.error('오류:', error);
    return;
  }
  
  const groupsByAge = {};
  teams?.forEach(team => {
    const key = `${team.age_group}-${team.group_name}`;
    if (!groupsByAge[key]) {
      groupsByAge[key] = 0;
    }
    groupsByAge[key]++;
  });
  
  console.log('=== 조별 팀 수 ===\n');
  Object.keys(groupsByAge).sort().forEach(key => {
    const [age, group] = key.split('-');
    console.log(`${age} ${group}조: ${groupsByAge[key]}개 팀`);
  });
  
  // 고유한 조 번호 추출
  const uniqueGroups = [...new Set(teams?.map(t => t.group_name) || [])].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });
  
  console.log(`\n총 조 수: ${uniqueGroups.length}개`);
  console.log('조 목록:', uniqueGroups.join(', '));
}

checkGroups().catch(console.error);
