/**
 * 대진표 데이터를 데이터베이스에 일괄 삽입하는 최종 스크립트
 * 
 * 사용법: 
 * 1. .env.local 파일에 Supabase 환경 변수 설정
 * 2. node scripts/import-matches-final.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// HTML 파일 파싱
const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// U12 대진표인지 확인
const isU12 = textContent.includes('U12');
const ageGroup = isU12 ? 'U12' : 'U11';

console.log(`\n=== ${ageGroup} 1차 리그 대진표 파싱 시작 ===\n`);

// 조별 팀 매핑 (실제 HTML에서 추출하거나 수동으로 설정)
// HTML 구조에 따라 수정 필요
const groupTeamMapping = {
  // 예시: 각 조의 팀 번호와 실제 팀명 매핑
  // 실제 HTML 구조를 확인한 후 수정 필요
};

// 경기 번호와 조 매핑
// HTML 구조를 보면 경기 1-16은 1조, 경기 17-32는 2조 등으로 추정
// 실제 구조에 맞게 수정 필요
function getGroupFromMatchNumber(matchNumber) {
  // 경기 번호를 16으로 나눈 몫 + 1이 조 번호 (1-16조)
  const groupNumber = Math.floor((matchNumber - 1) / 16) + 1;
  return groupNumber <= 16 ? groupNumber : 16;
}

// 날짜별 경기 정보 추출
const matches = [];
const datePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)/g;
let dateMatch;
let currentDate = null;
let dateIndex = 0;

// 날짜 배열 생성
const dates = [];
while ((dateMatch = datePattern.exec(textContent)) !== null) {
  const month = parseInt(dateMatch[1]);
  const day = parseInt(dateMatch[2]);
  dates.push(`2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}
const uniqueDates = [...new Set(dates)];

console.log('대회 기간:', uniqueDates[0], '~', uniqueDates[uniqueDates.length - 1]);

// 각 날짜별로 경기 추출
uniqueDates.forEach((date, dateIdx) => {
  const datePattern2 = new RegExp(`(\\d{1,2})\\/(\\d{1,2})\\([^)]+\\)`, 'g');
  let dateMatch2;
  const dateMatches = [];
  
  while ((dateMatch2 = datePattern2.exec(textContent)) !== null) {
    const month = parseInt(dateMatch2[1]);
    const day = parseInt(dateMatch2[2]);
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr === date) {
      dateMatches.push({
        index: dateMatch2.index,
        full: dateMatch2[0]
      });
    }
  }
  
  if (dateMatches.length > 0) {
    const dateStart = dateMatches[0].index + dateMatches[0].full.length;
    const dateEnd = dateMatches.length > 1 ? dateMatches[1].index : textContent.length;
    const dateText = textContent.substring(dateStart, dateEnd);
    
    // 이 날짜의 경기들 추출
    const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
    let match;
    
    while ((match = matchPattern.exec(dateText)) !== null) {
      const matchNumber = parseInt(match[1]);
      const groupNumber = getGroupFromMatchNumber(matchNumber);
      
      matches.push({
        number: matchNumber,
        date: date,
        time: `${match[2]}:${match[3]}`,
        venue: match[4],
        group: groupNumber,
        homeTeamNumber: parseInt(match[5]),
        awayTeamNumber: parseInt(match[6]),
      });
    }
  }
});

console.log(`\n총 ${matches.length}개 경기 추출\n`);

// 팀 목록 조회
async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('age_group', ageGroup);
  
  if (error) {
    console.error('팀 조회 오류:', error);
    return [];
  }
  
  return data || [];
}

// 조별 팀 매핑 생성
async function createGroupTeamMapping() {
  const teams = await getTeams();
  console.log(`\n등록된 팀 (${ageGroup}):`, teams.map(t => t.name).join(', '));
  
  // 조별로 팀 그룹화
  const teamsByGroup = {};
  teams.forEach(team => {
    if (!teamsByGroup[team.group_name]) {
      teamsByGroup[team.group_name] = [];
    }
    teamsByGroup[team.group_name].push(team);
  });
  
  // 각 조의 팀을 번호로 매핑 (순서대로 1, 2, 3, 4번)
  const groupMapping = {};
  Object.keys(teamsByGroup).forEach(groupName => {
    const groupTeams = teamsByGroup[groupName].sort((a, b) => a.name.localeCompare(b.name));
    groupMapping[groupName] = {};
    groupTeams.forEach((team, idx) => {
      groupMapping[groupName][idx + 1] = team.id;
    });
  });
  
  return groupMapping;
}

// 경기 삽입
async function insertMatches() {
  const groupMapping = await createGroupTeamMapping();
  
  console.log('\n조별 팀 매핑:');
  Object.keys(groupMapping).forEach(groupName => {
    console.log(`  ${groupName}조:`, Object.keys(groupMapping[groupName]).map(num => {
      const teamId = groupMapping[groupName][num];
      // 팀명 찾기
      const teams = require('./get-teams-cache.json'); // 임시
      return `팀${num}`;
    }).join(', '));
  });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const match of matches) {
    try {
      const groupName = match.group.toString();
      const homeTeamId = groupMapping[groupName]?.[match.homeTeamNumber];
      const awayTeamId = groupMapping[groupName]?.[match.awayTeamNumber];
      
      if (!homeTeamId || !awayTeamId) {
        console.error(`경기 ${match.number} 스킵: 조 ${groupName}, 팀${match.homeTeamNumber} vs 팀${match.awayTeamNumber} (팀을 찾을 수 없음)`);
        errorCount++;
        continue;
      }
      
      const { error } = await supabase
        .from('matches')
        .insert({
          date: match.date,
          time: match.time,
          round: '1차',
          group_name: groupName,
          venue: match.venue,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          status: '예정',
        });
      
      if (error) {
        // 중복 경기는 무시
        if (error.code === '23505') {
          console.log(`경기 ${match.number} 이미 존재함`);
        } else {
          console.error(`경기 ${match.number} 삽입 오류:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`✓ 경기 ${match.number}: ${match.date} ${match.time} (${match.venue}) - 조${groupName} 팀${match.homeTeamNumber} vs 팀${match.awayTeamNumber}`);
        successCount++;
      }
    } catch (err) {
      console.error(`경기 ${match.number} 삽입 중 예외:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${errorCount}개`);
}

// 실행
insertMatches().catch(console.error);
