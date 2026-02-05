/**
 * team-names.txt 파일과 DB의 U11 팀 목록 비교
 * 
 * 사용법: node scripts/compare-u11-teams-with-file.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 팀명 정규화 함수
function normalizeTeamName(name) {
  return name
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/fc/g, '')
    .replace(/u12/g, '')
    .replace(/u11/g, '')
    .replace(/^경기/, '')
    .replace(/^서울/, '')
    .replace(/^인천/, '')
    .replace(/^경남/, '')
    .replace(/^부산/, '')
    .replace(/^대구/, '')
    .replace(/^광주/, '')
    .replace(/^강원/, '')
    .replace(/^충북/, '')
    .replace(/^대전/, '')
    .replace(/^제주/, '');
}

// team-names.txt 파일 파싱
function parseTeamNames() {
  const filePath = path.join(__dirname, '..', '00_docs', 'team-names.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const u11Teams = [];
  let currentSection = null;
  let currentGroup = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // U11 섹션 시작
    if (line.includes('U11') && line.includes('1차')) {
      currentSection = 'U11';
      continue;
    }
    
    // U12 섹션 시작 (U11 종료)
    if (line.includes('U12') && line.includes('1차')) {
      currentSection = 'U12';
      continue;
    }
    
    // 구분선으로 섹션 종료
    if (line.includes('-------')) {
      currentSection = null;
      continue;
    }
    
    // 조 번호 파싱
    if (line.match(/^\d+조$/)) {
      currentGroup = line.replace('조', '');
      continue;
    }
    
    // 팀 번호와 이름 파싱
    if (line.match(/^\d+\./)) {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match && currentSection === 'U11' && currentGroup) {
        const teamNumber = parseInt(match[1]);
        const teamName = match[2].trim();
        
        // 빈 팀명은 스킵 (16조 4번이 비어있음)
        if (teamName && teamName.length > 0) {
          u11Teams.push({
            group: currentGroup,
            teamNumber: teamNumber,
            name: teamName,
            normalizedName: normalizeTeamName(teamName),
          });
        }
      }
    }
  }
  
  return u11Teams;
}

async function compareTeams() {
  console.log('🔍 team-names.txt와 DB의 U11 팀 목록 비교 중...\n');

  try {
    // 파일에서 팀 목록 파싱
    const fileTeams = parseTeamNames();
    console.log(`✅ team-names.txt: ${fileTeams.length}개 팀\n`);

    // DB에서 U11 팀 조회
    const { data: dbTeams, error } = await supabase
      .from('teams')
      .select('*')
      .eq('age_group', 'U11')
      .order('group_name1')
      .order('group_team_no1');

    if (error) {
      console.error('❌ 팀 목록 조회 실패:', error);
      return;
    }

    console.log(`✅ DB: ${dbTeams.length}개 팀\n`);

    // 조별로 비교
    const fileGroups = {};
    fileTeams.forEach(team => {
      if (!fileGroups[team.group]) {
        fileGroups[team.group] = [];
      }
      fileGroups[team.group].push(team);
    });

    const dbGroups = {};
    dbTeams.forEach(team => {
      const groupName = team.group_name1 || '미지정';
      if (!dbGroups[groupName]) {
        dbGroups[groupName] = [];
      }
      dbGroups[groupName].push(team);
    });

    console.log('📊 조별 비교:\n');
    const allGroups = new Set([...Object.keys(fileGroups), ...Object.keys(dbGroups)]);
    const sortedGroups = Array.from(allGroups).sort((a, b) => parseInt(a) - parseInt(b));

    const missingInDb = [];
    const extraInDb = [];
    const matched = [];

    sortedGroups.forEach(groupName => {
      const fileGroupTeams = fileGroups[groupName] || [];
      const dbGroupTeams = dbGroups[groupName] || [];
      
      console.log(`${groupName}조:`);
      console.log(`  파일: ${fileGroupTeams.length}개, DB: ${dbGroupTeams.length}개`);

      // 파일의 각 팀을 DB에서 찾기
      fileGroupTeams.forEach(fileTeam => {
        const matchedDbTeam = dbGroupTeams.find(dbTeam => {
          const dbNormalized = normalizeTeamName(dbTeam.name);
          return dbNormalized === fileTeam.normalizedName ||
                 dbNormalized.includes(fileTeam.normalizedName) ||
                 fileTeam.normalizedName.includes(dbNormalized);
        });

        if (matchedDbTeam) {
          matched.push({ file: fileTeam, db: matchedDbTeam });
          console.log(`    ✅ ${fileTeam.teamNumber}. ${fileTeam.name} → DB: ${matchedDbTeam.name}`);
        } else {
          missingInDb.push({ group: groupName, team: fileTeam });
          console.log(`    ❌ ${fileTeam.teamNumber}. ${fileTeam.name} → DB에 없음`);
        }
      });

      // DB에만 있는 팀 찾기
      dbGroupTeams.forEach(dbTeam => {
        const matchedFileTeam = fileGroupTeams.find(fileTeam => {
          const dbNormalized = normalizeTeamName(dbTeam.name);
          return dbNormalized === fileTeam.normalizedName ||
                 dbNormalized.includes(fileTeam.normalizedName) ||
                 fileTeam.normalizedName.includes(dbNormalized);
        });

        if (!matchedFileTeam) {
          extraInDb.push({ group: groupName, team: dbTeam });
          console.log(`    ⚠️  DB에만 있음: ${dbTeam.name} (ID: ${dbTeam.id})`);
        }
      });

      console.log('');
    });

    console.log('\n📈 요약:\n');
    console.log(`✅ 매칭된 팀: ${matched.length}개`);
    console.log(`❌ DB에 없는 팀: ${missingInDb.length}개`);
    console.log(`⚠️  DB에만 있는 팀: ${extraInDb.length}개\n`);

    if (missingInDb.length > 0) {
      console.log('❌ DB에 없는 팀 목록:\n');
      missingInDb.forEach(item => {
        console.log(`  ${item.group}조 ${item.team.teamNumber}번: ${item.team.name}`);
      });
      console.log('');
    }

    if (extraInDb.length > 0) {
      console.log('⚠️  DB에만 있는 팀 목록 (삭제 대상):\n');
      extraInDb.forEach(item => {
        console.log(`  ${item.group}조: ${item.team.name} (ID: ${item.team.id})`);
      });
      console.log('');
    }

    // 목표: 63개 팀
    const targetCount = 63;
    const currentCount = dbTeams.length;
    const expectedAfterCleanup = currentCount - extraInDb.length;

    console.log(`\n🎯 목표: ${targetCount}개 팀`);
    console.log(`📊 현재: ${currentCount}개 팀`);
    console.log(`🧹 정리 후 예상: ${expectedAfterCleanup}개 팀`);

    if (expectedAfterCleanup === targetCount) {
      console.log(`✅ 정리 후 정확히 ${targetCount}개가 됩니다!`);
    } else if (expectedAfterCleanup > targetCount) {
      console.log(`⚠️  정리 후에도 ${expectedAfterCleanup - targetCount}개가 더 많습니다.`);
    } else {
      console.log(`⚠️  정리 후에도 ${targetCount - expectedAfterCleanup}개가 부족합니다.`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

compareTeams();
