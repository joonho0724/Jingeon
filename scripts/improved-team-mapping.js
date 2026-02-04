/**
 * HTML에서 조별 팀명 매핑을 정확히 추출하는 개선된 스크립트
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// HTML을 그대로 파싱 (태그 제거하지 않고 구조 유지)
// 테이블 구조를 활용하여 팀명 추출

// 각 조의 팀명 섹션 찾기
// HTML 구조: <td>나 <p> 태그 안에 팀명이 있을 수 있음

// 1조부터 16조까지 처리
const groupTeamMapping = {};

for (let groupNum = 1; groupNum <= 16; groupNum++) {
  const groupKeyword = `${groupNum}조`;
  
  // HTML에서 해당 조 찾기
  const groupRegex = new RegExp(`${groupNum}조[\\s\\S]{0,5000}`, 'g');
  const groupMatches = htmlContent.match(groupRegex);
  
  if (!groupMatches || groupMatches.length === 0) continue;
  
  // 각 매칭에서 팀명 찾기
  const teams = {};
  
  groupMatches.forEach(match => {
    // HTML 태그 제거
    const text = match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    
    // 팀명 패턴: 숫자(1-4) 다음에 한글 팀명
    // 여러 패턴 시도
    for (let teamNum = 1; teamNum <= 4; teamNum++) {
      if (teams[teamNum]) continue; // 이미 찾았으면 스킵
      
      // 패턴 1: "1 " 다음에 팀명 (공백 포함)
      // 패턴 2: "1번" 다음에 팀명
      // 패턴 3: 숫자와 팀명이 연속으로 나오는 경우
      const patterns = [
        new RegExp(`\\b${teamNum}\\s+([가-힣][^0-9\\s]{4,50})`, 'g'),
        new RegExp(`${teamNum}번\\s+([가-힣][^0-9\\s]{4,50})`, 'g'),
        new RegExp(`\\b${teamNum}\\b[^0-9]*([가-힣]+(?:FC|클럽|초|중|고|U12|U11|서초|리거|월드컵|리틀|제주|서울|경기|인천|부산|대구|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남)[^0-9\\s]{0,40})`, 'g'),
      ];
      
      for (const pattern of patterns) {
        const result = pattern.exec(text);
        if (result && result[1]) {
          let teamName = result[1].trim();
          // 불필요한 문자 제거
          teamName = teamName.replace(/[^\w가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
          // 너무 짧거나 긴 경우 제외
          if (teamName.length >= 4 && teamName.length <= 50) {
            teams[teamNum] = teamName;
            break;
          }
        }
      }
    }
  });
  
  if (Object.keys(teams).length > 0) {
    groupTeamMapping[groupNum] = teams;
    console.log(`${groupNum}조:`);
    Object.keys(teams).forEach(num => {
      console.log(`  ${num}번: ${teams[num]}`);
    });
    console.log();
  }
}

// 결과 저장
const output = {
  groupTeamMapping
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'improved-team-mapping.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`\n총 ${Object.keys(groupTeamMapping).length}개 조의 팀 매핑 추출 완료`);
