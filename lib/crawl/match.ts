import { CrawledMatch } from './joinkfa';
import { Match, Team } from '@/types/database';
import { getMatches, getTeams } from '@/lib/supabase/queries';

export interface MatchResult {
  crawledMatch: CrawledMatch;
  matchedMatchId?: string;
  matchStatus: 'matched' | 'failed' | 'duplicate';
  reason?: string;
  needsMatchNoUpdate?: boolean; // 경기번호 업데이트 필요 여부
}

/**
 * 크롤링한 경기 결과를 DB의 기존 경기와 매칭합니다.
 * 팀명이 다르면 실패하지 않고, 최신 팀 목록을 다시 조회하여 재시도합니다.
 */
export async function matchCrawledResults(
  crawledMatches: CrawledMatch[]
): Promise<MatchResult[]> {
  let [dbMatches, dbTeams] = await Promise.all([getMatches(), getTeams()]);

  const results: MatchResult[] = [];
  let teamsRefreshed = false; // 팀 목록 재조회 여부

  for (const crawledMatch of crawledMatches) {
    let result = await matchSingleMatch(crawledMatch, dbMatches, dbTeams);
    
    // 팀명 매칭 실패 시, 팀 목록을 다시 조회하여 재시도 (팀 정보가 업데이트되었을 수 있음)
    if (result.matchStatus === 'failed' && result.reason?.includes('팀명 매칭 실패') && !teamsRefreshed) {
      console.log(`[매칭] 팀명 매칭 실패 - 팀 목록 재조회 후 재시도: ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}`);
      dbTeams = await getTeams(); // 최신 팀 목록 조회
      teamsRefreshed = true;
      result = await matchSingleMatch(crawledMatch, dbMatches, dbTeams); // 재시도
    }
    
    results.push(result);
  }

  return results;
}

/**
 * 단일 크롤링 경기를 DB 경기와 매칭합니다.
 */
async function matchSingleMatch(
  crawledMatch: CrawledMatch,
  dbMatches: Match[],
  dbTeams: Team[]
): Promise<MatchResult> {
  // 1. 팀명 매칭
  const homeTeam = matchTeamName(crawledMatch.homeTeam, dbTeams, crawledMatch.ageGroup);
  const awayTeam = matchTeamName(crawledMatch.awayTeam, dbTeams, crawledMatch.ageGroup);

  if (!homeTeam || !awayTeam) {
    const missingTeams = [];
    if (!homeTeam) missingTeams.push(`홈팀: ${crawledMatch.homeTeam}`);
    if (!awayTeam) missingTeams.push(`원정팀: ${crawledMatch.awayTeam}`);
    console.log(`[매칭 실패] 팀명 매칭 실패 (경기번호: ${crawledMatch.matchNumber || 'N/A'}): ${missingTeams.join(', ')}`);
    return {
      crawledMatch,
      matchStatus: 'failed',
      reason: `팀명 매칭 실패: ${missingTeams.join(', ')}`,
    };
  }

  // 2. 경기 매칭 (경기번호 우선 → 팀명 + 날짜 + 시간)
  let matchedMatches = dbMatches.filter((match) => {
    // 경기번호가 있으면 우선 매칭 (가장 정확함)
    if (crawledMatch.matchNumber && match.match_no) {
      if (match.match_no === crawledMatch.matchNumber) {
        // 경기번호가 일치하면 연령대만 확인
        if (match.age_group === crawledMatch.ageGroup) {
          console.log(`[매칭] 경기번호로 매칭 성공: 경기번호 ${crawledMatch.matchNumber}, 연령대 ${crawledMatch.ageGroup}, ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}`);
          return true;
        } else {
          console.log(`[매칭] 경기번호는 일치하지만 연령대 불일치: 경기번호 ${crawledMatch.matchNumber}, 크롤링 연령대 ${crawledMatch.ageGroup}, DB 연령대 ${match.age_group}`);
        }
      }
      // 경기번호가 다르면 이 경기는 제외 (하지만 다른 경기번호 없는 경기는 계속 확인)
      return false;
    }

    // 경기번호가 없거나 DB에 경기번호가 없으면 기존 방식으로 매칭 (팀명 + 날짜 + 시간)
    // 팀 매칭
    const teamMatch =
      (match.home_team_id === homeTeam.id && match.away_team_id === awayTeam.id) ||
      (match.home_team_id === awayTeam.id && match.away_team_id === homeTeam.id);

    if (!teamMatch) return false;

    // 연령대 매칭
    if (match.age_group !== crawledMatch.ageGroup) return false;

    // 날짜 매칭
    if (match.date !== crawledMatch.date) return false;

    // 시간 매칭 (30분 이내 차이 허용)
    if (match.time && crawledMatch.time) {
      const matchTime = parseTime(match.time);
      const crawledTime = parseTime(crawledMatch.time);
      const diffMinutes = Math.abs(matchTime - crawledTime);
      if (diffMinutes > 30) return false;
    }

    return true;
  });

  // 경기번호로 매칭 시도했지만 실패한 경우, 경기번호 조건 없이 다시 시도
  if (crawledMatch.matchNumber && matchedMatches.length === 0) {
    console.log(`[매칭] 경기번호 ${crawledMatch.matchNumber}로 매칭 실패 (팀: ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}), 경기번호 조건 없이 재시도`);
    matchedMatches = dbMatches.filter((match) => {
      // 팀 매칭
      const teamMatch =
        (match.home_team_id === homeTeam.id && match.away_team_id === awayTeam.id) ||
        (match.home_team_id === awayTeam.id && match.away_team_id === homeTeam.id);

      if (!teamMatch) return false;

      // 연령대 매칭
      if (match.age_group !== crawledMatch.ageGroup) return false;

      // 날짜 매칭
      if (match.date !== crawledMatch.date) return false;

      // 시간 매칭 (30분 이내 차이 허용)
      if (match.time && crawledMatch.time) {
        const matchTime = parseTime(match.time);
        const crawledTime = parseTime(crawledMatch.time);
        const diffMinutes = Math.abs(matchTime - crawledTime);
        if (diffMinutes > 30) return false;
      }

      return true;
    });
    
    if (matchedMatches.length > 0) {
      console.log(`[매칭] 경기번호 조건 없이 매칭 성공: ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam}`);
    }
  }

  if (matchedMatches.length === 0) {
    const reason = crawledMatch.matchNumber 
      ? `매칭되는 경기를 찾을 수 없습니다. (경기번호: ${crawledMatch.matchNumber}, 연령대: ${crawledMatch.ageGroup}, 날짜: ${crawledMatch.date}, 시간: ${crawledMatch.time})`
      : `매칭되는 경기를 찾을 수 없습니다. (연령대: ${crawledMatch.ageGroup}, 날짜: ${crawledMatch.date}, 시간: ${crawledMatch.time}, 팀: ${crawledMatch.homeTeam} vs ${crawledMatch.awayTeam})`;
    console.log(`[매칭 실패] ${reason}`);
    return {
      crawledMatch,
      matchStatus: 'failed',
      reason,
    };
  }

  if (matchedMatches.length > 1) {
    return {
      crawledMatch,
      matchStatus: 'duplicate',
      reason: `여러 경기가 매칭되었습니다 (${matchedMatches.length}개).`,
    };
  }

  const matchedMatch = matchedMatches[0];

  // 홈/원정 팀 확인 및 점수 조정
  let homeScore = crawledMatch.homeScore;
  let awayScore = crawledMatch.awayScore;

  // DB의 홈팀이 크롤링한 원정팀과 일치하면 점수 교환
  if (matchedMatch.home_team_id === awayTeam.id) {
    [homeScore, awayScore] = [awayScore, homeScore];
  }

  console.log(`[매칭 성공] 경기 ID: ${matchedMatch.id}, DB 경기번호: ${matchedMatch.match_no || 'N/A'}, 크롤링 경기번호: ${crawledMatch.matchNumber || 'N/A'}, 점수: ${homeScore} : ${awayScore}`);
  
  // 경기번호가 크롤링 데이터에 있지만 DB에 없으면 업데이트 필요 (나중에 업데이트 단계에서 처리)
  const needsMatchNoUpdate = crawledMatch.matchNumber && !matchedMatch.match_no;

  return {
    crawledMatch: {
      ...crawledMatch,
      homeScore,
      awayScore,
    },
    matchedMatchId: matchedMatch.id,
    matchStatus: 'matched',
    needsMatchNoUpdate, // 경기번호 업데이트 필요 플래그
  };
}

/**
 * 팀명을 매칭합니다 (정확 일치 → 부분 일치 → 별칭 매핑).
 * 매칭 실패 시 null을 반환하지만, 팀 정보는 이미 업데이트되었으므로 실패하지 않습니다.
 */
function matchTeamName(
  crawledTeamName: string,
  dbTeams: Team[],
  ageGroup: 'U11' | 'U12'
): Team | null {
  // 1. 정확 일치
  let matched = dbTeams.find(
    (team) => team.name === crawledTeamName && team.age_group === ageGroup
  );
  if (matched) return matched;

  // 2. 부분 일치 (포함 관계)
  matched = dbTeams.find(
    (team) =>
      team.age_group === ageGroup &&
      (team.name.includes(crawledTeamName) || crawledTeamName.includes(team.name))
  );
  if (matched) return matched;

  // 3. 별칭 매핑 (일반적인 패턴)
  const normalizedCrawled = normalizeTeamName(crawledTeamName);
  matched = dbTeams.find((team) => {
    if (team.age_group !== ageGroup) return false;
    const normalizedDb = normalizeTeamName(team.name);
    return normalizedCrawled === normalizedDb;
  });
  if (matched) return matched;

  // 4. 매칭 실패 - 하지만 팀 정보는 이미 업데이트되었으므로, 
  // 최신 팀 목록을 다시 조회하여 재시도 (동일 요청 내에서)
  // 이 경우는 matchCrawledResults에서 처리
  return null;
}

/**
 * 팀명을 정규화합니다 (공백 제거, 특수문자 제거 등).
 */
function normalizeTeamName(name: string): string {
  return name
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
    .replace(/등학교/g, '')
    .replace(/초등학교/g, '초')
    .toLowerCase();
}

/**
 * 시간 문자열을 분 단위로 변환합니다.
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
