/**
 * U11 팀을 정확히 63개로 정리하는 완전한 SQL 생성
 * 삭제할 팀의 경기 데이터를 먼저 통합한 후 삭제
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

async function generateCompleteCleanupSQL() {
  console.log('🔍 U11 팀 완전 정리 SQL 생성 중...\n');

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

    const sqlStatements = [];
    sqlStatements.push('BEGIN;');
    sqlStatements.push('-- U11 팀을 정확히 63개로 정리 (완전 버전)');
    sqlStatements.push('-- 생성일: ' + new Date().toISOString());
    sqlStatements.push('-- team-names.txt 파일 기준');
    sqlStatements.push('-- 1단계: 중복 팀 통합 (011_merge_duplicate_teams.sql 실행 후)');
    sqlStatements.push('-- 2단계: 팀 정보 업데이트 및 불필요한 팀 삭제');
    sqlStatements.push('');

    const matchedDbTeamIds = new Set();
    const teamsToDelete = [];
    const teamsToUpdate = [];

    // 파일의 각 팀에 대해 DB에서 매칭
    fileTeams.forEach(fileTeam => {
      const matchedDbTeam = dbTeams.find(dbTeam => {
        if (matchedDbTeamIds.has(dbTeam.id)) return false;
        
        const dbNormalized = normalizeTeamName(dbTeam.name);
        return dbNormalized === fileTeam.normalizedName ||
               dbNormalized.includes(fileTeam.normalizedName) ||
               fileTeam.normalizedName.includes(dbNormalized);
      });

      if (matchedDbTeam) {
        matchedDbTeamIds.add(matchedDbTeam.id);
        
        // 팀 정보 업데이트 필요 여부 확인
        if (matchedDbTeam.group_name1 !== fileTeam.group || 
            matchedDbTeam.group_team_no1 !== fileTeam.teamNumber) {
          teamsToUpdate.push({
            dbTeam: matchedDbTeam,
            fileTeam: fileTeam,
          });
        }
      }
    });

    // 매칭되지 않은 DB 팀들 찾기
    dbTeams.forEach(dbTeam => {
      if (!matchedDbTeamIds.has(dbTeam.id)) {
        // 같은 조에서 매칭된 팀 찾기 (경기 데이터 통합용)
        const sameGroupFileTeam = fileTeams.find(ft => ft.group === dbTeam.group_name1);
        if (sameGroupFileTeam) {
          const matchedTeamInSameGroup = dbTeams.find(dt => {
            if (!matchedDbTeamIds.has(dt.id)) return false;
            const dtNormalized = normalizeTeamName(dt.name);
            return dtNormalized === sameGroupFileTeam.normalizedName ||
                   dtNormalized.includes(sameGroupFileTeam.normalizedName) ||
                   sameGroupFileTeam.normalizedName.includes(dtNormalized);
          });
          
          if (matchedTeamInSameGroup) {
            teamsToDelete.push({
              team: dbTeam,
              mergeTo: matchedTeamInSameGroup,
            });
          } else {
            teamsToDelete.push({
              team: dbTeam,
              mergeTo: null,
            });
          }
        } else {
          teamsToDelete.push({
            team: dbTeam,
            mergeTo: null,
          });
        }
      }
    });

    // 1. 팀 정보 업데이트
    if (teamsToUpdate.length > 0) {
      sqlStatements.push('-- ============================================');
      sqlStatements.push('-- 1. 팀 정보 업데이트 (조, 팀번호)');
      sqlStatements.push('-- ============================================');
      sqlStatements.push('');
      
      teamsToUpdate.forEach(({ dbTeam, fileTeam }) => {
        sqlStatements.push(`-- ${fileTeam.group}조 ${fileTeam.teamNumber}번: ${fileTeam.name}`);
        sqlStatements.push(`UPDATE teams SET group_name1 = '${fileTeam.group}', group_team_no1 = ${fileTeam.teamNumber} WHERE id = '${dbTeam.id}';`);
        sqlStatements.push('');
      });
    }

    // 2. 삭제할 팀의 경기 데이터 통합
    const teamsWithMerge = teamsToDelete.filter(t => t.mergeTo !== null);
    if (teamsWithMerge.length > 0) {
      sqlStatements.push('-- ============================================');
      sqlStatements.push('-- 2. 삭제할 팀의 경기 데이터 통합');
      sqlStatements.push('-- ============================================');
      sqlStatements.push('');
      
      teamsWithMerge.forEach(({ team, mergeTo }) => {
        sqlStatements.push(`-- ${team.group_name1}조: ${team.name} → ${mergeTo.name}`);
        sqlStatements.push(`UPDATE matches SET home_team_id = '${mergeTo.id}' WHERE home_team_id = '${team.id}';`);
        sqlStatements.push(`UPDATE matches SET away_team_id = '${mergeTo.id}' WHERE away_team_id = '${team.id}';`);
        sqlStatements.push(`UPDATE fair_play_points SET team_id = '${mergeTo.id}' WHERE team_id = '${team.id}';`);
        sqlStatements.push('');
      });
    }

    // 3. 불필요한 팀 삭제
    if (teamsToDelete.length > 0) {
      sqlStatements.push('-- ============================================');
      sqlStatements.push('-- 3. 불필요한 팀 삭제 (team-names.txt에 없는 팀)');
      sqlStatements.push('-- ============================================');
      sqlStatements.push('');
      
      teamsToDelete.forEach(({ team, mergeTo }) => {
        if (mergeTo) {
          sqlStatements.push(`-- ${team.group_name1}조: ${team.name} (이미 ${mergeTo.name}로 통합됨)`);
        } else {
          sqlStatements.push(`-- ${team.group_name1}조: ${team.name} (경기 데이터 확인 필요)`);
        }
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
    console.log(`   - 업데이트할 팀: ${teamsToUpdate.length}개`);
    console.log(`   - 삭제할 팀: ${teamsToDelete.length}개`);
    console.log(`     - 경기 데이터 통합 후 삭제: ${teamsWithMerge.length}개`);
    console.log(`     - 직접 삭제 (통합 대상 없음): ${teamsToDelete.length - teamsWithMerge.length}개`);
    console.log(`   - 최종 팀 수: ${matchedDbTeamIds.size}개 (목표: 63개)`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

generateCompleteCleanupSQL();
