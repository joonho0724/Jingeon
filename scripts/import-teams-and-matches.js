/**
 * team-names.txt에서 팀명을 읽어 데이터베이스에 등록하고
 * HTML 대진표에서 추출한 경기 정보와 매핑하여 경기를 일괄 삽입하는 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// team-names.txt에서 팀명 읽기
const teamNamesPath = path.join(__dirname, '..', '00_docs', 'team-names.txt');
let teamNamesContent = fs.readFileSync(teamNamesPath, 'utf-8');

// BOM 제거
if (teamNamesContent.charCodeAt(0) === 0xFEFF) {
  teamNamesContent = teamNamesContent.slice(1);
}

// U12 1차 리그 대진표 섹션 찾기
// "-------" 다음에 나오는 U12 섹션 찾기
const separatorIdx = teamNamesContent.indexOf('-------');
let u12SectionStart = -1;

if (separatorIdx !== -1) {
  // 구분선 다음 부분에서 U12 찾기
  u12SectionStart = teamNamesContent.indexOf('U12', separatorIdx);
} else {
  // 구분선이 없으면 직접 U12 찾기
  u12SectionStart = teamNamesContent.indexOf('U12');
}

if (u12SectionStart === -1) {
  console.error('U12 섹션을 찾을 수 없습니다.');
  console.error('파일 내용 일부:', teamNamesContent.substring(0, 200));
  process.exit(1);
}

const u12Section = teamNamesContent.substring(u12SectionStart);

// 조별 팀명 매핑 추출
const groupTeamMapping = {};

for (let groupNum = 1; groupNum <= 16; groupNum++) {
  const groupPattern = new RegExp(`${groupNum}조\\s*\\n([\\s\\S]*?)(?=\\d+조|$)`, 'g');
  const match = groupPattern.exec(u12Section);
  
  if (match) {
    const teamLines = match[1].trim().split('\n');
    const teams = {};
    
    teamLines.forEach(line => {
      // "1. 팀명" 형식 파싱
      const teamMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (teamMatch) {
        const teamNum = parseInt(teamMatch[1]);
        const teamName = teamMatch[2].trim();
        if (teamName && teamName.length > 0) {
          teams[teamNum] = teamName;
        }
      }
    });
    
    if (Object.keys(teams).length > 0) {
      groupTeamMapping[groupNum] = teams;
    }
  }
}

console.log(`\n=== 조별 팀명 매핑 추출 완료 ===\n`);
Object.keys(groupTeamMapping).forEach(groupNum => {
  console.log(`${groupNum}조:`);
  Object.keys(groupTeamMapping[groupNum]).forEach(num => {
    console.log(`  ${num}번: ${groupTeamMapping[groupNum][num]}`);
  });
  console.log();
});

// HTML에서 경기 정보 읽기
const htmlFilePath = path.join(__dirname, '..', '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const textContent = htmlContent
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 날짜별 경기 정보 추출
const matches = [];
const datePattern = /(\d{1,2})\/(\d{1,2})\([^)]+\)/g;

const allDates = [];
let dateMatch;
while ((dateMatch = datePattern.exec(textContent)) !== null) {
  const month = parseInt(dateMatch[1]);
  const day = parseInt(dateMatch[2]);
  const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  allDates.push({
    date: dateStr,
    index: dateMatch.index,
    full: dateMatch[0]
  });
}

const uniqueDates = [];
const seenDates = new Set();
allDates.forEach(d => {
  if (!seenDates.has(d.date)) {
    seenDates.add(d.date);
    uniqueDates.push(d);
  }
});

// 각 날짜별로 경기 추출
uniqueDates.forEach((dateInfo, dateIdx) => {
  const dateStart = dateInfo.index + dateInfo.full.length;
  const dateEnd = dateIdx < uniqueDates.length - 1 
    ? uniqueDates[dateIdx + 1].index 
    : textContent.length;
  
  const dateText = textContent.substring(dateStart, dateEnd);
  const matchPattern = /◯\s*(\d+)\s+(\d{1,2}):(\d{2})\s+\(([A-H])\)\s+(\d+)\s*:\s*(\d+)/g;
  let match;
  
  while ((match = matchPattern.exec(dateText)) !== null) {
    const matchNumber = parseInt(match[1]);
    
    // 경기 번호로 조 결정
    // 경기 번호를 16으로 나눈 몫 + 1이 조 번호
    let groupNumber = Math.floor((matchNumber - 1) / 16) + 1;
    if (groupNumber > 16) groupNumber = 16;
    
    matches.push({
      number: matchNumber,
      date: dateInfo.date,
      time: `${match[2]}:${match[3]}`,
      venue: match[4],
      group: String(groupNumber),
      homeTeamNumber: parseInt(match[5]),
      awayTeamNumber: parseInt(match[6]),
    });
  }
});

console.log(`총 ${matches.length}개 경기 추출\n`);

// 팀 등록 및 경기 삽입
async function importTeamsAndMatches() {
  const ageGroup = 'U12';
  
  // 1. 팀 등록
  console.log('=== 팀 등록 시작 ===\n');
  const teamIdMapping = {}; // 조별 팀명 -> 팀 ID 매핑
  
  for (const groupNum in groupTeamMapping) {
    const teams = groupTeamMapping[groupNum];
    
    for (const teamNum in teams) {
      const teamName = teams[teamNum];
      
      // 이미 등록된 팀인지 확인
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', teamName)
        .eq('age_group', ageGroup)
        .single();
      
      let teamId;
      
      if (existingTeam) {
        teamId = existingTeam.id;
        console.log(`✓ 팀 이미 존재: ${teamName} (${teamId.substring(0, 8)}...)`);
      } else {
        // 새 팀 등록
        const { data: newTeam, error } = await supabase
          .from('teams')
          .insert({
            name: teamName,
            age_group: ageGroup,
            group_name: groupNum,
          })
          .select()
          .single();
        
        if (error) {
          console.error(`팀 등록 오류: ${teamName}`, error.message);
          continue;
        }
        
        teamId = newTeam.id;
        console.log(`✓ 팀 등록: ${teamName} (조: ${groupNum})`);
      }
      
      if (!teamIdMapping[groupNum]) {
        teamIdMapping[groupNum] = {};
      }
      teamIdMapping[groupNum][teamNum] = teamId;
    }
  }
  
  console.log(`\n=== 경기 삽입 시작 ===\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  for (const match of matches) {
    try {
      const groupNum = match.group;
      const homeTeamId = teamIdMapping[groupNum]?.[match.homeTeamNumber];
      const awayTeamId = teamIdMapping[groupNum]?.[match.awayTeamNumber];
      
      if (!homeTeamId || !awayTeamId) {
        const homeTeamName = groupTeamMapping[groupNum]?.[match.homeTeamNumber] || `팀${match.homeTeamNumber}`;
        const awayTeamName = groupTeamMapping[groupNum]?.[match.awayTeamNumber] || `팀${match.awayTeamNumber}`;
        console.error(`경기 ${match.number} 스킵: 조 ${groupNum}, ${homeTeamName} vs ${awayTeamName} (팀을 찾을 수 없음)`);
        skipCount++;
        continue;
      }
      
      const { error } = await supabase
        .from('matches')
        .insert({
          date: match.date,
          time: match.time,
          round: '1차',
          group_name: groupNum,
          venue: match.venue,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          status: '예정',
        });
      
      if (error) {
        if (error.code === '23505') {
          // 중복 경기
          skipCount++;
        } else {
          console.error(`경기 ${match.number} 삽입 오류:`, error.message);
          errorCount++;
        }
      } else {
        if (successCount < 10 || successCount % 20 === 0) {
          const homeTeamName = groupTeamMapping[groupNum][match.homeTeamNumber];
          const awayTeamName = groupTeamMapping[groupNum][match.awayTeamNumber];
          console.log(`✓ 경기 ${match.number}: ${match.date} ${match.time} (${match.venue}) - 조${groupNum} ${homeTeamName} vs ${awayTeamName}`);
        }
        successCount++;
      }
    } catch (err) {
      console.error(`경기 ${match.number} 삽입 중 예외:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n=== 완료 ===`);
  console.log(`팀 등록: ${Object.keys(teamIdMapping).length}개 조`);
  console.log(`경기 성공: ${successCount}개`);
  console.log(`경기 실패: ${errorCount}개`);
  console.log(`경기 스킵 (중복/팀 없음): ${skipCount}개`);
  console.log(`총 경기: ${matches.length}개`);
}

// 실행
importTeamsAndMatches().catch(console.error);
