/**
 * team-names.txt 파일을 기반으로 teams 테이블을 완전 초기화하고 재구성하는 SQL 생성
 * 경기 데이터 보존을 위한 안전한 초기화 버전
 * 
 * 사용법: node scripts/generate-teams-complete-reset-sql.js
 */

const fs = require('fs');
const path = require('path');

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
          });
        }
      }
    }
  }
  
  return teams;
}

function generateCompleteResetSQL() {
  console.log('🔍 team-names.txt 파일 파싱 중...\n');

  const teams = parseTeamNames();
  
  console.log(`✅ U11: ${teams.U11.length}개 팀`);
  console.log(`✅ U12: ${teams.U12.length}개 팀`);
  console.log(`✅ 총: ${teams.U11.length + teams.U12.length}개 팀\n`);

  const sqlStatements = [];
  
  sqlStatements.push('BEGIN;');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- teams 테이블 완전 초기화 및 재구성');
  sqlStatements.push('-- 생성일: ' + new Date().toISOString());
  sqlStatements.push('-- team-names.txt 파일 기준');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('');
  sqlStatements.push('-- ⚠️  주의: 이 SQL은 기존 U11, U12 팀을 모두 삭제합니다.');
  sqlStatements.push('-- 경기 데이터(matches)와의 외래키 관계를 고려하여');
  sqlStatements.push('-- 먼저 matches 테이블의 참조를 처리해야 합니다.');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 1단계: 기존 U11, U12 팀 삭제');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 옵션 A: CASCADE 삭제 (경기 데이터도 함께 삭제)');
  sqlStatements.push('-- DELETE FROM teams WHERE age_group IN (\'U11\', \'U12\');');
  sqlStatements.push('');
  sqlStatements.push('-- 옵션 B: 경기 데이터 보존 (권장)');
  sqlStatements.push('-- 먼저 matches 테이블의 home_team_id, away_team_id를 NULL로 설정');
  sqlStatements.push('UPDATE matches SET home_team_id = NULL WHERE home_team_id IN (SELECT id FROM teams WHERE age_group IN (\'U11\', \'U12\'));');
  sqlStatements.push('UPDATE matches SET away_team_id = NULL WHERE away_team_id IN (SELECT id FROM teams WHERE age_group IN (\'U11\', \'U12\'));');
  sqlStatements.push('');
  sqlStatements.push('-- fair_play_points 테이블의 team_id도 NULL로 설정');
  sqlStatements.push('UPDATE fair_play_points SET team_id = NULL WHERE team_id IN (SELECT id FROM teams WHERE age_group IN (\'U11\', \'U12\'));');
  sqlStatements.push('');
  sqlStatements.push('-- 이제 기존 팀 삭제');
  sqlStatements.push('DELETE FROM teams WHERE age_group IN (\'U11\', \'U12\');');
  sqlStatements.push('');
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 2단계: U11 팀 삽입');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('');
  
  teams.U11.forEach((team, index) => {
    const isLast = index === teams.U11.length - 1;
    sqlStatements.push(`-- ${team.group}조 ${team.teamNumber}번: ${team.name}`);
    sqlStatements.push(`INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)`);
    sqlStatements.push(`VALUES (`);
    sqlStatements.push(`  '${team.name.replace(/'/g, "''")}',`);
    sqlStatements.push(`  'U11',`);
    sqlStatements.push(`  '${team.group}',`);
    sqlStatements.push(`  ${team.teamNumber},`);
    sqlStatements.push(`  NULL,`);
    sqlStatements.push(`  NULL,`);
    sqlStatements.push(`  NOW(),`);
    sqlStatements.push(`  NOW()`);
    sqlStatements.push(`)`);
    if (!isLast || teams.U12.length > 0) {
      sqlStatements.push(`;`);
    }
    sqlStatements.push('');
  });
  
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 3단계: U12 팀 삽입');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('');
  
  teams.U12.forEach((team, index) => {
    const isLast = index === teams.U12.length - 1;
    sqlStatements.push(`-- ${team.group}조 ${team.teamNumber}번: ${team.name}`);
    sqlStatements.push(`INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)`);
    sqlStatements.push(`VALUES (`);
    sqlStatements.push(`  '${team.name.replace(/'/g, "''")}',`);
    sqlStatements.push(`  'U12',`);
    sqlStatements.push(`  '${team.group}',`);
    sqlStatements.push(`  ${team.teamNumber},`);
    sqlStatements.push(`  NULL,`);
    sqlStatements.push(`  NULL,`);
    sqlStatements.push(`  NOW(),`);
    sqlStatements.push(`  NOW()`);
    sqlStatements.push(`)`);
    if (!isLast) {
      sqlStatements.push(`;`);
    }
    sqlStatements.push('');
  });
  
  sqlStatements.push('COMMIT;');
  sqlStatements.push('-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용');
  sqlStatements.push('');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- 확인 쿼리');
  sqlStatements.push('-- ============================================');
  sqlStatements.push('-- SELECT age_group, COUNT(*) as count FROM teams WHERE age_group IN (\'U11\', \'U12\') GROUP BY age_group;');
  sqlStatements.push('-- SELECT age_group, group_name1, COUNT(*) as count FROM teams WHERE age_group IN (\'U11\', \'U12\') GROUP BY age_group, group_name1 ORDER BY age_group, group_name1;');
  sqlStatements.push('-- SELECT * FROM teams WHERE age_group IN (\'U11\', \'U12\') ORDER BY age_group, group_name1, group_team_no1;');

  const sqlContent = sqlStatements.join('\n');
  
  // SQL 파일 저장
  const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '015_complete_reset_teams_from_file.sql');
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
  
  console.log(`✅ SQL 파일 생성 완료: ${sqlFilePath}`);
  console.log(`\n📊 생성된 SQL:`);
  console.log(`   - U11 팀: ${teams.U11.length}개`);
  console.log(`   - U12 팀: ${teams.U12.length}개`);
  console.log(`   - 총 팀: ${teams.U11.length + teams.U12.length}개`);
  console.log(`\n⚠️  주의사항:`);
  console.log(`   - 이 SQL은 기존 U11, U12 팀을 모두 삭제합니다.`);
  console.log(`   - 경기 데이터(matches)의 참조를 먼저 NULL로 설정합니다.`);
  console.log(`   - 실행 전에 백업을 권장합니다.`);
  console.log(`   - 실행 후 matches 테이블의 team_id를 새로운 팀 ID로 업데이트해야 할 수 있습니다.`);
}

generateCompleteResetSQL();
