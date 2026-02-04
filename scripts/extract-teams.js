/**
 * HTML에서 팀명 추출 스크립트
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 팀명 패턴 찾기 (한글 + 초/중/고/FC/클럽 등)
const teamPattern = /[가-힣]+(?:초|중|고|FC|클럽|유스|축구단|팀|고등학교|중학교|초등학교)/g;
const teams = textContent.match(teamPattern);
const uniqueTeams = teams ? [...new Set(teams)].filter(t => t.length > 1 && t.length < 30) : [];

console.log('찾은 팀명:');
uniqueTeams.forEach(t => console.log('  -', t));
console.log(`\n총 ${uniqueTeams.length}개 팀명 발견`);

// 조별 팀 정보 찾기
// "1조" 다음에 나오는 팀명들 찾기
for (let i = 1; i <= 16; i++) {
  const groupIdx = textContent.indexOf(`${i}조`);
  if (groupIdx === -1) continue;
  
  // 조 다음 300자 확인
  const groupText = textContent.substring(groupIdx, groupIdx + 300);
  const groupTeams = groupText.match(teamPattern);
  
  if (groupTeams) {
    const uniqueGroupTeams = [...new Set(groupTeams)];
    console.log(`\n${i}조 팀:`, uniqueGroupTeams.join(', '));
  }
}
