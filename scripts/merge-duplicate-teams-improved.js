/**
 * 중복 팀 통합 계획 생성 스크립트 (개선 버전)
 * 
 * 같은 조 내에서 팀명이 유사한 팀들을 찾아서 통합 계획을 생성합니다.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 팀명 정규화 함수 (더 정확한 버전)
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

// 두 팀명이 같은지 확인 (더 정확한 버전)
function areTeamsSame(name1, name2) {
  const norm1 = normalizeTeamName(name1);
  const norm2 = normalizeTeamName(name2);
  
  // 완전 일치
  if (norm1 === norm2) return true;
  
  // 하나가 다른 하나를 포함하는 경우 (길이 차이가 3 이하)
  if (Math.abs(norm1.length - norm2.length) <= 3) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      // 너무 짧은 경우는 제외 (최소 3자 이상)
      if (norm1.length >= 3 && norm2.length >= 3) {
        return true;
      }
    }
  }
  
  return false;
}

async function generateMergePlan() {
  console.log('🔍 중복 팀 통합 계획 생성 중 (개선 버전)...\n');

  try {
    // 모든 팀 조회
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('age_group')
      .order('group_name1')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ 팀 목록 조회 실패:', error);
      return;
    }

    console.log(`✅ 전체 팀 수: ${teams.length}개\n`);

    // 연령대별, 조별로 그룹화
    const groupsByAge = {
      U11: {},
      U12: {},
    };

    teams.forEach(team => {
      if (!team.group_name1) return;
      
      const key = `${team.age_group}-${team.group_name1}`;
      if (!groupsByAge[team.age_group][team.group_name1]) {
        groupsByAge[team.age_group][team.group_name1] = [];
      }
      groupsByAge[team.age_group][team.group_name1].push(team);
    });

    const mergePlan = [];
    const processed = new Set();

    // 각 조별로 중복 팀 찾기
    for (const ageGroup of ['U11', 'U12']) {
      for (const groupName of Object.keys(groupsByAge[ageGroup]).sort((a, b) => parseInt(a) - parseInt(b))) {
        const teamsInGroup = groupsByAge[ageGroup][groupName];
        
        if (teamsInGroup.length <= 4) continue; // 4팀 이하면 스킵

        // 각 팀을 다른 팀들과 비교
        for (let i = 0; i < teamsInGroup.length; i++) {
          if (processed.has(teamsInGroup[i].id)) continue;
          
          const team1 = teamsInGroup[i];
          const duplicates = [];
          
          for (let j = i + 1; j < teamsInGroup.length; j++) {
            if (processed.has(teamsInGroup[j].id)) continue;
            
            const team2 = teamsInGroup[j];
            
            if (areTeamsSame(team1.name, team2.name)) {
              duplicates.push(team2);
              processed.add(team2.id);
            }
          }
          
          if (duplicates.length > 0) {
            // 가장 최근에 생성된 팀을 대표로 선택
            const allTeams = [team1, ...duplicates];
            allTeams.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const representative = allTeams[0];
            const toMerge = allTeams.slice(1);
            
            mergePlan.push({
              ageGroup,
              groupName,
              representative: {
                id: representative.id,
                name: representative.name,
                created_at: representative.created_at,
              },
              duplicates: toMerge.map(t => ({
                id: t.id,
                name: t.name,
                created_at: t.created_at,
              })),
            });
            
            processed.add(representative.id);
            toMerge.forEach(t => processed.add(t.id));
          }
        }
      }
    }

    console.log(`📋 통합 계획: ${mergePlan.length}개 그룹\n`);

    // 통합 계획 출력
    mergePlan.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.ageGroup} ${plan.groupName}조`);
      console.log(`   대표: ${plan.representative.name} (ID: ${plan.representative.id})`);
      plan.duplicates.forEach(dup => {
        console.log(`   → 통합: ${dup.name} (ID: ${dup.id})`);
      });
      console.log('');
    });

    if (mergePlan.length === 0) {
      console.log('✅ 통합할 중복 팀이 없습니다.');
      return;
    }

    // SQL 파일 생성
    const sqlStatements = [];
    sqlStatements.push('BEGIN;');
    sqlStatements.push('-- 중복 팀 통합 작업 (개선 버전)');
    sqlStatements.push('-- 생성일: ' + new Date().toISOString());
    sqlStatements.push('-- 총 ' + mergePlan.length + '개 그룹, ' + mergePlan.reduce((sum, p) => sum + p.duplicates.length, 0) + '개 팀 통합');
    sqlStatements.push('');

    mergePlan.forEach((plan) => {
      plan.duplicates.forEach(dup => {
        // 1. matches 테이블의 home_team_id 업데이트
        sqlStatements.push(`-- ${plan.ageGroup} ${plan.groupName}조: ${dup.name} → ${plan.representative.name}`);
        sqlStatements.push(`UPDATE matches SET home_team_id = '${plan.representative.id}' WHERE home_team_id = '${dup.id}';`);
        // 2. matches 테이블의 away_team_id 업데이트
        sqlStatements.push(`UPDATE matches SET away_team_id = '${plan.representative.id}' WHERE away_team_id = '${dup.id}';`);
        // 3. fair_play_points 테이블의 team_id 업데이트 (있는 경우)
        sqlStatements.push(`UPDATE fair_play_points SET team_id = '${plan.representative.id}' WHERE team_id = '${dup.id}';`);
        // 4. 중복 팀 삭제
        sqlStatements.push(`DELETE FROM teams WHERE id = '${dup.id}';`);
        sqlStatements.push('');
      });
    });

    sqlStatements.push('COMMIT;');
    sqlStatements.push('-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용');

    const sqlContent = sqlStatements.join('\n');
    
    // SQL 파일 저장
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '011_merge_duplicate_teams.sql');
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    
    console.log(`✅ SQL 파일 생성 완료: ${sqlFilePath}`);
    console.log(`\n⚠️  실행 전에 SQL 파일을 확인하세요!`);
    console.log(`   총 ${mergePlan.length}개 그룹, ${mergePlan.reduce((sum, p) => sum + p.duplicates.length, 0)}개 팀이 통합됩니다.`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

generateMergePlan();
