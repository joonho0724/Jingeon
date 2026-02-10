import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getUser, isAdmin } from '@/lib/auth';
import { crawlJoinkfaResults } from '@/lib/crawl/joinkfa';
import { matchCrawledResults } from '@/lib/crawl/match';
import { updateMatchResult } from '@/lib/supabase/queries';
import { getTournamentList } from '@/lib/crawl/api';
import { updateTeamsFromCrawledMatches } from '@/lib/crawl/teams';
import { updateMatchNumbersFromCrawledMatches } from '@/lib/crawl/match-numbers';

/**
 * 고정 대회 ID (2026 서귀포 칠십리 춘계 유소년 축구 페스티벌)
 */
const FIXED_TOURNAMENT_IDS = [
  'FD97448A46EF60040FC2E775B7A0DDAA', // U11
  '78D62A19F1433619C7BE7A52677F2151', // U12
];

/**
 * POST /api/crawl/results
 * joinkfa.com에서 경기 결과를 크롤링하여 DB에 업데이트합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    console.log('[API] 경기 결과 크롤링 시작...');

    // 요청 본문에서 옵션 확인 (선택사항)
    let options: { 
      headless?: boolean; 
      debug?: boolean;
      tournamentIds?: string[];
      directUrls?: string[];
    } = { headless: true };
    
    try {
      const body = await request.json().catch(() => null);
      if (body && typeof body === 'object') {
        options = {
          headless: body.headless !== false,
          debug: body.debug === true,
          directUrls: body.directUrls || undefined,
        };
      }
    } catch (e) {
      // 본문 파싱 실패 시 기본값 사용
    }

    // 고정 대회 ID 사용
    options.tournamentIds = FIXED_TOURNAMENT_IDS;
    console.log(`[API] 고정 대회 ID 사용: ${FIXED_TOURNAMENT_IDS.join(', ')}`);

    // 1. 크롤링 실행
    const crawlResult = await crawlJoinkfaResults(options);

    if (!crawlResult.success && crawlResult.matches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '크롤링 실패',
          errors: crawlResult.errors,
          totalMatches: 0,
          updatedMatches: 0,
          failedMatches: [],
        },
        { status: 500 }
      );
    }

    console.log(`[API] 크롤링 완료: ${crawlResult.matches.length}개 경기 수집`);
    
    if (crawlResult.matches.length === 0) {
      console.log(`[API] 경고: 크롤링된 경기 결과가 없습니다.`);
    } else {
      // 경기번호 통계
      const withMatchNumber = crawlResult.matches.filter(m => m.matchNumber !== undefined).length;
      console.log(`[API] 크롤링 완료: 총 ${crawlResult.matches.length}개 (경기번호 있음: ${withMatchNumber}개, 경기번호 없음: ${crawlResult.matches.length - withMatchNumber}개)`);
      
      console.log(`[API] 크롤링된 경기 샘플:`, crawlResult.matches.slice(0, 5).map(m => ({
        경기번호: m.matchNumber || 'N/A',
        연령대: m.ageGroup,
        날짜: m.date,
        시간: m.time,
        홈팀: m.homeTeam,
        원정팀: m.awayTeam,
        점수: `${m.homeScore} : ${m.awayScore}`
      })));
    }

    // 1.5. 팀 정보 업데이트 (크롤링 결과에서 팀 정보 추출하여 teams 테이블 업데이트)
    console.log('[API] 팀 정보 업데이트 시작...');
    const teamUpdateResult = await updateTeamsFromCrawledMatches(crawlResult.matches);
    console.log(`[API] 팀 정보 업데이트 완료: ${teamUpdateResult.updated}개 업데이트, ${teamUpdateResult.created}개 생성, ${teamUpdateResult.errors.length}개 오류`);
    if (teamUpdateResult.errors.length > 0) {
      console.log(`[API] 팀 업데이트 오류:`, teamUpdateResult.errors);
    }

    // 1.6. 경기번호 업데이트 (match_no가 null인 경기들에 경기번호 업데이트)
    console.log('[API] 경기번호 업데이트 시작 (match_no가 null인 경기)...');
    const matchNumberUpdateResult = await updateMatchNumbersFromCrawledMatches(crawlResult.matches);
    console.log(`[API] 경기번호 업데이트 완료: ${matchNumberUpdateResult.updated}개 업데이트, ${matchNumberUpdateResult.failed}개 실패`);
    if (matchNumberUpdateResult.errors.length > 0) {
      console.log(`[API] 경기번호 업데이트 오류:`, matchNumberUpdateResult.errors);
    }

    // 2. 데이터 매칭
    const matchResults = await matchCrawledResults(crawlResult.matches);

    const matchedCount = matchResults.filter(r => r.matchStatus === 'matched').length;
    const failedCount = matchResults.filter(r => r.matchStatus === 'failed').length;
    console.log(`[API] 매칭 완료: 총 ${matchResults.length}개 경기 처리 (성공: ${matchedCount}개, 실패: ${failedCount}개)`);

    // 3. DB 업데이트
    const updatedMatches: string[] = [];
    const skippedMatches: string[] = []; // 이미 점수가 있는 경기 (스킵)
    const failedMatches: Array<{
      match: any;
      reason: string;
    }> = [];

    // 기존 경기 데이터 조회 (점수 확인용)
    const { getMatches } = await import('@/lib/supabase/queries');
    const existingMatches = await getMatches();
    const existingMatchesMap = new Map(existingMatches.map(m => [m.id, m]));

    for (const matchResult of matchResults) {
      if (matchResult.matchStatus === 'matched' && matchResult.matchedMatchId) {
        try {
          const existingMatch = existingMatchesMap.get(matchResult.matchedMatchId);
          
          // 이미 점수가 있고 상태가 '종료'인 경우 스킵 (선택적)
          // 주석 처리: 항상 업데이트하도록 변경
          // if (existingMatch?.home_score !== null && existingMatch?.away_score !== null && existingMatch?.status === '종료') {
          //   skippedMatches.push(matchResult.matchedMatchId);
          //   console.log(`[API] 경기 스킵 (이미 결과 있음): ${matchResult.crawledMatch.homeTeam} vs ${matchResult.crawledMatch.awayTeam}`);
          //   continue;
          // }

          const updateData: {
            home_score: number;
            away_score: number;
            status: '종료';
            match_no?: number;
            date?: string;
            time?: string;
          } = {
            home_score: matchResult.crawledMatch.homeScore,
            away_score: matchResult.crawledMatch.awayScore,
            status: '종료',
          };
          
          // 경기번호가 있으면 항상 업데이트 (DB에 null이거나 다른 경우 대비)
          if (matchResult.crawledMatch.matchNumber) {
            const currentMatchNo = existingMatch?.match_no;
            updateData.match_no = matchResult.crawledMatch.matchNumber;
            
            // 경기번호 업데이트 로그 (null이거나 다른 경우)
            if (currentMatchNo === null || currentMatchNo === undefined) {
              console.log(`[API] 경기번호 업데이트 (null → ${matchResult.crawledMatch.matchNumber}): ${matchResult.matchedMatchId}, ${matchResult.crawledMatch.homeTeam} vs ${matchResult.crawledMatch.awayTeam}`);
            } else if (currentMatchNo !== matchResult.crawledMatch.matchNumber) {
              console.log(`[API] 경기번호 업데이트 (${currentMatchNo} → ${matchResult.crawledMatch.matchNumber}): ${matchResult.matchedMatchId}, ${matchResult.crawledMatch.homeTeam} vs ${matchResult.crawledMatch.awayTeam}`);
            }
          }

          // 크롤링한 날짜와 시간으로 업데이트 (크롤링 정보가 가장 정확함)
          if (matchResult.crawledMatch.date) {
            updateData.date = matchResult.crawledMatch.date;
            if (existingMatch?.date !== matchResult.crawledMatch.date) {
              console.log(`[API] 날짜 업데이트 (${existingMatch?.date || 'N/A'} → ${matchResult.crawledMatch.date}): ${matchResult.matchedMatchId}`);
            }
          }
          if (matchResult.crawledMatch.time) {
            updateData.time = matchResult.crawledMatch.time;
            if (existingMatch?.time !== matchResult.crawledMatch.time) {
              console.log(`[API] 시간 업데이트 (${existingMatch?.time || 'N/A'} → ${matchResult.crawledMatch.time}): ${matchResult.matchedMatchId}`);
            }
          }

          // 업데이트 전 로그
          if (existingMatch) {
            const scoreChanged = existingMatch.home_score !== updateData.home_score || 
                                 existingMatch.away_score !== updateData.away_score;
            if (scoreChanged) {
              console.log(`[API] 점수 변경: ${existingMatch.home_score || 'N/A'}:${existingMatch.away_score || 'N/A'} → ${updateData.home_score}:${updateData.away_score}`);
            }
          }

          const updated = await updateMatchResult(matchResult.matchedMatchId, updateData);

          if (updated) {
            updatedMatches.push(matchResult.matchedMatchId);
            console.log(
              `[API] 경기 업데이트 성공: ${matchResult.crawledMatch.homeTeam} vs ${matchResult.crawledMatch.awayTeam} (경기번호: ${matchResult.crawledMatch.matchNumber || 'N/A'})`
            );
          } else {
            failedMatches.push({
              match: matchResult.crawledMatch,
              reason: 'DB 업데이트 실패',
            });
          }
        } catch (error: any) {
          console.error(`[API] 경기 업데이트 오류:`, error);
          failedMatches.push({
            match: matchResult.crawledMatch,
            reason: `업데이트 오류: ${error.message}`,
          });
        }
      } else {
        failedMatches.push({
          match: matchResult.crawledMatch,
          reason: matchResult.reason || '매칭 실패',
        });
      }
    }

    console.log(`[API] 업데이트 완료: ${updatedMatches.length}개 성공, ${skippedMatches.length}개 스킵, ${failedMatches.length}개 실패`);

    // 크롤링 완료 후 관련 페이지 캐시 무효화 (즉시 업데이트 반영)
    if (updatedMatches.length > 0) {
      revalidatePath('/dashboard');
      revalidatePath('/matches');
      revalidatePath('/standings');
      console.log('[API] 페이지 캐시 무효화 완료: /dashboard, /matches, /standings');
    }

    return NextResponse.json({
      success: true,
      totalMatches: crawlResult.matches.length,
      updatedMatches: updatedMatches.length,
      skippedMatches: skippedMatches.length,
      failedMatches: failedMatches.length,
      failedMatchesList: failedMatches,
      errors: crawlResult.errors,
      teamUpdate: {
        updated: teamUpdateResult.updated,
        created: teamUpdateResult.created,
        errors: teamUpdateResult.errors,
      },
      matchNumberUpdate: {
        updated: matchNumberUpdateResult.updated,
        failed: matchNumberUpdateResult.failed,
        errors: matchNumberUpdateResult.errors,
      },
      summary: {
        crawled: crawlResult.matches.length,
        matched: matchResults.filter(r => r.matchStatus === 'matched').length,
        updated: updatedMatches.length,
        skipped: skippedMatches.length,
        failed: failedMatches.length,
        teamsUpdated: teamUpdateResult.updated,
        teamsCreated: teamUpdateResult.created,
        matchNumbersUpdated: matchNumberUpdateResult.updated,
      },
    });
  } catch (error: any) {
    console.error('[API] 크롤링 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크롤링 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
