/**
 * team-names.txt 파일을 파싱하여 teams 테이블 초기화 및 업데이트 SQL 생성
 * 
 * 사용법: node scripts/generate-teams-from-file.js
 */

const fs = require('fs');
const path = require('path');

// 팀명 정규화 함수 (매칭용)
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
  
  const teams = {
    U11: [],
    U12: [],
  };
  
  let currentSection = null;
  let currentGroup = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // U11 섹션 시작
    if (line.includes('U11') && line.includes('1차')) {
      currentSection = 'U11';
      continue;
    }
    
    // U12 섹션 시작
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
      if (match && currentSection && currentGroup) {
        const teamNumber = parseInt(match[1]);
        const teamName = match[2].trim();
        
        // 빈 팀명은 스킵
        if (teamName && teamName.length > 0) {
          teams[currentSection].push({
            group: currentGroup,
            teamNumber: teamNumber,
            name: teamName,
            normalizedName: normalizeTeamName(teamName),
          });
        }
      }
    }
  }
  
  return teams;
}

function generateSQL() {
  console.log('🔍 team-names.txt 파일 파싱 중...\n');

  const teams = parseTeamNames();
  
  console.log(`✅ U11: ${teams.U11.length}개 팀`);
  console.log(`✅ U12: ${teams.U12.length}개 팀`);
  console.log(`✅ 총: ${teams.U11.length + teams.U12.length}개 팀\n`);

  const sqlStatements = [];
  
  sqlStatements.push('BEGIN;');
  sqlStatements.push('-- teams 테이블 초기화 및 업데이트');
  sqlStatements.push('-- 생성일: ' + new Date().toISOString());
  sqlStatements.push('-- team-names.txt 파일 기준');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 1. 기존 팀 데이터 백업 (참고용)');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- CREATE TABLE teams_backup AS SELECT * FROM teams;');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 2. matches 테이블의 팀 ID 매핑 저장 (임시)');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 이 단계는 수동으로 처리하거나 별도 스크립트로 처리');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 3. 기존 teams 테이블 데이터 삭제');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 주의: matches, fair_play_points 테이블의 외래키 제약조건 확인 필요');
  sqlStatements.push('-- CASCADE 옵션이 설정되어 있으면 관련 데이터도 삭제됨');
  sqlStatements.push('DELETE FROM teams;');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 4. 새로운 팀 데이터 삽입');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('');
  
  // U11 팀 삽입
  sqlStatements.push('-- U11 팀 (' + teams.U11.length + '개)');
  teams.U11.forEach(team => {
    sqlStatements.push(`INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)`);
    sqlStatements.push(`VALUES ('${team.name.replace(/'/g, "''")}', 'U11', '${team.group}', ${team.teamNumber}, NULL, NULL, NOW(), NOW());`);
    sqlStatements.push('');
  });
  
  // U12 팀 삽입
  sqlStatements.push('-- U12 팀 (' + teams.U12.length + '개)');
  teams.U12.forEach(team => {
    sqlStatements.push(`INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)`);
    sqlStatements.push(`VALUES ('${team.name.replace(/'/g, "''")}', 'U12', '${team.group}', ${team.teamNumber}, NULL, NULL, NOW(), NOW());`);
    sqlStatements.push('');
  });
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 5. matches 테이블의 팀 ID 업데이트');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 주의: 이 부분은 팀명 매칭 로직이 필요합니다.');
  sqlStatements.push('-- 기존 팀명과 새 팀명을 매칭하여 matches 테이블의 home_team_id, away_team_id를 업데이트해야 합니다.');
  sqlStatements.push('-- 이 작업은 별도 스크립트로 처리하는 것을 권장합니다.');
  sqlStatements.push('');
  
  sqlStatements.push('COMMIT;');
  sqlStatements.push('-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용');
  
  const sqlContent = sqlStatements.join('\n');
  
  // SQL 파일 저장
  const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '014_reset_teams_from_file.sql');
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
  
  console.log(`✅ SQL 파일 생성 완료: ${sqlFilePath}`);
  console.log(`\n📊 생성된 SQL:`);
  console.log(`   - U11 팀: ${teams.U11.length}개`);
  console.log(`   - U12 팀: ${teams.U12.length}개`);
  console.log(`   - 총 팀: ${teams.U11.length + teams.U12.length}개`);
  console.log(`\n⚠️  주의사항:`);
  console.log(`   1. matches 테이블의 팀 ID 업데이트가 필요합니다.`);
  console.log(`   2. fair_play_points 테이블의 팀 ID 업데이트가 필요합니다.`);
  console.log(`   3. 외래키 제약조건을 확인하세요.`);
  
  // 조별 팀 수 확인
  console.log(`\n📋 조별 팀 수:`);
  const groupsU11 = {};
  const groupsU12 = {};
  
  teams.U11.forEach(team => {
    if (!groupsU11[team.group]) groupsU11[team.group] = 0;
    groupsU11[team.group]++;
  });
  
  teams.U12.forEach(team => {
    if (!groupsU12[team.group]) groupsU12[team.group] = 0;
    groupsU12[team.group]++;
  });
  
  console.log(`\nU11:`);
  Object.keys(groupsU11).sort((a, b) => parseInt(a) - parseInt(b)).forEach(group => {
    console.log(`   ${group}조: ${groupsU11[group]}개`);
  });
  
  console.log(`\nU12:`);
  Object.keys(groupsU12).sort((a, b) => parseInt(a) - parseInt(b)).forEach(group => {
    console.log(`   ${group}조: ${groupsU12[group]}개`);
  });
}

generateSQL();
