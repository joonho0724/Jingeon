/**
 * Excel 파일에서 대진표 정보를 추출하는 스크립트
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const xlsxFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.xlsx');

console.log('Excel 파일 읽는 중...\n');

// Excel 파일 읽기
const workbook = XLSX.readFile(xlsxFilePath);

// 시트 이름 확인
console.log('시트 목록:', workbook.SheetNames);
console.log();

// 첫 번째 시트 읽기
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// JSON으로 변환
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log(`총 ${data.length}행 데이터\n`);

// 처음 20행 출력하여 구조 확인
console.log('데이터 구조 확인 (처음 20행):');
for (let i = 0; i < Math.min(20, data.length); i++) {
  console.log(`행 ${i + 1}:`, data[i]);
}

// 조별 팀명 매핑 추출
const groupTeamMapping = {};
const matches = [];

// 데이터 구조 분석
// 날짜, 조, 경기 정보 등을 찾아야 함

// 결과 저장
const output = {
  sheetName,
  totalRows: data.length,
  sampleData: data.slice(0, 20),
  groupTeamMapping,
  matches
};

fs.writeFileSync(
  path.join(__dirname, '..', '00_docs', 'xlsx-parsed-data.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log('\n파싱 결과를 xlsx-parsed-data.json에 저장했습니다.');
