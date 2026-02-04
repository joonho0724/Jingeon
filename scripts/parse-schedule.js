/**
 * 대진표 HTML 파일 파싱 스크립트
 * Node.js로 실행: node scripts/parse-schedule.js
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');

console.log('HTML 파일 읽는 중...');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// HTML에서 텍스트 내용 추출
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ') // HTML 태그 제거
  .replace(/\s+/g, ' ') // 공백 정리
  .trim();

// 날짜 패턴: 2/6(금), 2/7(토) 등
const datePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)/g;
const dates = [];
let dateMatch;
while ((dateMatch = datePattern.exec(textContent)) !== null) {
  dates.push({
    month: parseInt(dateMatch[1]),
    day: parseInt(dateMatch[2]),
    full: dateMatch[0]
  });
}
console.log('\n찾은 날짜:', dates.slice(0, 10));

// 경기 정보 패턴: ◯ 숫자 시간 (경기장코드) 팀1 : 팀2
// 예: ◯ 1 14:00 (A) 1 : 2
const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+([^:]+)\s*:\s*([^\s]+)/g;
const matches = [];
let matchMatch;
while ((matchMatch = matchPattern.exec(textContent)) !== null) {
  matches.push({
    number: parseInt(matchMatch[1]),
    hour: parseInt(matchMatch[2]),
    minute: parseInt(matchMatch[3]),
    venue: matchMatch[4],
    homeTeam: matchMatch[5].trim(),
    awayTeam: matchMatch[6].trim(),
    full: matchMatch[0]
  });
}
console.log('\n찾은 경기:', matches.length, '개');
matches.slice(0, 10).forEach(m => {
  console.log(`경기 ${m.number}: ${m.homeTeam} vs ${m.awayTeam} - ${m.hour}:${String(m.minute).padStart(2, '0')} (${m.venue})`);
});

// 날짜와 경기를 연결
// HTML 구조를 보면 날짜 다음에 경기들이 나오는 것 같음
// 실제 구조에 맞게 수정 필요

console.log('\n=== 파싱 결과 요약 ===');
console.log(`총 날짜: ${dates.length}개`);
console.log(`총 경기: ${matches.length}개`);

// JSON으로 저장
const output = {
  dates: dates,
  matches: matches
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'parsed-schedule.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('\n파싱 결과를 parsed-schedule.json에 저장했습니다.');
