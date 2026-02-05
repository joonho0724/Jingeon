/**
 * U11 팀 수 검증 스크립트 (63개 기준)
 * 
 * 사용법: node scripts/verify-u11-teams-63.js
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

// team-names.txt 파일 파싱
function parseTeamNames() {
  const filePath = path.join(__dirname, '..', '00_docs', 'team-names.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const u11Teams = [];
  let currentSection = null;
  let currentGroup = null;
  let currentTeamNumber = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('U11 1차 리그')) {
      currentSection = 'U11';
      continue;
    }
    
    if (line.includes('U12 1차 리그')) {
      currentSection = 'U12';
      continue;
    }
    
    if (line.includes('-------')) {
      // 섹션 구분선을 만나면 섹션 초기화하지 않음 (계속 유지)
      continue;
    }
    
    if (line.match(/^\d+조$/)) {
      currentGroup = line.replace('조', '');
      currentTeamNumber = null;
      continue;
    }
    
    if (line.match(/^\d+\./)) {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match) {
        currentTeamNumber = parseInt(match[1]);
        const teamName = match[2].trim();
        
        if (teamName && currentSection === 'U11' && currentGroup) {
          u11Teams.push({
            group: currentGroup,
            teamNumber: currentTeamNumber,
            name: teamName,
          });
        }
      }
    }
  }
  
  return u11Teams;
}

async function verifyU11Teams() {
  console.log('🔍 U11 팀 수 검증 중 (63개 기준)...\n');

  try {
    // team-names.txt에서 U11 팀 목록 파싱
    const expectedTeams = parseTeamNames();
    console.log(`📋 team-names.txt 기준 U11 팀 수: ${expectedTeams.length}개\n`);

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

    console.log(`📊 DB의 U11 팀 수: ${dbTeams.length}개\n`);

    if (dbTeams.length !== 63) {
      console.log(`⚠️  경고: DB의 U11 팀 수가 63개가 아닙니다! (현재: ${dbTeams.length}개)\n`);
    } else {
      console.log(`✅ DB의 U11 팀 수가 정확합니다! (63개)\n`);
    }

    // 조별 팀 수 확인
    const dbGroups = {};
    dbTeams.forEach(team => {
      const groupName = team.group_name1 || '미지정';
      if (!dbGroups[groupName]) {
        dbGroups[groupName] = [];
      }
      dbGroups[groupName].push(team);
    });

    console.log('📊 조별 팀 수 비교:\n');
    const allGroups = new Set([...Object.keys(dbGroups), ...expectedTeams.map(t => t.group)]);
    const sortedGroups = Array.from(allGroups).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedGroups.forEach(groupName => {
      const dbCount = dbGroups[groupName]?.length || 0;
      const expectedCount = expectedTeams.filter(t => t.group === groupName).length;
      const status = dbCount === expectedCount ? '✅' : dbCount > expectedCount ? '⚠️  (초과)' : '❌ (부족)';
      console.log(`  ${groupName}조: DB ${dbCount}개 / 예상 ${expectedCount}개 ${status}`);
    });

    // team-names.txt에 있는데 DB에 없는 팀 찾기
    console.log('\n🔍 team-names.txt에 있는데 DB에 없는 팀:\n');
    const missingTeams = [];
    expectedTeams.forEach(expected => {
      const found = dbTeams.find(db => {
        // 팀명 정규화하여 비교
        const normalize = (name) => name.replace(/\s+/g, '').toLowerCase();
        return normalize(db.name) === normalize(expected.name) && db.group_name1 === expected.group;
      });
      if (!found) {
        missingTeams.push(expected);
        console.log(`  ❌ ${expected.name} (${expected.group}조 ${expected.teamNumber}번)`);
      }
    });

    if (missingTeams.length === 0) {
      console.log('  ✅ 모든 팀이 DB에 존재합니다.');
    }

    // DB에 있는데 team-names.txt에 없는 팀 찾기
    console.log('\n🔍 DB에 있는데 team-names.txt에 없는 팀:\n');
    const extraTeams = [];
    dbTeams.forEach(db => {
      const found = expectedTeams.find(expected => {
        const normalize = (name) => name.replace(/\s+/g, '').toLowerCase();
        return normalize(expected.name) === normalize(db.name) && expected.group === db.group_name1;
      });
      if (!found) {
        extraTeams.push(db);
        console.log(`  ⚠️  ${db.name} (${db.group_name1}조, ID: ${db.id})`);
      }
    });

    if (extraTeams.length === 0) {
      console.log('  ✅ 추가 팀이 없습니다.');
    }

    // 요약
    console.log('\n📈 요약:\n');
    console.log(`  team-names.txt: ${expectedTeams.length}개 팀`);
    console.log(`  DB: ${dbTeams.length}개 팀`);
    console.log(`  부족한 팀: ${missingTeams.length}개`);
    console.log(`  추가된 팀: ${extraTeams.length}개`);
    
    if (dbTeams.length === 63 && missingTeams.length === 0 && extraTeams.length === 0) {
      console.log('\n✅ U11 팀 목록이 정확합니다! (63개)');
    } else {
      console.log('\n⚠️  U11 팀 목록을 정리해야 합니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

verifyU11Teams();
