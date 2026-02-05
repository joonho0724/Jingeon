/**
 * U11 팀을 정확히 63개로 정리하는 SQL 생성
 * team-names.txt 파일을 기준으로 정확한 팀 목록 생성
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
    
    if (line.includes('U11') && line.includes('1차')) {
      currentSection = 'U11';
      continue;
    }
    
    if (line.includes('U12') && line.includes('1차')) {
      currentSection = 'U12';
      continue;
    }
    
    if (line.includes('-------')) {
      currentSection = null;
      continue;
    }
    
    if (line.match(/^\d+조$/)) {
      currentGroup = line.replace('조', '');
      continue;
    }
    
    if (line.match(/^\d+\./)) {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match && currentSection === 'U11' && currentGroup) {
        const teamNumber = parseInt(match[1]);
        const teamName = match[2].trim();
        
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

async function generateCleanupSQL() {
  console.log('🔍 U11 팀 정리 SQL 생성 중...\n');

  try {
    // 파일에서 정확한 팀 목록 파싱
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

    // 각 파일 팀에 대해 DB에서 매칭
    const sqlStatements = [];
    sqlStatements.push('BEGIN;');
    sqlStatements.push('-- U11 팀을 정확히 63개로 정리');
    sqlStatements.push('-- 생성일: ' + new Date().toISOString());
    sqlStatements.push('-- team-names.txt 파일 기준');
    sqlStatements.push('');

    const matchedDbTeamIds = new Set();
    const teamsToDelete = [];

    // 파일의 각 팀에 대해 DB에서 매칭
    fileTeams.forEach(fileTeam => {
      const matchedDbTeam = dbTeams.find(dbTeam => {
        if (matchedDbTeamIds.has(dbTeam.id)) return false; // 이미 매칭된 팀은 제외
        
        const dbNormalized = normalizeTeamName(dbTeam.name);
        return dbNormalized === fileTeam.normalizedName ||
               dbNormalized.includes(fileTeam.normalizedName) ||
               fileTeam.normalizedName.includes(dbNormalized);
      });

      if (matchedDbTeam) {
        matchedDbTeamIds.add(matchedDbTeam.id);
        
        // 팀 정보 업데이트 (조, 팀번호 등)
        if (matchedDbTeam.group_name1 !== fileTeam.group || 
            matchedDbTeam.group_team_no1 !== fileTeam.teamNumber) {
          sqlStatements.push(`-- ${fileTeam.group}조 ${fileTeam.teamNumber}번: ${fileTeam.name}`);
          sqlStatements.push(`UPDATE teams SET group_name1 = '${fileTeam.group}', group_team_no1 = ${fileTeam.teamNumber} WHERE id = '${matchedDbTeam.id}';`);
          sqlStatements.push('');
        }
      }
    });

    // 매칭되지 않은 DB 팀들 (삭제 대상)
    dbTeams.forEach(dbTeam => {
      if (!matchedDbTeamIds.has(dbTeam.id)) {
        teamsToDelete.push(dbTeam);
      }
    });

    // 삭제할 팀들 처리
    if (teamsToDelete.length > 0) {
      sqlStatements.push('-- 매칭되지 않은 팀 삭제 (team-names.txt에 없는 팀)');
      teamsToDelete.forEach(team => {
        sqlStatements.push(`-- ${team.group_name1}조: ${team.name} (ID: ${team.id})`);
        // matches 테이블의 참조 업데이트 (이미 통합된 팀으로)
        sqlStatements.push(`-- 참고: 이 팀의 경기 데이터는 이미 통합되었거나 수동으로 처리해야 합니다.`);
        sqlStatements.push(`DELETE FROM teams WHERE id = '${team.id}';`);
        sqlStatements.push('');
      });
    }

    sqlStatements.push('COMMIT;');
    sqlStatements.push('-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용');

    const sqlContent = sqlStatements.join('\n');
    
    // SQL 파일 저장
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '012_cleanup_u11_teams_to_63.sql');
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    
    console.log(`✅ SQL 파일 생성 완료: ${sqlFilePath}`);
    console.log(`\n📊 정리 계획:`);
    console.log(`   - 매칭된 팀: ${matchedDbTeamIds.size}개`);
    console.log(`   - 삭제할 팀: ${teamsToDelete.length}개`);
    console.log(`   - 최종 팀 수: ${matchedDbTeamIds.size}개 (목표: 63개)`);
    
    if (teamsToDelete.length > 0) {
      console.log(`\n⚠️  삭제할 팀 목록:`);
      teamsToDelete.forEach(team => {
        console.log(`   - ${team.group_name1}조: ${team.name} (ID: ${team.id})`);
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

generateCleanupSQL();
