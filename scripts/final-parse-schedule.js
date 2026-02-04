/**
 * 대진표 HTML 파일 최종 파싱 스크립트
 * 조별 팀명 매핑과 경기 정보를 모두 추출
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isU12 = textContent.includes('U12');
const ageGroup = isU12 ? 'U12' : 'U11';

console.log(`\n=== ${ageGroup} 1차 리그 대진표 파싱 ===\n`);

// 조별 팀명 매핑 추출
// 각 조의 경기 정보 다음에 팀명이 나오는 구조
const groupTeamMapping = {};

// 1조부터 16조까지 처리
for (let groupNum = 1; groupNum <= 16; groupNum++) {
  const groupKeyword = groupNum + '조';
  const groupIdx = textContent.indexOf(groupKeyword);
  
  if (groupIdx === -1) continue;
  
  // 조 시작 위치에서 3000자 범위 내에서 팀 정보 찾기
  const searchRange = textContent.substring(groupIdx, groupIdx + 3000);
  
  // 팀명 패턴: 숫자(1-4) 다음에 한글 팀명
  // 여러 패턴 시도
  const teams = {};
  
  for (let teamNum = 1; teamNum <= 4; teamNum++) {
    // 패턴 1: "1 " 다음에 팀명
    // 패턴 2: "1번" 다음에 팀명  
    // 패턴 3: 숫자와 팀명이 가까이 있는 경우
    const patterns = [
      new RegExp(`\\b${teamNum}\\s+([가-힣][^0-9\\s]{3,50})`, 'g'),
      new RegExp(`${teamNum}번\\s+([가-힣][^0-9\\s]{3,50})`, 'g'),
      new RegExp(`\\b${teamNum}\\b[^0-9]*([가-힣]+(?:FC|클럽|초|중|고|U12|U11|서초|리거|월드컵|리틀)[^0-9\\s]{0,40})`, 'g'),
    ];
    
    for (const pattern of patterns) {
      const matches = searchRange.match(pattern);
      if (matches && matches.length > 0) {
        // 첫 번째 매칭에서 팀명 추출
        const match = pattern.exec(searchRange);
        if (match && match[1]) {
          let teamName = match[1].trim();
          // 불필요한 문자 제거
          teamName = teamName.replace(/[^\w가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
          // 너무 짧거나 긴 경우 제외
          if (teamName.length >= 3 && teamName.length <= 50) {
            teams[teamNum] = teamName;
            break;
          }
        }
      }
    }
  }
  
  if (Object.keys(teams).length > 0) {
    groupTeamMapping[groupNum] = teams;
    console.log(`${groupNum}조:`);
    Object.keys(teams).forEach(num => {
      console.log(`  ${num}번: ${teams[num]}`);
    });
    console.log();
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
  
  // 경기 패턴: ◯ 경기번호 시간 (경기장) 팀번호 : 팀번호
  const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
  let match;
  
  while ((match = matchPattern.exec(dateText)) !== null) {
    const matchNumber = parseInt(match[1]);
    
    // 경기 번호로 조 결정
    // 경기 번호를 16으로 나눈 몫 + 1이 조 번호
    // 단, 경기 번호가 순차적이지 않을 수 있으므로 조정 필요
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
  matches
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'final-parsed-schedule.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('파싱 결과를 final-parsed-schedule.json에 저장했습니다.');
console.log(`\n조별 팀 매핑: ${Object.keys(groupTeamMapping).length}개 조`);
console.log(`경기 수: ${matches.length}개`);

// 샘플 출력
if (matches.length > 0) {
  console.log('\n처음 10개 경기:');
  matches.slice(0, 10).forEach(m => {
    const homeTeam = groupTeamMapping[m.group]?.[m.homeTeamNumber] || `팀${m.homeTeamNumber}`;
    const awayTeam = groupTeamMapping[m.group]?.[m.awayTeamNumber] || `팀${m.awayTeamNumber}`;
    console.log(`  경기 ${m.number}: ${m.date} ${m.time} (${m.venue}) - 조${m.group} ${homeTeam} vs ${awayTeam}`);
  });
}
