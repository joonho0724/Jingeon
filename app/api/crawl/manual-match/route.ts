import { NextRequest, NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/auth';
import { getMatches } from '@/lib/supabase/queries';
import { updateMatchResult } from '@/lib/supabase/queries';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/crawl/manual-match
 * 매칭 실패한 경기를 수동으로 매칭하여 업데이트합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { matchId, crawledMatch } = body;

    if (!matchId || !crawledMatch) {
      return NextResponse.json(
        { error: 'matchId와 crawledMatch가 필요합니다.' },
        { status: 400 }
      );
    }

    // DB에서 경기 확인
    const dbMatches = await getMatches();
    const dbMatch = dbMatches.find(m => m.id === matchId);

    if (!dbMatch) {
      return NextResponse.json(
        { error: '경기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 홈/원정 팀 확인 및 점수 조정
    let homeScore = crawledMatch.homeScore;
    let awayScore = crawledMatch.awayScore;

    // DB의 홈팀이 크롤링한 원정팀과 일치하면 점수 교환
    const dbHomeTeamName = dbMatch.home_team?.name || '';
    const dbAwayTeamName = dbMatch.away_team?.name || '';

    // 팀명 매칭 확인 (정확 일치 또는 부분 일치)
    const isHomeTeamMatched = 
      dbHomeTeamName === crawledMatch.homeTeam ||
      dbHomeTeamName.includes(crawledMatch.homeTeam) ||
      crawledMatch.homeTeam.includes(dbHomeTeamName);
    
    const isAwayTeamMatched = 
      dbAwayTeamName === crawledMatch.awayTeam ||
      dbAwayTeamName.includes(crawledMatch.awayTeam) ||
      crawledMatch.awayTeam.includes(dbAwayTeamName);

    // 홈팀이 반대인 경우 점수 교환
    if (!isHomeTeamMatched && isAwayTeamMatched) {
      // DB의 홈팀이 크롤링한 원정팀과 일치
      [homeScore, awayScore] = [awayScore, homeScore];
      console.log(`[수동 매칭] 점수 교환: ${crawledMatch.homeScore}:${crawledMatch.awayScore} → ${homeScore}:${awayScore}`);
    } else if (isHomeTeamMatched && !isAwayTeamMatched) {
      // DB의 원정팀이 크롤링한 홈팀과 일치
      [homeScore, awayScore] = [awayScore, homeScore];
      console.log(`[수동 매칭] 점수 교환: ${crawledMatch.homeScore}:${crawledMatch.awayScore} → ${homeScore}:${awayScore}`);
    }

    // 경기 결과 업데이트
    const updateData: {
      home_score: number;
      away_score: number;
      status: '종료';
      match_no?: number;
    } = {
      home_score: homeScore,
      away_score: awayScore,
      status: '종료',
    };

    // 경기번호가 있으면 업데이트
    if (crawledMatch.matchNumber) {
      updateData.match_no = crawledMatch.matchNumber;
    }

    const updated = await updateMatchResult(matchId, updateData);

    if (!updated) {
      return NextResponse.json(
        { error: '경기 결과 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 페이지 캐시 무효화
    revalidatePath('/dashboard');
    revalidatePath('/matches');
    revalidatePath('/standings');

    console.log(`[수동 매칭] 경기 업데이트 성공: ${matchId}, ${dbHomeTeamName} vs ${dbAwayTeamName}, 점수: ${homeScore}:${awayScore}`);

    return NextResponse.json({
      success: true,
      message: '경기 결과가 업데이트되었습니다.',
      match: updated,
    });
  } catch (error: any) {
    console.error('[API] 수동 매칭 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '수동 매칭 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
