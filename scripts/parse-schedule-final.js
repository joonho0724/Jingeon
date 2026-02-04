/**
 * 대진표 HTML 파일 최종 파싱 스크립트
 * 조별 팀 목록과 경기 정보를 추출
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// U12와 U11 구분 찾기
const isU12 = textContent.includes('U12');
const isU11 = textContent.includes('U11');
console.log('대진표 타입:', isU12 ? 'U12' : isU11 ? 'U11' : '알 수 없음');

// 조별 팀 목록 찾기
// "1조" 다음에 팀명들이 나오는 패턴 찾기
const groupTeamPattern = /(\d+)조\s+([^조]+?)(?=\d+조|날짜|$)/g;
const groupTeams = {};
let groupMatch;

// 조별로 팀 목록 추출 시도
for (let i = 1; i <= 16; i++) {
  const groupIdx = textContent.indexOf(`${i}조`);
  if (groupIdx === -1) continue;
  
  // 조 다음 200자 확인
  const groupText = textContent.substring(groupIdx, groupIdx + 500);
  
  // 팀명 패턴 찾기 (진건, FC진건 등)
  const teamMatches = groupText.match(/(진건초|진건|FC진건[_\w]*)/gi);
  if (teamMatches) {
    groupTeams[i] = [...new Set(teamMatches)];
    console.log(`${i}조 팀:`, groupTeams[i]);
  }
}

// 날짜별 경기 정보 추출
const matches = [];
const datePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)/g;
let dateMatch;
let currentDate = null;

while ((dateMatch = datePattern.exec(textContent)) !== null) {
  const month = parseInt(dateMatch[1]);
  const day = parseInt(dateMatch[2]);
  currentDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // 이 날짜 다음에 나오는 경기들 찾기
  const dateEnd = dateMatch.index + dateMatch[0].length;
  const nextDateMatch = datePattern.exec(textContent);
  const dateRangeEnd = nextDateMatch ? nextDateMatch.index : textContent.length;
  
  // 이 날짜 범위 내의 경기 찾기
  const dateText = textContent.substring(dateEnd, dateRangeEnd);
  const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
  let match;
  
  while ((match = matchPattern.exec(dateText)) !== null) {
    matches.push({
      number: parseInt(match[1]),
      date: currentDate,
      time: `${match[2]}:${match[3]}`,
      venue: match[4],
      homeTeamNumber: parseInt(match[5]),
      awayTeamNumber: parseInt(match[6]),
      // 조 정보는 나중에 추가 필요
    });
  }
  
  // datePattern을 다시 초기화 (다음 날짜 찾기 위해)
  datePattern.lastIndex = dateRangeEnd;
}

console.log(`\n총 ${matches.length}개 경기 추출`);

// 조 정보 추가 (경기 번호와 조 매핑 필요)
// 실제 HTML 구조에 따라 수정 필요
// 예: 경기 1-16은 1조, 경기 17-32는 2조 등

// 결과 저장
const output = {
  ageGroup: isU12 ? 'U12' : isU11 ? 'U11' : 'U12',
  groupTeams,
  matches: matches.slice(0, 50) // 처음 50개만
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'parsed-schedule-final.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('\n결과를 parsed-schedule-final.json에 저장했습니다.');
console.log('\n처음 20개 경기:');
matches.slice(0, 20).forEach(m => {
  console.log(`경기 ${m.number}: ${m.date} ${m.time} (${m.venue}) - 팀${m.homeTeamNumber} vs 팀${m.awayTeamNumber}`);
});
