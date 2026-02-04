/**
 * 리그별 경기 수 확인 스크립트
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

async function checkMatchesByRound() {
  console.log('=== 리그별 경기 수 확인 ===\n');
  
  // 1차 리그 경기 조회
  const { data: matches1st, error: error1st } = await supabase
    .from('matches')
    .select('id, round, group_name, date, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .eq('round', '1차');
  
  if (error1st) {
    console.error('1차 리그 경기 조회 오류:', error1st);
  } else {
    console.log(`1차 리그 경기: ${matches1st?.length || 0}개`);
    
    // 조별로 그룹화
    const matchesByGroup = {};
    matches1st?.forEach(m => {
      if (!matchesByGroup[m.group_name]) {
        matchesByGroup[m.group_name] = [];
      }
      matchesByGroup[m.group_name].push(m);
    });
    
    console.log('\n1차 리그 조별 경기 수:');
    Object.keys(matchesByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(group => {
      console.log(`  ${group}조: ${matchesByGroup[group].length}개`);
    });
  }
  
  // 2차 리그 경기 조회
  const { data: matches2nd, error: error2nd } = await supabase
    .from('matches')
    .select('id, round, group_name, date, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)')
    .eq('round', '2차');
  
  if (error2nd) {
    console.error('2차 리그 경기 조회 오류:', error2nd);
  } else {
    console.log(`\n2차 리그 경기: ${matches2nd?.length || 0}개`);
    
    if (matches2nd && matches2nd.length > 0) {
      // 조별로 그룹화
      const matchesByGroup = {};
      matches2nd.forEach(m => {
        if (!matchesByGroup[m.group_name]) {
          matchesByGroup[m.group_name] = [];
        }
        matchesByGroup[m.group_name].push(m);
      });
      
      console.log('\n2차 리그 조별 경기 수:');
      Object.keys(matchesByGroup).sort((a, b) => parseInt(a) - parseInt(b)).forEach(group => {
        console.log(`  ${group}조: ${matchesByGroup[group].length}개`);
      });
    } else {
      console.log('2차 리그 경기가 없습니다.');
    }
  }
}

checkMatchesByRound().catch(console.error);
