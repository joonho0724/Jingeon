import { NextRequest, NextResponse } from 'next/server';
import { getUser, isAdmin } from '@/lib/auth';
import { analyzeJoinkfaPage } from '@/lib/crawl/analyze';

/**
 * GET /api/crawl/analyze
 * joinkfa.com 페이지 구조를 분석합니다.
 */
export async function GET(request: NextRequest) {
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

    console.log('[API] 페이지 구조 분석 시작...');

    const analysis = await analyzeJoinkfaPage();

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('[API] 분석 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '분석 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
