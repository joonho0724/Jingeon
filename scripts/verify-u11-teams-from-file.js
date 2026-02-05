/**
 * team-names.txt 파일을 기반으로 U11 팀 목록 검증
 * 
 * 사용법: node scripts/verify-u11-teams-from-file.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '00_docs', 'team-names.txt');

function parseTeamNames() {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const u11Teams = [];
  const u12Teams = [];
  let currentSection = null;
  let currentGroup = null;
  let currentTeamNumber = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('U11')) {
      currentSection = 'U11';
      continue;
    }
    
    if (line.includes('U12')) {
      currentSection = 'U12';
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
        
        if (teamName && currentSection && currentGroup) {
          const team = {
            group: currentGroup,
            teamNumber: currentTeamNumber,
            name: teamName,
          };
          
          if (currentSection === 'U11') {
            u11Teams.push(team);
          } else if (currentSection === 'U12') {
            u12Teams.push(team);
          }
        }
      }
    }
  }
  
  return { u11Teams, u12Teams };
}

const { u11Teams, u12Teams } = parseTeamNames();

console.log('📋 team-names.txt 파일 분석 결과:\n');

console.log(`U11 팀 수: ${u11Teams.length}개`);
console.log(`U12 팀 수: ${u12Teams.length}개\n`);

// U11 조별 팀 수 확인
const u11Groups = {};
u11Teams.forEach(team => {
  if (!u11Groups[team.group]) {
    u11Groups[team.group] = [];
  }
  u11Groups[team.group].push(team);
});

console.log('U11 조별 팀 수:\n');
const sortedU11Groups = Object.keys(u11Groups).sort((a, b) => parseInt(a) - parseInt(b));
sortedU11Groups.forEach(group => {
  const teams = u11Groups[group];
  const status = teams.length === 4 ? '✅' : teams.length < 4 ? '❌ (부족)' : '⚠️  (초과)';
  console.log(`  ${group}조: ${teams.length}개 팀 ${status}`);
  teams.forEach(team => {
    console.log(`    ${team.teamNumber}. ${team.name}`);
  });
});

console.log('\n📝 U11 전체 팀 목록:\n');
u11Teams.forEach((team, index) => {
  console.log(`${index + 1}. ${team.name} (${team.group}조 ${team.teamNumber}번)`);
});

if (u11Teams.length !== 56) {
  console.log(`\n⚠️  경고: U11 팀 수가 56개가 아닙니다! (현재: ${u11Teams.length}개)`);
  console.log(`   예상: 16조 × 4팀 = 64팀 (또는 56팀)`);
} else {
  console.log(`\n✅ U11 팀 수가 정확합니다! (56개)`);
}
