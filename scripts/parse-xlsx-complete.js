/**
 * XLSX 파일에서 조별 팀명과 경기 정보를 정확히 추출하는 스크립트
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsxFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.xlsx');

console.log('XLSX 파일 읽는 중...');
const workbook = XLSX.readFile(xlsxFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 셀 데이터를 직접 읽기 (병합된 셀 정보 포함)
const range = XLSX.utils.decode_range(worksheet['!ref']);

// U12와 U11 구분
let u12StartRow = -1;
let u11StartRow = -1;

for (let row = 0; row <= range.e.r; row++) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
  const cell = worksheet[cellAddress];
  if (cell && cell.v) {
    const value = String(cell.v);
    if (value.includes('U12') && value.includes('1차 리그')) {
      u12StartRow = row;
    }
    if (value.includes('U11') && value.includes('1차 리그')) {
      u11StartRow = row;
    }
  }
}

console.log(`U12 시작 행: ${u12StartRow}`);
console.log(`U11 시작 행: ${u11StartRow}\n`);

// U12 팀명 추출 (행 10-13, 인덱스 9-12)
function extractTeamNames(startRow, ageGroup) {
  const groupTeamMapping = {};
  
  // "팀명" 행 찾기
  let teamNameRow = -1;
  for (let row = startRow; row < startRow + 20; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
    const cell = worksheet[cellAddress];
    if (cell && cell.v && String(cell.v).includes('팀명')) {
      teamNameRow = row;
      break;
    }
  }
  
  if (teamNameRow === -1) {
    console.log(`${ageGroup} 팀명 행을 찾을 수 없습니다.`);
    return {};
  }
  
  console.log(`${ageGroup} 팀명 행: ${teamNameRow}\n`);
  
  // 각 조의 컬럼 찾기 (1조, 2조 등)
  const groupColumns = {};
  for (let col = 0; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: teamNameRow - 1, c: col });
    const header = worksheet[headerCell];
    if (header && header.v) {
      const headerValue = String(header.v);
      for (let groupNum = 1; groupNum <= 16; groupNum++) {
        if (headerValue.includes(`${groupNum}조`)) {
          groupColumns[groupNum] = col;
        }
      }
    }
  }
  
  console.log(`${ageGroup} 조별 컬럼:`, groupColumns);
  
  // 각 조의 팀명 추출 (팀명 행 다음 4행)
  for (let groupNum = 1; groupNum <= 16; groupNum++) {
    const col = groupColumns[groupNum];
    if (col === undefined) continue;
    
    const teams = {};
    
    // 팀명 행 다음 4행 확인 (1번, 2번, 3번, 4번)
    for (let teamNum = 1; teamNum <= 4; teamNum++) {
      const row = teamNameRow + teamNum;
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        let teamName = String(cell.v).trim();
        
        // 여러 셀에 걸쳐 있을 수 있으므로 옆 셀도 확인
        let fullTeamName = teamName;
        for (let offset = 1; offset <= 3; offset++) {
          const nextCellAddress = XLSX.utils.encode_cell({ r: row, c: col + offset });
          const nextCell = worksheet[nextCellAddress];
          if (nextCell && nextCell.v) {
            const nextValue = String(nextCell.v).trim();
            if (nextValue && !nextValue.match(/^[0-9]+$/)) {
              fullTeamName += ' ' + nextValue;
            }
          }
        }
        
        // 공백 정리
        fullTeamName = fullTeamName.replace(/\s+/g, ' ').trim();
        
        // 유효한 팀명인지 확인 (한글이나 영문 포함, 길이 체크)
        if (fullTeamName.length >= 3 && fullTeamName.length <= 50 && /[가-힣A-Za-z]/.test(fullTeamName)) {
          teams[teamNum] = fullTeamName;
        }
      }
    }
    
    if (Object.keys(teams).length > 0) {
      groupTeamMapping[groupNum] = teams;
      console.log(`\n${groupNum}조:`);
      Object.keys(teams).forEach(num => {
        console.log(`  ${num}번: ${teams[num]}`);
      });
    }
  }
  
  return groupTeamMapping;
}

// U12 팀명 추출
console.log('=== U12 팀명 추출 ===');
const u12TeamMapping = extractTeamNames(u12StartRow, 'U12');

// U11 팀명 추출
console.log('\n\n=== U11 팀명 추출 ===');
const u11TeamMapping = extractTeamNames(u11StartRow, 'U11');

// 경기 정보 추출 (이미 HTML에서 추출한 정보 활용)
// XLSX에서도 경기 정보를 추출할 수 있지만, HTML에서 이미 추출했으므로 생략

// 결과 저장
const output = {
  U12: {
    groupTeamMapping: u12TeamMapping
  },
  U11: {
    groupTeamMapping: u11TeamMapping
  }
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'xlsx-team-mapping.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('\n\n=== 완료 ===');
console.log(`U12 조별 팀 매핑: ${Object.keys(u12TeamMapping).length}개 조`);
console.log(`U11 조별 팀 매핑: ${Object.keys(u11TeamMapping).length}개 조`);
console.log('\n결과를 xlsx-team-mapping.json에 저장했습니다.');
