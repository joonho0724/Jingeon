/**
 * team-names.txt를 기반으로 U11 정확한 63개 팀 목록 생성
 * 
 * 사용법: node scripts/create-u11-63-teams-reference.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '00_docs', 'team-names.txt');

function parseU11Teams() {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const u11Teams = [];
  let currentGroup = null;
  let currentTeamNumber = null;
  let inU11Section = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('U11')) {
      inU11Section = true;
      continue;
    }
    
    if (line.includes('U12') && inU11Section) {
      break; // U12 섹션 시작하면 종료
    }
    
    if (line.match(/^\d+조$/)) {
      currentGroup = line.replace('조', '');
      continue;
    }
    
    if (line.match(/^\d+\./)) {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match && inU11Section) {
        currentTeamNumber = parseInt(match[1]);
        const teamName = match[2].trim();
        
        if (teamName && currentGroup) {
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

const u11Teams = parseU11Teams();

console.log('📋 U11 정확한 팀 목록 (team-names.txt 기준):\n');
console.log(`총 ${u11Teams.length}개 팀\n`);

// 조별로 그룹화
const groups = {};
u11Teams.forEach(team => {
  if (!groups[team.group]) {
    groups[team.group] = [];
  }
  groups[team.group].push(team);
});

// 조별 출력
const sortedGroups = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));
sortedGroups.forEach(group => {
  const teams = groups[group];
  console.log(`${group}조 (${teams.length}개):`);
  teams.forEach(team => {
    console.log(`  ${team.teamNumber}. ${team.name}`);
  });
  console.log('');
});

// 전체 목록
console.log('\n📝 전체 U11 팀 목록 (63개):\n');
u11Teams.forEach((team, index) => {
  console.log(`${index + 1}. ${team.name} (${team.group}조 ${team.teamNumber}번)`);
});

// JSON 파일로 저장 (다른 스크립트에서 사용할 수 있도록)
const outputPath = path.join(__dirname, '..', '00_docs', 'u11-teams-reference.json');
fs.writeFileSync(outputPath, JSON.stringify(u11Teams, null, 2), 'utf8');
console.log(`\n✅ 참조 파일 생성: ${outputPath}`);
