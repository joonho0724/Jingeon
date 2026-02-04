/**
 * HTML에서 조별 팀명 매핑을 정확히 추출하는 스크립트
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// "팀명" 텍스트가 나오는 모든 위치 찾기
const teamNamePositions = [];
let searchIndex = 0;
while (true) {
  const idx = textContent.indexOf('팀명', searchIndex);
  if (idx === -1) break;
  teamNamePositions.push(idx);
  searchIndex = idx + 1;
}

console.log(`"팀명" 텍스트 발견: ${teamNamePositions.length}개 위치\n`);

// 각 "팀명" 위치 주변에서 팀 정보 추출
teamNamePositions.forEach((pos, idx) => {
  const section = textContent.substring(Math.max(0, pos - 100), pos + 500);
  
  console.log(`\n=== 팀명 섹션 ${idx + 1} (위치: ${pos}) ===`);
  console.log(section.substring(0, 300));
  
  // 팀 번호와 팀명 추출 시도
  // 패턴 1: "1" 다음에 팀명
  // 패턴 2: "1번" 다음에 팀명
  // 패턴 3: 숫자와 팀명이 가까이 있는 경우
  
  const teamPatterns = [
    /\b1\b\s+([가-힣][^0-9\s]{2,40})/g,
    /\b2\b\s+([가-힣][^0-9\s]{2,40})/g,
    /\b3\b\s+([가-힣][^0-9\s]{2,40})/g,
    /\b4\b\s+([가-힣][^0-9\s]{2,40})/g,
  ];
  
  const foundTeams = {};
  teamPatterns.forEach((pattern, teamNum) => {
    const match = pattern.exec(section);
    if (match && match[1]) {
      let teamName = match[1].trim();
      // 불필요한 문자 제거
      teamName = teamName.replace(/[^\w가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (teamName.length > 2 && teamName.length < 50) {
        foundTeams[teamNum + 1] = teamName;
      }
    }
  });
  
  if (Object.keys(foundTeams).length > 0) {
    console.log('추출된 팀:');
    Object.keys(foundTeams).forEach(num => {
      console.log(`  ${num}번: ${foundTeams[num]}`);
    });
  } else {
    console.log('팀 정보를 찾을 수 없습니다.');
  }
});

// 조 번호와 "팀명"의 관계 찾기
console.log('\n\n=== 조 번호와 팀명 섹션 매핑 ===');
for (let groupNum = 1; groupNum <= 16; groupNum++) {
  const groupPattern = new RegExp(`${groupNum}조`, 'g');
  let groupMatch;
  const groupPositions = [];
  
  while ((groupMatch = groupPattern.exec(textContent)) !== null) {
    groupPositions.push(groupMatch.index);
  }
  
  if (groupPositions.length > 0) {
    // 각 조 위치에서 가장 가까운 "팀명" 찾기
    groupPositions.forEach(groupPos => {
      let nearestTeamNamePos = -1;
      let minDistance = Infinity;
      
      teamNamePositions.forEach(teamNamePos => {
        if (teamNamePos > groupPos) {
          const distance = teamNamePos - groupPos;
          if (distance < minDistance && distance < 3000) {
            minDistance = distance;
            nearestTeamNamePos = teamNamePos;
          }
        }
      });
      
      if (nearestTeamNamePos !== -1) {
        const section = textContent.substring(groupPos, nearestTeamNamePos + 500);
        console.log(`\n${groupNum}조 (위치: ${groupPos}) -> 팀명 섹션 (위치: ${nearestTeamNamePos}, 거리: ${minDistance})`);
        
        // 이 섹션에서 팀 정보 추출
        const teamSection = textContent.substring(nearestTeamNamePos, nearestTeamNamePos + 500);
        const teams = {};
        
        for (let teamNum = 1; teamNum <= 4; teamNum++) {
          // 여러 패턴 시도
          const patterns = [
            new RegExp(`\\b${teamNum}\\b\\s+([가-힣][^0-9\\s]{3,40})`, 'g'),
            new RegExp(`${teamNum}번\\s+([가-힣][^0-9\\s]{3,40})`, 'g'),
            new RegExp(`\\b${teamNum}\\b[^0-9]*([가-힣]+(?:FC|클럽|초|중|고|U12|U11)[^0-9\\s]*)`, 'g'),
          ];
          
          for (const pattern of patterns) {
            const match = pattern.exec(teamSection);
            if (match && match[1]) {
              let teamName = match[1].trim();
              teamName = teamName.replace(/[^\w가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
              if (teamName.length > 2 && teamName.length < 50) {
                teams[teamNum] = teamName;
                break;
              }
            }
          }
        }
        
        if (Object.keys(teams).length > 0) {
          console.log(`  팀 매핑:`);
          Object.keys(teams).forEach(num => {
            console.log(`    ${num}번: ${teams[num]}`);
          });
        }
      }
    });
  }
}
