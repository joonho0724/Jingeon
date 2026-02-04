/**
 * 대진표 HTML 파일 상세 파싱 스크립트
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');

const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// HTML에서 테이블 구조 찾기
// "조" 다음에 나오는 내용 확인
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// "1조" 주변 텍스트 찾기
const idx1 = textContent.indexOf('1조');
const idx2 = textContent.indexOf('2조');
const idx3 = textContent.indexOf('3조');

console.log('1조 주변 (500자):');
console.log(textContent.substring(Math.max(0, idx1 - 50), idx1 + 450));
console.log('\n\n2조 주변 (500자):');
console.log(textContent.substring(Math.max(0, idx2 - 50), idx2 + 450));

// 날짜와 조 정보가 함께 있는 패턴 찾기
// 예: "2/6(금)" 다음에 조별 경기 정보
const schedulePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)\s+([^2\/]+?)(?=\d{1,2}\/\d{1,2}\(|$)/g;
const schedules = [];
let scheduleMatch;
while ((scheduleMatch = schedulePattern.exec(textContent)) !== null) {
  const month = parseInt(scheduleMatch[1]);
  const day = parseInt(scheduleMatch[2]);
  const content = scheduleMatch[3].trim();
  
  // 조별 경기 정보 추출
  const groupMatches = content.match(/(\d+)조\s+([^조]+?)(?=\d+조|$)/g);
  
  schedules.push({
    date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    month,
    day,
    content: content.substring(0, 200), // 처음 200자만
    groups: groupMatches || []
  });
}

console.log('\n\n=== 날짜별 스케줄 ===');
schedules.slice(0, 3).forEach(s => {
  console.log(`\n날짜: ${s.date}`);
  console.log(`조 정보: ${s.groups.length}개`);
  s.groups.slice(0, 3).forEach(g => console.log(`  - ${g.substring(0, 100)}`));
});

// 경기 정보를 더 정확히 추출
// "◯ 숫자 시간 (경기장) 팀1 : 팀2" 패턴
const matchDetails = [];
const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+([^:]+?)\s*:\s*([^\s◯]+)/g;
let match;
while ((match = matchPattern.exec(textContent)) !== null) {
  matchDetails.push({
    number: parseInt(match[1]),
    time: `${match[2]}:${match[3]}`,
    venue: match[4],
    homeTeam: match[5].trim(),
    awayTeam: match[6].trim()
  });
}

console.log('\n\n=== 경기 상세 정보 (처음 20개) ===');
matchDetails.slice(0, 20).forEach(m => {
  console.log(`경기 ${m.number}: ${m.homeTeam} vs ${m.awayTeam} - ${m.time} (${m.venue})`);
});

// 결과를 JSON으로 저장
fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'parsed-schedule-detailed.json'),
  JSON.stringify({ schedules, matches: matchDetails }, null, 2),
  'utf-8'
);

console.log('\n상세 파싱 결과를 parsed-schedule-detailed.json에 저장했습니다.');
