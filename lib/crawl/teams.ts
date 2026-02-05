import { CrawledMatch } from './joinkfa';
import { upsertTeam } from '@/lib/supabase/queries';

/**
 * 크롤링 결과에서 팀 정보를 추출하여 teams 테이블을 업데이트합니다.
 */
export async function updateTeamsFromCrawledMatches(
  crawledMatches: CrawledMatch[]
): Promise<{
  updated: number;
  created: number;
  errors: string[];
}> {
  const updated: string[] = [];
  const created: string[] = [];
  const errors: string[] = [];
  const processedTeams = new Set<string>(); // 중복 처리 방지 (팀명+연령대)

  for (const match of crawledMatches) {
    try {
      // 홈팀 처리
      const homeTeamKey = `${match.homeTeam}_${match.ageGroup}`;
      if (!processedTeams.has(homeTeamKey)) {
        const result = await upsertTeam({
          name: match.homeTeam,
          age_group: match.ageGroup,
          group_name1: match.group || 'A', // 1차 리그 조 정보가 없으면 기본값 'A'
          group_name2: null, // 2차 리그 조는 나중에 업데이트
          group_team_no1: null, // 크롤링 결과에서 조 내 팀 번호는 추출 불가 (나중에 업데이트)
          registration_no: null, // 크롤링 결과에서 전체 팀 번호는 추출 불가
        });

        if (result.team) {
          if (result.isNew) {
            created.push(homeTeamKey);
          } else {
            updated.push(homeTeamKey);
          }
          processedTeams.add(homeTeamKey);
        } else {
          errors.push(`홈팀 업데이트 실패: ${match.homeTeam} (${match.ageGroup})`);
        }
      }

      // 원정팀 처리
      const awayTeamKey = `${match.awayTeam}_${match.ageGroup}`;
      if (!processedTeams.has(awayTeamKey)) {
        const result = await upsertTeam({
          name: match.awayTeam,
          age_group: match.ageGroup,
          group_name1: match.group || 'A', // 1차 리그 조 정보가 없으면 기본값 'A'
          group_name2: null, // 2차 리그 조는 나중에 업데이트
          group_team_no1: null, // 크롤링 결과에서 조 내 팀 번호는 추출 불가 (나중에 업데이트)
          registration_no: null, // 크롤링 결과에서 전체 팀 번호는 추출 불가
        });

        if (result.team) {
          if (result.isNew) {
            created.push(awayTeamKey);
          } else {
            updated.push(awayTeamKey);
          }
          processedTeams.add(awayTeamKey);
        } else {
          errors.push(`원정팀 업데이트 실패: ${match.awayTeam} (${match.ageGroup})`);
        }
      }
    } catch (error: any) {
      errors.push(`팀 업데이트 오류 (${match.homeTeam} vs ${match.awayTeam}): ${error.message}`);
    }
  }

  return {
    updated: updated.length,
    created: created.length,
    errors,
  };
}
