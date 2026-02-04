/**
 * joinkfa.com API 직접 호출
 */

import { CrawledMatch } from './joinkfa';

export interface TournamentInfo {
  idx: string;
  title: string;
  ageGroup: 'U11' | 'U12' | 'unknown';
  startDate: string;
  endDate: string;
}

export interface MatchListResponse {
  totalCount: string;
  matchList: Array<{
    NO: string;
    IDX: string;
    TITLE: string;
    MGC_NM: string;
    STYLE_NM: string;
    MA_MCH_STAT_YMD: string;
    MA_MCH_END_YMD: string;
    PLAYING_AREA: string;
    [key: string]: any;
  }>;
}

/**
 * 대회 목록 조회
 * 실제 Payload 형식:
 * {
 *   "v_CURPAGENUM": "1",
 *   "v_ROWCOUNTPERPAGE": "20",
 *   "v_ORDERBY": "",
 *   "v_YEAR": "2026",
 *   "v_STYLE": "MATCH",
 *   "v_MGC_IDX": "51",
 *   "v_AREACODE": "CJ",
 *   "v_SIGUNGU_CODE": "",
 *   "v_ITEM_CD": "S",
 *   "v_TITLE": "",
 *   "v_TEAMID": "",
 *   "v_USER_ID": ""
 * }
 */
export async function getTournamentList(payload: any): Promise<TournamentInfo[]> {
  try {
    const response = await fetch('https://www.joinkfa.com/portal/mat/getMatchList.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Origin': 'https://www.joinkfa.com',
        'Referer': 'https://www.joinkfa.com/service/portal/matchPortal.jsp?mgctype=S',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MatchListResponse = await response.json();
    
    const tournaments: TournamentInfo[] = [];
    
    if (data.matchList) {
      for (const match of data.matchList) {
        let ageGroup: 'U11' | 'U12' | 'unknown' = 'unknown';
        if (match.TITLE?.includes('U11') || match.TITLE?.includes('u11')) {
          ageGroup = 'U11';
        } else if (match.TITLE?.includes('U12') || match.TITLE?.includes('u12')) {
          ageGroup = 'U12';
        }

        tournaments.push({
          idx: match.IDX,
          title: match.TITLE || '',
          ageGroup,
          startDate: match.MA_MCH_STAT_YMD || '',
          endDate: match.MA_MCH_END_YMD || '',
        });
      }
    }

    return tournaments;
  } catch (error: any) {
    console.error('[API] 대회 목록 조회 실패:', error);
    throw error;
  }
}

export interface MatchResult {
  NO: string;
  IDX: string;
  TEAM_HOME: string;
  TEAM_AWAY: string;
  TH_SCORE_FINAL: string;
  TA_SCORE_FINAL: string;
  MATCH_CHECK_TIME2: string; // 날짜 (YYYY-MM-DD)
  TIME: string; // 시간 (HH:mm)
  TITLE: string; // 대회명
  MATCH_GROUP: string; // 조
  MATCH_CLASS: string; // 경기 클래스
  MATCH_TIME: string; // 전체 날짜/시간
  MATCH_NUMBER: string; // 경기번호
  [key: string]: any;
}

export interface MatchSingleListResponse {
  singleList: MatchResult[];
}

/**
 * 경기 결과 조회
 * 대회 ID를 사용하여 경기 결과를 가져옵니다.
 * 
 * @param tournamentIdx 대회 ID (getMatchList.do 응답의 IDX 값)
 * @param payload 요청 본문 (선택사항, 없으면 기본값 사용)
 * @param yearMonth 년-월 형식 (예: "2026-01", 선택사항)
 */
export async function getMatchResults(
  tournamentIdx: string, 
  payload?: any,
  yearMonth?: string
): Promise<MatchResult[]> {
  try {
    // 기본 Payload 형식
    // 실제 Payload: {"v_CURPAGENUM":"1","v_ROWCOUNTPERPAGE":"1000","v_ORDERBY":"","v_MATCH_IDX":"...","v_YEAR_MONTH":"2026-01","v_TEAMID":"","v_USER_ID":""}
    const defaultPayload = payload || {
      v_CURPAGENUM: "1",
      v_ROWCOUNTPERPAGE: "1000",
      v_ORDERBY: "",
      v_MATCH_IDX: tournamentIdx,
      v_YEAR_MONTH: yearMonth || new Date().toISOString().slice(0, 7), // 기본값: 현재 년-월 (YYYY-MM)
      v_TEAMID: "",
      v_USER_ID: "",
    };

    console.log(`[API] getMatchSingleList.do 호출:`, defaultPayload);

    const response = await fetch('https://www.joinkfa.com/portal/mat/getMatchSingleList.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'Origin': 'https://www.joinkfa.com',
        'Referer': 'https://www.joinkfa.com/service/portal/matchPortal.jsp?mgctype=S',
      },
      body: JSON.stringify(defaultPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data: MatchSingleListResponse = await response.json();
    
    console.log(`[API] 경기 결과 수집: ${data.singleList?.length || 0}개`);
    
    return data.singleList || [];
  } catch (error: any) {
    console.error('[API] 경기 결과 조회 실패:', error);
    throw error;
  }
}

/**
 * MatchResult를 CrawledMatch로 변환
 */
export function convertMatchResultToCrawledMatch(
  match: MatchResult,
  tournamentName: string,
  ageGroup: 'U11' | 'U12'
): CrawledMatch {
  const homeScore = parseInt(match.TH_SCORE_FINAL || '0');
  const awayScore = parseInt(match.TA_SCORE_FINAL || '0');
  
  // 날짜 파싱 (MATCH_CHECK_TIME2: "2026-01-28")
  const date = match.MATCH_CHECK_TIME2 || match.MATCH_TIME?.split('-').slice(0, 3).join('-') || new Date().toISOString().split('T')[0];
  
  // 시간 파싱 (TIME: "10:00")
  const time = match.TIME || '00:00';
  
  // 조 정보 추출
  const group = match.MATCH_GROUP || undefined;
  
  // 경기번호 추출 (문자열이어도 숫자로 변환)
  let matchNumber: number | undefined = undefined;
  if (match.MATCH_NUMBER) {
    const parsed = parseInt(match.MATCH_NUMBER);
    if (!isNaN(parsed)) {
      matchNumber = parsed;
    }
  }
  
  return {
    homeTeam: match.TEAM_HOME || '',
    awayTeam: match.TEAM_AWAY || '',
    homeScore,
    awayScore,
    date,
    time,
    ageGroup,
    tournamentName: match.TITLE || tournamentName,
    group,
    matchNumber,
  };
}
