/**
 * 대진표 HTML 파일에서 경기 정보를 파싱하여 데이터베이스에 일괄 삽입하는 완전한 스크립트
 * 
 * 사용법: 
 * 1. .env.local 파일에 Supabase 환경 변수 설정
 * 2. npm install dotenv (필요시)
 * 3. node scripts/import-matches-complete.js
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

// 경기 번호와 조 매핑 함수
// HTML 구조를 보면 각 날짜마다 조별로 경기가 배정됨
// 경기 번호를 16으로 나눈 몫 + 1이 조 번호로 추정
function getGroupFromMatchNumber(matchNumber) {
  // 경기 번호를 16으로 나눈 나머지로 조 결정
  // 경기 1-16: 1조, 경기 17-32: 2조, ... 경기 241-256: 16조
  const groupNumber = Math.floor((matchNumber - 1) / 16) + 1;
  return groupNumber <= 16 ? String(groupNumber) : '16';
}

// 날짜별 경기 정보 추출
const matches = [];
const datePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)/g;

// 모든 날짜 찾기
const allDates = [];
let dateMatch;
while ((dateMatch = datePattern.exec(textContent)) !== null) {
  const month = parseInt(dateMatch[1]);
  const day = parseInt(dateMatch[2]);
  const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  allDates.push({
    date: dateStr,
    index: dateMatch.index,
    full: dateMatch[0]
  });
}

// 중복 제거 및 정렬
const uniqueDates = [];
const seenDates = new Set();
allDates.forEach(d => {
  if (!seenDates.has(d.date)) {
    seenDates.add(d.date);
    uniqueDates.push(d);
  }
});

console.log(`대회 기간: ${uniqueDates[0].date} ~ ${uniqueDates[uniqueDates.length - 1].date}`);
console.log(`총 ${uniqueDates.length}일\n`);

// 각 날짜별로 경기 추출
uniqueDates.forEach((dateInfo, dateIdx) => {
  const dateStart = dateInfo.index + dateInfo.full.length;
  const dateEnd = dateIdx < uniqueDates.length - 1 
    ? uniqueDates[dateIdx + 1].index 
    : textContent.length;
  
  const dateText = textContent.substring(dateStart, dateEnd);
  
  // 이 날짜의 경기들 추출
  const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
  let match;
  
  while ((match = matchPattern.exec(dateText)) !== null) {
    const matchNumber = parseInt(match[1]);
    const groupNumber = getGroupFromMatchNumber(matchNumber);
    
    matches.push({
      number: matchNumber,
      date: dateInfo.date,
      time: `${match[2]}:${match[3]}`,
      venue: match[4],
      group: groupNumber,
      homeTeamNumber: parseInt(match[5]),
      awayTeamNumber: parseInt(match[6]),
    });
  }
});

console.log(`총 ${matches.length}개 경기 추출\n`);

// 팀 목록 조회 및 조별 매핑 생성
async function createGroupTeamMapping() {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('age_group', ageGroup)
    .order('group_name', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) {
    console.error('팀 조회 오류:', error);
    return {};
  }
  
  console.log(`등록된 팀 (${ageGroup}): ${teams.length}개`);
  teams.forEach(t => {
    console.log(`  - ${t.name} (${t.group_name}조)`);
  });
  console.log();
  
  // 조별로 팀 그룹화
  const teamsByGroup = {};
  teams.forEach(team => {
    const groupName = team.group_name;
    if (!teamsByGroup[groupName]) {
      teamsByGroup[groupName] = [];
    }
    teamsByGroup[groupName].push(team);
  });
  
  // 각 조의 팀을 번호로 매핑 (이름 순으로 정렬하여 1, 2, 3, 4번 할당)
  const groupMapping = {};
  Object.keys(teamsByGroup).forEach(groupName => {
    const groupTeams = teamsByGroup[groupName].sort((a, b) => a.name.localeCompare(b.name));
    groupMapping[groupName] = {};
    groupTeams.forEach((team, idx) => {
      groupMapping[groupName][idx + 1] = team.id;
      console.log(`  ${groupName}조 팀${idx + 1}: ${team.name} (${team.id.substring(0, 8)}...)`);
    });
  });
  console.log();
  
  return groupMapping;
}

// 경기 삽입
async function insertMatches() {
  const groupMapping = await createGroupTeamMapping();
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  console.log('경기 삽입 시작...\n');
  
  for (const match of matches) {
    try {
      const groupName = match.group;
      const homeTeamId = groupMapping[groupName]?.[match.homeTeamNumber];
      const awayTeamId = groupMapping[groupName]?.[match.awayTeamNumber];
      
      if (!homeTeamId || !awayTeamId) {
        console.error(`경기 ${match.number} 스킵: 조 ${groupName}, 팀${match.homeTeamNumber} vs 팀${match.awayTeamNumber} (팀을 찾을 수 없음)`);
        skipCount++;
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
          skipCount++;
        } else {
          console.error(`경기 ${match.number} 삽입 오류:`, error.message);
          errorCount++;
        }
      } else {
        if (successCount < 10 || successCount % 20 === 0) {
          console.log(`✓ 경기 ${match.number}: ${match.date} ${match.time} (${match.venue}) - 조${groupName} 팀${match.homeTeamNumber} vs 팀${match.awayTeamNumber}`);
        }
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
  console.log(`스킵 (중복/팀 없음): ${skipCount}개`);
  console.log(`총: ${matches.length}개`);
}

// 실행
insertMatches().catch(console.error);
