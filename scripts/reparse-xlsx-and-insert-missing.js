/**
 * XLSX를 다시 파싱해서 누락된 경기만 INSERT 합니다.
 * - 한 셀에 2경기(위/아래) 형태도 모두 추출 (global regex)
 * - ageGroup은 시트 내 "(U12)" "(U11)" 표기 전환으로 판단
 * - 중복 기준: (round, group_name, date, time, venue, home_team_id, away_team_id)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function makeKey(obj) {
  const normTime = obj.time ? String(obj.time).slice(0, 5) : '';
  return [
    obj.round,
    obj.group_name,
    obj.date,
    normTime,
    obj.venue || '',
    obj.home_team_id,
    obj.away_team_id,
  ].join('|');
}

function normalizeCell(v) {
  return String(v || '')
    .replace(/\u00a0/g, ' ')
    .trim();
}

async function loadGroupTeamMapping() {
  const teamNamesPath = path.join(__dirname, '..', '00_docs', 'team-names.txt');
  const teamNamesContent = fs.readFileSync(teamNamesPath, 'utf-8');

  const groupTeamMapping = {};
  let currentGroup = null;
  let currentAgeGroup = null;

  teamNamesContent.split('\n').forEach((lineRaw) => {
    const line = lineRaw.trim();
    if (!line) return;

    if (line.includes('U11 1차 리그 대진표')) {
      currentAgeGroup = 'U11';
      return;
    }
    if (line.includes('U12 1차 리그 대진표')) {
      currentAgeGroup = 'U12';
      return;
    }
    if (line.includes('-------')) {
      // 파일 내 구분선 이후도 U12로 처리했었는데, 이미 상단 헤더로 제어되므로 유지
      currentAgeGroup = 'U12';
      return;
    }

    const groupMatch = line.match(/(\d+)조/);
    if (groupMatch) {
      currentGroup = parseInt(groupMatch[1], 10);
      const key = `${currentGroup}-${currentAgeGroup}`;
      if (!groupTeamMapping[key]) {
        groupTeamMapping[key] = { ageGroup: currentAgeGroup, teams: {}, originalGroup: currentGroup };
      }
      return;
    }

    const teamMatch = line.match(/(\d+)\.\s*(.+)/);
    if (teamMatch && currentGroup && currentAgeGroup) {
      const teamNum = parseInt(teamMatch[1], 10);
      let teamName = teamMatch[2].replace(/\s+/g, ' ').trim();
      if (teamName) {
        const key = `${currentGroup}-${currentAgeGroup}`;
        if (!groupTeamMapping[key]) {
          groupTeamMapping[key] = { ageGroup: currentAgeGroup, teams: {}, originalGroup: currentGroup };
        }
        groupTeamMapping[key].teams[teamNum] = teamName;
      }
    }
  });

  return groupTeamMapping;
}

async function preloadTeams() {
  const { data, error } = await supabase.from('teams').select('id, name, age_group, group_name');
  if (error) throw error;
  const map = new Map();
  for (const t of data || []) {
    map.set(`${t.name}|${t.age_group}|${t.group_name}`, t.id);
  }
  return map;
}

async function preloadExistingMatchKeys() {
  const { data, error } = await supabase
    .from('matches')
    .select('round, group_name, date, time, venue, home_team_id, away_team_id');
  if (error) throw error;
  const set = new Set();
  for (const m of data || []) set.add(makeKey(m));
  return set;
}

function parseScheduleFromXlsx(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // 시트에 U12/U11 두 개의 "표"가 각각 존재 → (날짜/조) 헤더 행이 2번 나옴
  const headerRows = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (String(row[0]).trim() === '날짜' && String(row[1]).trim() === '조') {
      headerRows.push(i);
    }
  }

  if (headerRows.length === 0) {
    throw new Error('헤더 행(날짜/조)을 찾을 수 없습니다.');
  }

  const matches = [];

  for (let h = 0; h < headerRows.length; h++) {
    const headerRow = headerRows[h];
    const nextHeaderRow = h + 1 < headerRows.length ? headerRows[h + 1] : data.length;
    const dateColumn = 0;

    // 이 표의 연령대 결정: 헤더 위쪽 몇 줄에서 (U11)/(U12) 검색
    let tableAgeGroup = 'U12';
    for (let i = Math.max(0, headerRow - 5); i < headerRow; i++) {
      const rowText = data[i].map((v) => String(v)).join(' ');
      if (rowText.includes('(U11)')) tableAgeGroup = 'U11';
      if (rowText.includes('(U12)')) tableAgeGroup = 'U12';
    }

    // 조 컬럼 찾기
    const groupColumns = {};
    const header = data[headerRow];
    for (let j = 2; j < header.length; j++) {
      const cell = normalizeCell(header[j]);
      const m = cell.match(/(\d+)조/);
      if (m) groupColumns[parseInt(m[1], 10)] = j;
    }

    let currentDate = null;

    for (let i = headerRow + 1; i < nextHeaderRow; i++) {
      const row = data[i];

      // 날짜 행 찾기
      const dateCell = normalizeCell(row[dateColumn]);
      const dateMatch = dateCell.match(/(\d{1,2})\/(\d{1,2})\([^)]+\)/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1], 10);
        const day = parseInt(dateMatch[2], 10);
        currentDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      if (!currentDate) continue;

      for (const groupNumStr of Object.keys(groupColumns)) {
        const groupNum = parseInt(groupNumStr, 10);
        const colIndex = groupColumns[groupNum];
        const cellRaw = String(row[colIndex] || '');
        if (!cellRaw || !cellRaw.includes('◯')) continue;

        const re =
          /◯\s*(\d+)\s*[\r\n\s]+(\d{1,2}):(\d{2})\s*\(([A-H])\)\s*[\r\n\s]+(\d+)\s*:\s*(\d+)/g;
        let m;
        while ((m = re.exec(cellRaw)) !== null) {
          matches.push({
            number: parseInt(m[1], 10),
            date: currentDate,
            time: `${String(m[2]).padStart(2, '0')}:${m[3]}`,
            venue: m[4],
            group: groupNum,
            ageGroup: tableAgeGroup,
            homeTeamNumber: parseInt(m[5], 10),
            awayTeamNumber: parseInt(m[6], 10),
          });
        }
      }
    }
  }

  return matches;
}

async function main() {
  console.log('XLSX 재파싱 후 누락 경기 삽입 시작...\n');

  const xlsxPath = path.join(
    __dirname,
    '..',
    '00_docs',
    '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.xlsx'
  );

  const groupTeamMapping = await loadGroupTeamMapping();
  const teamKeyToId = await preloadTeams();
  const existingKeys = await preloadExistingMatchKeys();

  const parsed = parseScheduleFromXlsx(xlsxPath);
  console.log(`파싱된 경기: ${parsed.length}개`);

  // DB insert 대상 만들기
  const toInsert = [];
  const skippedNoTeam = [];
  const skippedExisting = [];

  for (const match of parsed) {
    const mapKey = `${match.group}-${match.ageGroup}`;
    const mapping = groupTeamMapping[mapKey];
    if (!mapping) {
      skippedNoTeam.push({ reason: 'mapping 없음', match });
      continue;
    }

    const homeName = mapping.teams[match.homeTeamNumber];
    const awayName = mapping.teams[match.awayTeamNumber];
    if (!homeName || !awayName) {
      skippedNoTeam.push({ reason: 'team num 없음', match });
      continue;
    }

    const homeId = teamKeyToId.get(`${homeName}|${match.ageGroup}|${String(match.group)}`);
    const awayId = teamKeyToId.get(`${awayName}|${match.ageGroup}|${String(match.group)}`);
    if (!homeId || !awayId) {
      skippedNoTeam.push({ reason: 'team id 없음', match });
      continue;
    }

    const row = {
      date: match.date,
      time: match.time,
      round: '1차',
      group_name: String(match.group),
      venue: match.venue,
      home_team_id: homeId,
      away_team_id: awayId,
      status: '예정',
    };

    const key = makeKey(row);
    if (existingKeys.has(key)) {
      skippedExisting.push(match.number);
      continue;
    }

    existingKeys.add(key);
    toInsert.push(row);
  }

  console.log(`기존 중복으로 스킵: ${skippedExisting.length}개`);
  console.log(`팀 매핑 문제로 스킵: ${skippedNoTeam.length}개`);
  console.log(`삽입 대상: ${toInsert.length}개\n`);

  if (toInsert.length === 0) {
    console.log('✅ 삽입할 경기가 없습니다.');
    return;
  }

  // 배치 insert
  const chunkSize = 200;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('matches').insert(chunk);
    if (error) {
      console.error('insert 오류:', error);
      process.exit(1);
    }
    inserted += chunk.length;
    console.log(`... 삽입 진행: ${inserted}/${toInsert.length}`);
  }

  console.log('\n✅ 누락 경기 삽입 완료');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

