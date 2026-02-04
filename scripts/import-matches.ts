/**
 * 대진표 HTML 파일에서 경기 정보를 파싱하여 데이터베이스에 일괄 삽입하는 스크립트
 * 
 * 사용법: npx tsx scripts/import-matches.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface MatchData {
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM
  round: '1차' | '2차';
  group_name: string;
  venue: string | null; // A, B, C, D, E, F, G, H
  home_team_name: string;
  away_team_name: string;
}

/**
 * HTML 파일에서 대진표 데이터 추출
 */
async function parseScheduleHTML(filePath: string): Promise<MatchData[]> {
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const matches: MatchData[] = [];

  // HTML에서 테이블 데이터 추출
  // 경기 번호, 날짜, 시간, 경기장, 홈팀, 원정팀 정보를 파싱
  // 실제 HTML 구조에 맞게 수정 필요

  // 예시: HTML에서 테이블 행을 찾아서 파싱
  // 이 부분은 실제 HTML 구조에 맞게 수정해야 합니다
  
  console.log('HTML 파일 파싱 중...');
  console.log('파일 크기:', htmlContent.length, 'bytes');
  
  // HTML에서 경기 정보를 추출하는 로직
  // 실제 HTML 구조를 확인한 후 구현 필요
  
  return matches;
}

/**
 * 팀 이름으로 팀 ID 찾기
 */
async function findTeamId(teamName: string, ageGroup: 'U11' | 'U12'): Promise<string | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('name', teamName)
    .eq('age_group', ageGroup)
    .single();

  if (error || !data) {
    console.warn(`팀을 찾을 수 없습니다: ${teamName} (${ageGroup})`);
    return null;
  }

  return data.id;
}

/**
 * 경기 데이터를 데이터베이스에 삽입
 */
async function insertMatches(matches: MatchData[], ageGroup: 'U11' | 'U12') {
  console.log(`\n총 ${matches.length}개의 경기를 삽입합니다...`);

  let successCount = 0;
  let errorCount = 0;

  for (const match of matches) {
    try {
      const homeTeamId = await findTeamId(match.home_team_name, ageGroup);
      const awayTeamId = await findTeamId(match.away_team_name, ageGroup);

      if (!homeTeamId || !awayTeamId) {
        console.error(`경기 스킵: ${match.home_team_name} vs ${match.away_team_name} (팀을 찾을 수 없음)`);
        errorCount++;
        continue;
      }

      const { error } = await supabase
        .from('matches')
        .insert({
          date: match.date,
          time: match.time,
          round: match.round,
          group_name: match.group_name,
          venue: match.venue,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          status: '예정',
        });

      if (error) {
        console.error(`경기 삽입 오류: ${match.home_team_name} vs ${match.away_team_name}`, error.message);
        errorCount++;
      } else {
        console.log(`✓ ${match.date} ${match.time || ''} ${match.home_team_name} vs ${match.away_team_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`경기 삽입 중 예외 발생:`, err);
      errorCount++;
    }
  }

  console.log(`\n완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
}

/**
 * 메인 함수
 */
async function main() {
  const htmlFilePath = path.join(process.cwd(), '00_docs', '2026+서귀포+칠십리+춘계+유소년+축구+페스티벌+1차+리그+대진표.html');

  if (!fs.existsSync(htmlFilePath)) {
    console.error(`파일을 찾을 수 없습니다: ${htmlFilePath}`);
    process.exit(1);
  }

  console.log('대진표 파일을 읽는 중...');
  const matches = await parseScheduleHTML(htmlFilePath);

  if (matches.length === 0) {
    console.error('경기 데이터를 찾을 수 없습니다. HTML 파싱 로직을 확인해주세요.');
    process.exit(1);
  }

  // U12와 U11 경기를 구분하여 삽입
  // 실제 HTML 구조에 따라 수정 필요
  console.log('\n경기 데이터 삽입 시작...');
  await insertMatches(matches, 'U12'); // 또는 U11
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { parseScheduleHTML, insertMatches };
