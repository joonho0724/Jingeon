/**
 * team-names.txt와 xlsx 파일을 결합하여 데이터베이스에 일괄 삽입하는 완전한 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 관리자 권한이 필요하므로 서비스 키 사용 (또는 관리자로 로그인)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.error('SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// team-names.txt에서 조별 팀명 매핑 추출
const teamNamesPath = path.join(__dirname, '..', '00_docs', 'team-names.txt');
const teamNamesContent = fs.readFileSync(teamNamesPath, 'utf-8');

const groupTeamMapping = {};
let currentGroup = null;
let currentAgeGroup = null;

teamNamesContent.split('\n').forEach(line => {
  line = line.trim();
  
  // 연령대 확인
  if (line.includes('U11 1차 리그 대진표')) {
    currentAgeGroup = 'U11';
    return;
  }
  if (line.includes('U12 1차 리그 대진표')) {
    currentAgeGroup = 'U12';
    return;
  }
  
  // 구분선 이후 U12 시작
  if (line.includes('-------')) {
    currentAgeGroup = 'U12'; // 구분선 이후는 U12
    return;
  }
  
  // 조 번호 찾기
  const groupMatch = line.match(/(\d+)조/);
  if (groupMatch) {
    currentGroup = parseInt(groupMatch[1]);
    // 같은 조 번호지만 다른 연령대인 경우를 구분하기 위해 키 생성
    const key = `${currentGroup}-${currentAgeGroup}`;
    if (!groupTeamMapping[key]) {
      groupTeamMapping[key] = { ageGroup: currentAgeGroup, teams: {}, originalGroup: currentGroup };
    }
    return;
  }
  
  // 팀 번호와 팀명 추출
  const teamMatch = line.match(/(\d+)\.\s*(.+)/);
  if (teamMatch && currentGroup && currentAgeGroup) {
    const teamNum = parseInt(teamMatch[1]);
    let teamName = teamMatch[2].trim();
    // 불필요한 공백 제거
    teamName = teamName.replace(/\s+/g, ' ').trim();
    
    if (teamName && teamName.length > 0) {
      const key = `${currentGroup}-${currentAgeGroup}`;
      if (!groupTeamMapping[key]) {
        groupTeamMapping[key] = { ageGroup: currentAgeGroup, teams: {}, originalGroup: currentGroup };
      }
      groupTeamMapping[key].teams[teamNum] = teamName;
    }
  }
});

console.log('=== 조별 팀명 매핑 ===\n');
Object.keys(groupTeamMapping).sort().forEach(key => {
  const group = groupTeamMapping[key];
  const groupNum = group.originalGroup || key;
  console.log(`${groupNum}조 (${group.ageGroup}):`);
  Object.keys(group.teams).sort((a, b) => parseInt(a) - parseInt(b)).forEach(teamNum => {
    console.log(`  ${teamNum}번: ${group.teams[teamNum]}`);
  });
  console.log();
});

// xlsx 파일에서 경기 정보 추출
const xlsxFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.xlsx');
const workbook = XLSX.readFile(xlsxFilePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// 헤더 행 찾기 (날짜, 조가 있는 행)
let headerRow = -1;
let dateColumn = -1;
let groupColumns = {}; // 조 번호 -> 컬럼 인덱스

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (row[0] === '날짜' && row[1] === '조') {
    headerRow = i;
    dateColumn = 0;
    // 조 컬럼 찾기
    for (let j = 2; j < row.length; j++) {
      const cell = String(row[j]).trim();
      const groupMatch = cell.match(/(\d+)조/);
      if (groupMatch) {
        const groupNum = parseInt(groupMatch[1]);
        groupColumns[groupNum] = j;
      }
    }
    break;
  }
}

if (headerRow === -1) {
  console.error('헤더 행을 찾을 수 없습니다.');
  process.exit(1);
}

console.log(`헤더 행: ${headerRow + 1}`);
console.log(`조 컬럼:`, groupColumns);
console.log();

// 경기 정보 추출
const matches = [];
let currentDate = null;
let currentAgeGroupForMatch = 'U12'; // 기본값

for (let i = headerRow + 1; i < data.length; i++) {
  const row = data[i];
  
  // 날짜 행 찾기
  const dateCell = String(row[dateColumn] || '').trim();
  const dateMatch = dateCell.match(/(\d{1,2})\/(\d{1,2})\([^)]+\)/);
  
  if (dateMatch) {
    const month = parseInt(dateMatch[1]);
    const day = parseInt(dateMatch[2]);
    currentDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // U11 대진표인지 확인 (행 14부터 시작)
    if (i >= 13) {
      currentAgeGroupForMatch = 'U11';
    }
    continue;
  }
  
  // 경기 정보가 있는 행 처리
  if (!currentDate) continue;
  
  // 각 조의 경기 정보 추출
  for (const groupNumStr in groupColumns) {
    const groupNum = parseInt(groupNumStr);
    const colIndex = groupColumns[groupNum];
    const cell = String(row[colIndex] || '').trim();
    
    if (!cell || !cell.includes('◯')) continue;
    
    // 경기 정보 파싱: ◯번호\n시간 (경기장)\n팀번호 : 팀번호
    const matchPattern = /◯(\d+)\s*[\r\n]+(\d{1,2}):(\d{2})\s*\(([A-H])\)\s*[\r\n]+(\d+)\s*:\s*(\d+)/;
    const match = cell.match(matchPattern);
    
    if (match) {
      matches.push({
        number: parseInt(match[1]),
        date: currentDate,
        time: `${match[2]}:${match[3]}`,
        venue: match[4],
        group: groupNum,
        ageGroup: currentAgeGroupForMatch,
        homeTeamNumber: parseInt(match[5]),
        awayTeamNumber: parseInt(match[6]),
      });
    }
  }
}

console.log(`총 ${matches.length}개 경기 추출\n`);

// 팀을 데이터베이스에 등록
async function registerTeams() {
  console.log('=== 팀 등록 시작 ===\n');
  
  let registeredCount = 0;
  let existingCount = 0;
  
  for (const key in groupTeamMapping) {
    const group = groupTeamMapping[key];
    const ageGroup = group.ageGroup;
    const groupNum = group.originalGroup || key;
    
    for (const teamNum in group.teams) {
      const teamName = group.teams[teamNum];
      
      if (!teamName || teamName.trim().length === 0) continue;
      
      // 이미 존재하는지 확인
      const { data: existing } = await supabase
        .from('teams')
        .select('id')
        .eq('name', teamName)
        .eq('age_group', ageGroup)
        .eq('group_name', String(groupNum))
        .single();
      
      if (existing) {
        existingCount++;
        continue;
      }
      
      // 팀 등록
      const { error } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          age_group: ageGroup,
          group_name: String(groupNum),
        });
      
      if (error) {
        console.error(`팀 등록 오류: ${teamName} (${ageGroup}, ${groupNum}조)`, error.message);
      } else {
        console.log(`✓ ${teamName} (${ageGroup}, ${groupNum}조)`);
        registeredCount++;
      }
    }
  }
  
  console.log(`\n팀 등록 완료: 신규 ${registeredCount}개, 기존 ${existingCount}개\n`);
}

// 경기를 데이터베이스에 등록
async function registerMatches() {
  console.log('=== 경기 등록 시작 ===\n');
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  for (const match of matches) {
    try {
      const key = `${match.group}-${match.ageGroup}`;
      const group = groupTeamMapping[key];
      if (!group || !group.teams[match.homeTeamNumber] || !group.teams[match.awayTeamNumber]) {
        console.error(`경기 ${match.number} 스킵: 조 ${match.group} (${match.ageGroup})의 팀 정보 없음`);
        skipCount++;
        continue;
      }
      
      // 팀 ID 찾기
      const homeTeamName = group.teams[match.homeTeamNumber];
      const awayTeamName = group.teams[match.awayTeamNumber];
      
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', homeTeamName)
        .eq('age_group', match.ageGroup)
        .eq('group_name', String(match.group))
        .single();
      
      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', awayTeamName)
        .eq('age_group', match.ageGroup)
        .eq('group_name', String(match.group))
        .single();
      
      if (!homeTeam || !awayTeam) {
        console.error(`경기 ${match.number} 스킵: 팀을 찾을 수 없음 (${homeTeamName} vs ${awayTeamName})`);
        skipCount++;
        continue;
      }
      
      // 경기 등록
      const { error } = await supabase
        .from('matches')
        .insert({
          date: match.date,
          time: match.time,
          round: '1차',
          group_name: String(match.group),
          venue: match.venue,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          status: '예정',
        });
      
      if (error) {
        if (error.code === '23505') {
          skipCount++;
        } else {
          console.error(`경기 ${match.number} 등록 오류:`, error.message);
          errorCount++;
        }
      } else {
        if (successCount < 10 || successCount % 50 === 0) {
          console.log(`✓ 경기 ${match.number}: ${match.date} ${match.time} (${match.venue}) - 조${match.group} ${homeTeamName} vs ${awayTeamName}`);
        }
        successCount++;
      }
    } catch (err) {
      console.error(`경기 ${match.number} 등록 중 예외:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n=== 경기 등록 완료 ===`);
  console.log(`성공: ${successCount}개`);
  console.log(`실패: ${errorCount}개`);
  console.log(`스킵 (중복/팀 없음): ${skipCount}개`);
  console.log(`총: ${matches.length}개`);
}

// 실행
async function main() {
  await registerTeams();
  await registerMatches();
}

main().catch(console.error);
