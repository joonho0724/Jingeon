const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTeams() {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('name, age_group')
    .order('name');

  if (error) {
    console.error('오류:', error);
    return;
  }

  console.log(`전체 팀 수: ${teams.length}`);
  console.log('\n고정된 내 팀 목록:');
  const FIXED_MY_TEAM_NAMES = ['진건초', 'FC진건', 'FC진건레드', 'FC진건블루'];
  
  FIXED_MY_TEAM_NAMES.forEach(name => {
    const found = teams.find(t => t.name === name);
    if (found) {
      console.log(`  ✅ ${name} (${found.age_group}) - 찾음`);
    } else {
      console.log(`  ❌ ${name} - 찾지 못함`);
      // 유사한 이름 찾기
      const similar = teams.filter(t => t.name.includes('진건') || t.name.includes('FC진건'));
      if (similar.length > 0) {
        console.log(`     유사한 팀: ${similar.map(t => `${t.name} (${t.age_group})`).join(', ')}`);
      }
    }
  });

  console.log('\n전체 팀 목록 (처음 30개):');
  teams.slice(0, 30).forEach(t => {
    console.log(`  - ${t.name} (${t.age_group})`);
  });
}

checkTeams().catch(console.error);
