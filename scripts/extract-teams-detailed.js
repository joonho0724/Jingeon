/**
 * HTML에서 조별 팀 구성 정보 상세 추출
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 팀명 패턴
const teamPattern = /[가-힣]+(?:초|중|고|FC|클럽|유스|축구단|팀|고등학교|중학교|초등학교)/g;

// "조" 다음에 나오는 팀명들 찾기
// HTML 구조: "1조 팀1 팀2 팀3 팀4" 형식일 가능성
console.log('조별 팀 구성 추출:\n');

for (let i = 1; i <= 16; i++) {
  const groupPattern = new RegExp(`${i}조\\s+([^조]+?)(?=\\d+조|날짜|$)`, 'g');
  const match = groupPattern.exec(textContent);
  
  if (match) {
    const groupText = match[1].substring(0, 200); // 처음 200자만
    const teams = groupText.match(teamPattern);
    
    if (teams) {
      const uniqueTeams = [...new Set(teams)];
      console.log(`${i}조:`, uniqueTeams.join(', '));
    } else {
      // 팀명이 없으면 숫자로 표시된 것일 수 있음
      // "1조 1 2 3 4" 형식
      const numbers = groupText.match(/\b(\d+)\b/g);
      if (numbers && numbers.length >= 2) {
        console.log(`${i}조: 팀 번호만 표시됨 (${numbers.slice(0, 4).join(', ')})`);
      }
    }
  }
}

// 대진표 헤더 부분에서 팀 목록 찾기
// "날짜 조 1조 2조 ..." 부분 확인
const headerIdx = textContent.indexOf('날짜 조');
if (headerIdx !== -1) {
  const headerText = textContent.substring(Math.max(0, headerIdx - 500), headerIdx + 1000);
  console.log('\n\n대진표 헤더 부분:');
  console.log(headerText.substring(0, 500));
}
