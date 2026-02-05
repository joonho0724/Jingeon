/**
 * U11 팀을 63개로 정리하는 SQL 생성 스크립트
 * team-names.txt를 기준으로 DB를 정리합니다.
 * 
 * 사용법: node scripts/cleanup-u11-teams-to-63.js
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

async function generateCleanupSQL() {
  console.log('🔍 U11 팀 정리 SQL 생성 중...\n');

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

    // team-names.txt의 각 팀에 대해 DB에서 매칭
    const sqlStatements = [];
    sqlStatements.push('BEGIN;');
    sqlStatements.push('-- U11 팀을 63개로 정리하는 SQL');
    sqlStatements.push('-- 생성일: ' + new Date().toISOString());
    sqlStatements.push('-- team-names.txt 기준으로 정리');
    sqlStatements.push('');

    const teamsToKeep = new Set();
    const teamsToDelete = [];

    expectedTeams.forEach(expected => {
      // DB에서 매칭되는 팀 찾기 (정규화된 이름으로 비교)
      const matched = dbTeams.find(db => {
        const dbNormalized = normalizeTeamName(db.name);
        const expectedNormalized = normalizeTeamName(expected.name);
        return dbNormalized === expectedNormalized && db.group_name1 === expected.group;
      });

      if (matched) {
        teamsToKeep.add(matched.id);
        // 팀명과 팀번호 업데이트 (필요한 경우)
        if (matched.name !== expected.name || matched.group_team_no1 !== expected.teamNumber) {
          sqlStatements.push(`-- ${expected.group}조 ${expected.teamNumber}번: ${matched.name} → ${expected.name}`);
          sqlStatements.push(`UPDATE teams SET name = '${expected.name.replace(/'/g, "''")}', group_team_no1 = ${expected.teamNumber} WHERE id = '${matched.id}';`);
          sqlStatements.push('');
        }
      } else {
        console.log(`⚠️  매칭 실패: ${expected.name} (${expected.group}조 ${expected.teamNumber}번)`);
      }
    });

    // 유지할 팀이 아닌 모든 U11 팀 삭제
    dbTeams.forEach(db => {
      if (!teamsToKeep.has(db.id)) {
        teamsToDelete.push(db);
      }
    });

    if (teamsToDelete.length > 0) {
      sqlStatements.push('-- 삭제할 팀들의 경기 데이터 먼저 확인');
      sqlStatements.push('-- (경기가 있는 팀은 삭제하지 않도록 주의)');
      sqlStatements.push('');

      // 삭제할 팀들의 경기 확인
      for (const team of teamsToDelete) {
        sqlStatements.push(`-- ${team.name} (${team.group_name1}조, ID: ${team.id})`);
        sqlStatements.push(`-- SELECT COUNT(*) FROM matches WHERE home_team_id = '${team.id}' OR away_team_id = '${team.id}';`);
      }
      sqlStatements.push('');

      // 경기가 없는 팀만 삭제
      sqlStatements.push('-- 경기가 없는 팀 삭제');
      teamsToDelete.forEach(team => {
        sqlStatements.push(`-- ${team.name} (${team.group_name1}조)`);
        sqlStatements.push(`DELETE FROM teams WHERE id = '${team.id}' AND NOT EXISTS (SELECT 1 FROM matches WHERE home_team_id = '${team.id}' OR away_team_id = '${team.id}');`);
      });
      sqlStatements.push('');

      // 경기가 있는 팀은 경기 데이터를 먼저 업데이트해야 함
      sqlStatements.push('-- ⚠️  경기가 있는 팀은 위의 DELETE가 실행되지 않습니다.');
      sqlStatements.push('-- 경기 데이터를 먼저 업데이트한 후 수동으로 삭제해야 합니다.');
    }

    sqlStatements.push('COMMIT;');
    sqlStatements.push('-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용');

    const sqlContent = sqlStatements.join('\n');
    
    // SQL 파일 저장
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '012_cleanup_u11_teams_to_63.sql');
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    
    console.log(`✅ SQL 파일 생성 완료: ${sqlFilePath}`);
    console.log(`\n📊 요약:`);
    console.log(`  유지할 팀: ${teamsToKeep.size}개`);
    console.log(`  삭제할 팀: ${teamsToDelete.length}개`);
    console.log(`\n⚠️  실행 전에 SQL 파일을 확인하세요!`);
    console.log(`   특히 경기가 있는 팀은 경기 데이터를 먼저 업데이트해야 합니다.`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

generateCleanupSQL();
