import { NextRequest, NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/auth';
import { crawlJoinkfaResults } from '@/lib/crawl/joinkfa';
import { matchCrawledResults } from '@/lib/crawl/match';
import { updateMatchResult } from '@/lib/supabase/queries';
import { getTournamentList } from '@/lib/crawl/api';

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

    // 2. 데이터 매칭
    const matchResults = await matchCrawledResults(crawlResult.matches);

    const matchedCount = matchResults.filter(r => r.matchStatus === 'matched').length;
    const failedCount = matchResults.filter(r => r.matchStatus === 'failed').length;
    console.log(`[API] 매칭 완료: 총 ${matchResults.length}개 경기 처리 (성공: ${matchedCount}개, 실패: ${failedCount}개)`);

    // 3. DB 업데이트
    const updatedMatches: string[] = [];
    const failedMatches: Array<{
      match: any;
      reason: string;
    }> = [];

    for (const matchResult of matchResults) {
      if (matchResult.matchStatus === 'matched' && matchResult.matchedMatchId) {
        try {
          const updateData: {
            home_score: number;
            away_score: number;
            status: '종료';
            match_no?: number;
          } = {
            home_score: matchResult.crawledMatch.homeScore,
            away_score: matchResult.crawledMatch.awayScore,
            status: '종료',
          };
          
          // 경기번호가 있으면 항상 업데이트 (DB에 없거나 다른 경우 대비)
          if (matchResult.crawledMatch.matchNumber) {
            updateData.match_no = matchResult.crawledMatch.matchNumber;
            if (matchResult.needsMatchNoUpdate) {
              console.log(`[API] 경기번호 업데이트: ${matchResult.matchedMatchId}에 경기번호 ${matchResult.crawledMatch.matchNumber} 저장`);
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

    console.log(`[API] 업데이트 완료: ${updatedMatches.length}개 성공, ${failedMatches.length}개 실패`);

    return NextResponse.json({
      success: true,
      totalMatches: crawlResult.matches.length,
      updatedMatches: updatedMatches.length,
      failedMatches: failedMatches.length,
      failedMatchesList: failedMatches,
      errors: crawlResult.errors,
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
