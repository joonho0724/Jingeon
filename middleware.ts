import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Supabase Auth 세션 쿠키 동기화(서버 컴포넌트/라우트 핸들러에서 세션 인식)
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수 미설정 시에는 미들웨어에서 아무 것도 하지 않음(개발 중 UI 확인용)
  if (!url || !key) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // request 쪽 쿠키도 업데이트(후속 getAll에 반영)
          request.cookies.set(name, value);
          // response 쿠키로 브라우저에 전달
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 중요: getUser() 호출로 세션 갱신 및 쿠키 재발급 트리거
  // 에러가 발생해도 계속 진행 (쿠키가 없거나 유효하지 않을 수 있음)
  try {
    const { error: userError } = await supabase.auth.getUser();
    
    // 심각한 에러만 로그 출력
    if (userError && userError.status !== 401 && userError.status !== 400) {
      console.error('[middleware.ts] getUser error:', userError.message, userError.status);
    }
  } catch (error) {
    // 미들웨어에서는 에러를 무시하고 계속 진행
    // (쿠키가 없거나 유효하지 않은 경우 정상)
    // 로그 제거
  }

  return response;
}

export const config = {
  matcher: [
    // 정적 파일은 제외
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

