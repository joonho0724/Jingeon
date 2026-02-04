import { createClient } from './supabase/server';
import { cookies } from 'next/headers';

export async function getSession() {
  const supabase = await createClient();
  
  // 먼저 getSession()을 시도하여 쿠키에서 세션 읽기
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  
  // 디버깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    if (sessionError) {
      console.error('[lib/auth.ts] getSession error:', sessionError.message, sessionError.status);
    }
    if (session) {
      console.log('[lib/auth.ts] getSession: Session found, user:', session.user?.email);
      return session;
    } else {
      console.log('[lib/auth.ts] getSession: No session found, trying to parse cookie directly...');
    }
  } else {
    if (session) {
      return session;
    }
  }
  
  // getSession()이 실패하면 쿠키를 직접 파싱하여 세션 재구성 시도
  // 이는 Supabase 클라이언트가 쿠키를 읽지 못하는 경우를 위한 대안입니다.
  if (process.env.NODE_ENV === 'development') {
    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      const authCookie = allCookies.find(c => 
        c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
      );
      
      if (authCookie && authCookie.value) {
        const parsed = JSON.parse(decodeURIComponent(authCookie.value));
        if (parsed.access_token && parsed.user) {
          console.log('[lib/auth.ts] Cookie parsed directly, user found:', parsed.user.email);
          // 쿠키에서 직접 파싱한 정보가 있지만, Supabase 세션 객체를 재구성할 수는 없습니다.
          // 대신 getUser()를 시도합니다.
        }
      }
    } catch (e) {
      console.log('[lib/auth.ts] Direct cookie parse failed:', e);
    }
  }
  
  // getSession()이 실패하면 getUser()를 시도하여 세션 갱신
  // Supabase SSR에서는 getUser()가 쿠키를 읽고 세션을 갱신하는 방법입니다.
  const user = await getUser();
  
  // getUser()가 성공하면 다시 getSession()을 호출하여 세션 객체 반환
  if (user) {
    const retryResult = await supabase.auth.getSession();
    
    if (process.env.NODE_ENV === 'development') {
      if (retryResult.data.session) {
        console.log('[lib/auth.ts] getSession: Session found after getUser()');
      } else {
        console.log('[lib/auth.ts] getSession: Still no session after getUser(), but user exists from cookie');
        // 세션은 없지만 user가 있으면, 쿠키에서 직접 파싱한 정보로 세션 객체를 재구성
        // 이는 임시 우회 방법입니다.
      }
    }
    
    // 세션이 있으면 반환, 없어도 user가 있으면 최소한의 세션 객체 반환
    if (retryResult.data.session) {
      return retryResult.data.session;
    }
    
    // 세션이 없어도 user가 있으면, 쿠키에서 직접 파싱한 정보로 세션 객체 재구성
    if (user) {
      try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        const authCookie = allCookies.find(c => 
          c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
        );
        
        if (authCookie && authCookie.value) {
          const parsed = JSON.parse(decodeURIComponent(authCookie.value));
          if (parsed.access_token && parsed.user) {
            // 최소한의 세션 객체 재구성
            return {
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token,
              expires_in: parsed.expires_in,
              expires_at: parsed.expires_at,
              token_type: parsed.token_type || 'bearer',
              user: user,
            } as any;
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[lib/auth.ts] getSession: Failed to reconstruct session from cookie:', e);
        }
      }
    }
  }
  
  return null;
}

export async function getUser() {
  const supabase = await createClient();
  
  // 먼저 Supabase의 getUser() 시도
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  // getUser()가 성공하면 반환
  if (user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[lib/auth.ts] getUser: User found via Supabase:', user.email);
    }
    return user;
  }
  
  // getUser()가 실패하면 쿠키에서 직접 user 정보 추출 시도 (임시 우회)
  // 이는 Supabase 클라이언트가 쿠키를 읽지 못하는 경우를 위한 대안입니다.
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find(c => 
      c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    
    if (authCookie && authCookie.value) {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value));
      if (parsed.user && parsed.access_token) {
        // 쿠키에서 직접 파싱한 user 객체를 Supabase User 형식으로 변환
        const cookieUser = parsed.user;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[lib/auth.ts] getUser: Supabase getUser() failed, using cookie user:', cookieUser.email);
        }
        
        // Supabase User 형식으로 변환하여 반환
        return {
          id: cookieUser.id,
          email: cookieUser.email,
          user_metadata: cookieUser.user_metadata || {},
          app_metadata: cookieUser.app_metadata || {},
          aud: cookieUser.aud || 'authenticated',
          created_at: cookieUser.created_at || new Date().toISOString(),
        } as any;
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[lib/auth.ts] getUser: Cookie parse failed:', e);
    }
  }
  
  // 에러가 있으면 로깅 (개발 환경에서만)
  if (error && process.env.NODE_ENV === 'development') {
    console.error('[lib/auth.ts] getUser error:', error.message, error.status);
  }
  
  return null;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  
  // Supabase의 user metadata에서 is_admin 확인
  // - Dashboard/SQL에서 "true" 문자열로 저장되는 경우가 있어 boolean/문자열 둘 다 허용
  const raw = (user.user_metadata as any)?.is_admin;
  return raw === true || raw === 'true';
}
