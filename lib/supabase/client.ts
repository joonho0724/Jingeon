import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('[lib/supabase/client.ts] 환경 변수가 설정되지 않았습니다.');
    // 환경 변수가 없을 때는 더미 클라이언트 반환 (UI 확인용)
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ error: null }),
        update: () => ({ error: null }),
        delete: () => ({ error: null }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: '환경 변수가 설정되지 않았습니다.' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    } as any;
  }

  // 환경 변수는 이미 확인됨 (로그 제거)

  // 브라우저 로그인 세션을 cookie 기반으로 유지(서버 컴포넌트에서 세션 인식)
  // createBrowserClient는 내부적으로 document.cookie를 사용하여 쿠키를 관리합니다.
  // 옵션을 전달하지 않으면 기본 동작을 사용하며, 쿠키는 자동으로 설정됩니다.
  try {
    return createBrowserClient(url, key);
  } catch (error) {
    console.error('[lib/supabase/client.ts] createBrowserClient 오류:', error);
    throw error;
  }
}
