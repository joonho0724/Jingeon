/**
 * 누락된 경기를 찾아서 추가하는 스크립트
 * 7조 위례FC U12 관련 경기 확인 및 추가
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

async function fixMissingMatches() {
  console.log('누락된 경기 확인 및 추가 중...\n');

  // 7조 U11 팀 목록
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('group_name', '7')
    .eq('age_group', 'U11')
    .order('name');

  console.log('7조 U11 팀 목록:');
  teams.forEach(team => {
    console.log(`- ${team.name} (ID: ${team.id})`);
  });

  // 각 팀별로 필요한 경기 확인
  const teamIds = teams.map(t => t.id);
  const teamNames = teams.map(t => t.name);

  console.log('\n누락된 경기 확인:');
  const missingMatches = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const team1 = teams[i];
      const team2 = teams[j];

      // 이미 경기가 있는지 확인
      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .eq('round', '1차')
        .eq('group_name', '7')
        .or(`and(home_team_id.eq.${team1.id},away_team_id.eq.${team2.id}),and(home_team_id.eq.${team2.id},away_team_id.eq.${team1.id})`)
        .limit(1);

      if (!existing || existing.length === 0) {
        console.log(`❌ 누락: ${team1.name} vs ${team2.name}`);
        missingMatches.push({
          team1,
          team2,
          homeTeam: team1, // 기본적으로 첫 번째 팀을 홈팀으로
          awayTeam: team2,
        });
      }
    }
  }

  if (missingMatches.length === 0) {
    console.log('\n✅ 모든 경기가 등록되어 있습니다.');
    return;
  }

  console.log(`\n총 ${missingMatches.length}개 경기가 누락되었습니다.`);
  console.log('\n원본 대진표를 확인하여 다음 정보를 입력해주세요:');
  console.log('- 날짜');
  console.log('- 시간');
  console.log('- 경기장');
  console.log('- 홈팀/원정팀 결정');
  
  console.log('\n누락된 경기 목록:');
  missingMatches.forEach((m, idx) => {
    console.log(`${idx + 1}. ${m.team1.name} vs ${m.team2.name}`);
  });

  // 사용자가 수동으로 입력할 수 있도록 정보 제공
  console.log('\n=== 수동 추가 가이드 ===');
  console.log('관리자 페이지에서 다음 경기들을 수동으로 추가해주세요:');
  missingMatches.forEach(m => {
    console.log(`\n- ${m.team1.name} vs ${m.team2.name}`);
    console.log(`  조: 7조`);
    console.log(`  리그: 1차`);
    console.log(`  연령대: U11`);
  });
}

fixMissingMatches().catch(console.error);
