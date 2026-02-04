/**
 * HTML에서 조별 팀명을 추출하는 스크립트
 * HTML 구조를 더 정확히 분석
 */

const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// HTML을 줄 단위로 분석
const lines = htmlContent.split('\n');

// 각 조의 팀명 섹션 찾기
const groupTeamMapping = {};

// 1조부터 16조까지
for (let groupNum = 1; groupNum <= 16; groupNum++) {
  const groupKeyword = `${groupNum}조`;
  const teams = {};
  
  // 해당 조가 나오는 라인 찾기
  let foundGroup = false;
  let teamNameSectionStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 조 찾기
    if (line.includes(groupKeyword) && !foundGroup) {
      foundGroup = true;
      // 이 조의 팀명 섹션은 보통 조 다음에 나옴
      // "팀명" 텍스트를 찾거나, 숫자(1-4)와 팀명이 나오는 부분 찾기
      teamNameSectionStart = i;
    }
    
    if (foundGroup) {
      // 조를 찾은 후 100줄 내에서 팀명 찾기
      if (i > teamNameSectionStart + 100) break;
      
      // 팀명 패턴 찾기
      // 패턴: 숫자(1-4) 다음에 한글 팀명
      for (let teamNum = 1; teamNum <= 4; teamNum++) {
        if (teams[teamNum]) continue;
        
        // 여러 패턴 시도
        const patterns = [
          new RegExp(`\\b${teamNum}\\s+([가-힣][^0-9<>{}\\[\\]\\s]{4,50})`, 'g'),
          new RegExp(`${teamNum}번\\s+([가-힣][^0-9<>{}\\[\\]\\s]{4,50})`, 'g'),
          new RegExp(`>${teamNum}<[^>]*>([가-힣][^<]{4,50})<`, 'g'), // HTML 태그 사이
        ];
        
        for (const pattern of patterns) {
          const match = pattern.exec(line);
          if (match && match[1]) {
            let teamName = match[1].trim();
            // HTML 엔티티 디코딩
            teamName = teamName.replace(/&nbsp;/g, ' ')
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&quot;/g, '"');
            // 불필요한 문자 제거
            teamName = teamName.replace(/[^\w가-힣\s]/g, ' ').replace(/\s+/g, ' ').trim();
            
            if (teamName.length >= 4 && teamName.length <= 50) {
              teams[teamNum] = teamName;
              break;
            }
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

// 결과 저장
const output = {
  groupTeamMapping
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'team-mapping-from-lines.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`\n총 ${Object.keys(groupTeamMapping).length}개 조의 팀 매핑 추출 완료`);
