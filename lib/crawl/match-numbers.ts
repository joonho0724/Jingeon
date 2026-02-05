import { getMatches, updateMatchNumber } from '@/lib/supabase/queries';
import { CrawledMatch } from './joinkfa';

/**
 * 크롤링 결과에서 경기번호를 추출하여 matches 테이블의 match_no가 null인 경기들을 업데이트합니다.
 */
export async function updateMatchNumbersFromCrawledMatches(
  crawledMatches: CrawledMatch[]
): Promise<{
  updated: number;
  failed: number;
  errors: string[];
}> {
  const updated: string[] = [];
  const errors: string[] = [];
  
  // DB의 모든 경기 조회
  const dbMatches = await getMatches();
  
  // 경기번호가 있는 크롤링 결과만 필터링
  const matchesWithNumber = crawledMatches.filter(m => m.matchNumber !== undefined);
  
  console.log(`[경기번호 업데이트] 경기번호가 있는 크롤링 결과: ${matchesWithNumber.length}개`);
  
  for (const crawledMatch of matchesWithNumber) {
    try {
      // DB에서 match_no가 null이고, 크롤링 결과와 매칭되는 경기 찾기
      // 매칭 조건: 날짜, 시간, 연령대, 팀명 (부분 일치)
      const matchedMatches = dbMatches.filter(match => {
        // match_no가 null이거나 없는 경우만
        if (match.match_no !== null && match.match_no !== undefined) {
          return false;
        }
        
        // 연령대 매칭
        if (match.age_group !== crawledMatch.ageGroup) {
          return false;
        }
        
        // 날짜 매칭
        if (match.date !== crawledMatch.date) {
          return false;
        }
        
        // 시간 매칭 (30분 이내 차이 허용)
        if (match.time && crawledMatch.time) {
          const matchTime = parseTime(match.time);
          const crawledTime = parseTime(crawledMatch.time);
          const diffMinutes = Math.abs(matchTime - crawledTime);
          if (diffMinutes > 30) {
            return false;
          }
        }
        
        // 팀명 매칭 (홈팀 또는 원정팀이 크롤링한 팀명과 일치)
        const homeTeamName = match.home_team?.name || '';
        const awayTeamName = match.away_team?.name || '';
        
        const homeMatch = homeTeamName.includes(crawledMatch.homeTeam) || 
                         crawledMatch.homeTeam.includes(homeTeamName) ||
                         homeTeamName === crawledMatch.homeTeam;
        const awayMatch = awayTeamName.includes(crawledMatch.awayTeam) || 
                         crawledMatch.awayTeam.includes(awayTeamName) ||
                         awayTeamName === crawledMatch.awayTeam;
        
        return homeMatch && awayMatch;
      });
      
      if (matchedMatches.length === 0) {
        errors.push(`경기번호 업데이트 실패: 매칭되는 경기를 찾을 수 없음 (${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}, 경기번호: ${crawledMatch.matchNumber})`);
        continue;
      }
      
      if (matchedMatches.length > 1) {
        errors.push(`경기번호 업데이트 실패: 여러 경기가 매칭됨 (${matchedMatches.length}개, ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}, 경기번호: ${crawledMatch.matchNumber})`);
        continue;
      }
      
      const matchedMatch = matchedMatches[0];
      
      // 경기번호만 업데이트 (점수나 상태는 변경하지 않음)
      const updateResult = await updateMatchNumber(matchedMatch.id, crawledMatch.matchNumber!);
      
      if (updateResult) {
        updated.push(matchedMatch.id);
        console.log(`[경기번호 업데이트 성공] 경기 ID: ${matchedMatch.id}, 경기번호: ${crawledMatch.matchNumber}, ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}`);
      } else {
        errors.push(`경기번호 업데이트 실패: DB 업데이트 실패 (${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}, 경기번호: ${crawledMatch.matchNumber})`);
      }
    } catch (error: any) {
      errors.push(`경기번호 업데이트 오류: ${error.message} (${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam})`);
    }
  }
  
  return {
    updated: updated.length,
    failed: errors.length,
    errors,
  };
}

/**
 * 시간 문자열을 분 단위로 변환합니다.
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
