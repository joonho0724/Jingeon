import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/supabase/queries';

/**
 * GET /api/matches
 * 모든 경기 목록을 반환합니다.
 */
export async function GET() {
  try {
    const matches = await getMatches();
    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error: any) {
    console.error('[API] 경기 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '경기 목록 조회 중 오류가 발생했습니다.',
        matches: [],
      },
      { status: 500 }
    );
  }
}
