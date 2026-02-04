/**
 * 대진표 HTML 파일에서 조별 팀명 매핑과 경기 정보를 추출하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// U12 대진표인지 확인
const isU12 = textContent.includes('U12');
const ageGroup = isU12 ? 'U12' : 'U11';

console.log(`\n=== ${ageGroup} 1차 리그 대진표 파싱 ===\n`);

// 조별 팀명 매핑 추출
// 각 조 아래에 "팀명" 섹션이 있고, 1,2,3,4 번호와 실제 팀명이 매핑되어 있음
const groupTeamMapping = {};

for (let groupNum = 1; groupNum <= 16; groupNum++) {
  // 각 조의 경기 정보 다음에 팀명 매핑이 있음
  // "1조" 다음에 경기들이 있고, 그 다음에 "팀명" 섹션이 있음
  
  // 조 번호로 시작하는 부분 찾기
  const groupStartPattern = new RegExp(`${groupNum}조`, 'g');
  let groupMatch;
  const groupPositions = [];
  
  while ((groupMatch = groupStartPattern.exec(textContent)) !== null) {
    groupPositions.push(groupMatch.index);
  }
  
  if (groupPositions.length === 0) continue;
  
  // 각 조의 팀명 섹션 찾기
  // "팀명" 텍스트가 나오는 부분 찾기
  for (const groupPos of groupPositions) {
    // 조 시작 위치에서 2000자 범위 내에서 "팀명" 찾기
    const searchRange = textContent.substring(groupPos, groupPos + 2000);
    const teamNameIdx = searchRange.indexOf('팀명');
    
    if (teamNameIdx !== -1) {
      // "팀명" 다음에 나오는 팀 정보 추출
      const teamSection = searchRange.substring(teamNameIdx, teamNameIdx + 500);
      
      // 팀 번호와 팀명 매핑 추출
      // 패턴: "1" 다음에 팀명, "2" 다음에 팀명 등
      const teamMapping = {};
      
      // 1, 2, 3, 4 번호 찾기
      for (let teamNum = 1; teamNum <= 4; teamNum++) {
        const teamNumPattern = new RegExp(`\\b${teamNum}\\b[^0-9가-힣]*([가-힣][^0-9\\s]{2,30})`, 'g');
        const match = teamNumPattern.exec(teamSection);
        
        if (match && match[1]) {
          // 팀명 정리 (불필요한 문자 제거)
          let teamName = match[1].trim();
          // 숫자나 특수문자로 끝나는 경우 제거
          teamName = teamName.replace(/[0-9\s]+$/, '').trim();
          // U12, U11 같은 연령대 표시는 유지
          
          if (teamName.length > 1 && teamName.length < 50) {
            teamMapping[teamNum] = teamName;
          }
        }
      }
      
      if (Object.keys(teamMapping).length > 0) {
        groupTeamMapping[groupNum] = teamMapping;
        console.log(`${groupNum}조 팀 매핑:`);
        Object.keys(teamMapping).forEach(num => {
          console.log(`  ${num}번: ${teamMapping[num]}`);
        });
        console.log();
        break; // 첫 번째 매칭만 사용
      }
    }
  }
}

// 경기 정보 추출
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

// 중복 제거
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
  // 패턴: ◯ 경기번호 시간 (경기장) 팀번호 : 팀번호
  const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
  let match;
  
  while ((match = matchPattern.exec(dateText)) !== null) {
    const matchNumber = parseInt(match[1]);
    
    // 경기 번호로 조 결정
    // 경기 번호를 16으로 나눈 몫 + 1이 조 번호
    // 단, 경기 번호가 순차적이지 않을 수 있으므로 다른 방법 필요
    // 일단 경기 번호를 16으로 나눈 나머지로 조 추정
    let groupNumber = Math.floor((matchNumber - 1) / 16) + 1;
    if (groupNumber > 16) groupNumber = 16;
    
    matches.push({
      number: matchNumber,
      date: dateInfo.date,
      time: `${match[2]}:${match[3]}`,
      venue: match[4],
      group: String(groupNumber),
      homeTeamNumber: parseInt(match[5]),
      awayTeamNumber: parseInt(match[6]),
    });
  }
});

console.log(`총 ${matches.length}개 경기 추출\n`);

// 결과 저장
const output = {
  ageGroup,
  groupTeamMapping,
  matches: matches.slice(0, 100) // 처음 100개만
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'parsed-schedule-with-teams.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('파싱 결과를 parsed-schedule-with-teams.json에 저장했습니다.');
console.log(`\n조별 팀 매핑: ${Object.keys(groupTeamMapping).length}개 조`);
console.log(`경기 수: ${matches.length}개`);
