/**
 * XLSX에서 특정 조/날짜 셀 원문을 덤프해서 파싱 패턴을 확인합니다.
 */
const XLSX = require('xlsx');
const path = require('path');

const xlsxPath = path.join(
  __dirname,
  '..',
  '00_docs',
  '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.xlsx'
);

const wb = XLSX.readFile(xlsxPath);
console.log('sheets:', wb.SheetNames);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// U11 표기 행 찾기
const u11Rows = [];
for (let i = 0; i < data.length; i++) {
  const rowText = data[i].map((v) => String(v)).join(' ');
  if (rowText.includes('(U11)')) u11Rows.push(i + 1);
}
console.log('rows containing (U11):', u11Rows);

if (u11Rows.length) {
  const start = Math.max(0, u11Rows[0] - 3);
  const end = Math.min(data.length, u11Rows[0] + 3);
  console.log('\n--- 주변 행(앞/뒤) ---');
  for (let i = start; i < end; i++) {
    const preview = data[i]
      .slice(0, 5)
      .map((v) => String(v).replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' | ');
    console.log(String(i + 1).padStart(3, '0'), preview);
  }
}

// 헤더 찾기
let headerRow = -1;
let dateCol = 0;
const groupColumns = {};
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (String(row[0]).trim() === '날짜' && String(row[1]).trim() === '조') {
    headerRow = i;
    for (let j = 2; j < row.length; j++) {
      const cell = String(row[j] || '').trim();
      const m = cell.match(/(\d+)조/);
      if (m) groupColumns[parseInt(m[1], 10)] = j;
    }
    break;
  }
}

if (headerRow === -1) throw new Error('헤더를 못 찾음');

function findDateRow(dateStr) {
  for (let i = headerRow + 1; i < data.length; i++) {
    const cell = String(data[i][dateCol] || '').trim();
    if (cell.includes(dateStr)) return i;
  }
  return -1;
}

const dateRow = findDateRow('2/6');
console.log('headerRow', headerRow + 1, 'dateRow', dateRow + 1);

const group = 1;
const col = groupColumns[group];
console.log('group col', col);

for (let r = dateRow; r < dateRow + 5; r++) {
  const v = String(data[r][col] || '');
  if (v.trim()) {
    console.log('\n--- row', r + 1, 'raw ---');
    console.log(v);
  }
}

