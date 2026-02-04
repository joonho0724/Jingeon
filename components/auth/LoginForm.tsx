'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 컴포넌트 마운트 시 URL 파라미터 제거 (보안)
  useEffect(() => {
    // URL에 email이나 password 파라미터가 있으면 즉시 제거 (보안)
    const urlParams = new URLSearchParams(window.location.search);
    const hasEmail = urlParams.has('email');
    const hasPassword = urlParams.has('password');
    
    if (hasEmail || hasPassword) {
      console.warn('[LoginForm] ⚠️ 보안 경고: URL에 로그인 정보가 포함되어 있습니다. 즉시 제거합니다.');
      
      // 이메일만 안전하게 읽기 (비밀번호는 절대 읽지 않음)
      const emailParam = urlParams.get('email');
      if (emailParam && !hasPassword) {
        // 비밀번호가 없을 때만 이메일 설정
        setEmail(emailParam);
      }
      
      // URL에서 모든 파라미터 제거 (히스토리 교체)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // router를 사용하여 URL 업데이트 (Next.js 라우터 동기화)
      router.replace('/login', { scroll: false });
      
      if (hasPassword) {
        setError('⚠️ 보안 경고: URL에 비밀번호가 포함되어 있었습니다. 비밀번호는 절대 URL에 입력하지 마세요.');
      } else if (hasEmail) {
        setError('⚠️ 보안 경고: URL에 이메일이 포함되어 있었습니다. 로그인 폼을 사용하세요.');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginForm] handleLogin 함수 실행됨!', { email, hasPassword: !!password });
    
    setLoading(true);
    setError(null);
    setDebug(null);

    try {
      // Supabase 클라이언트 초기화 확인
      if (!supabase || !supabase.auth) {
        console.error('[LoginForm] Supabase 클라이언트 초기화 오류');
        const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        setError(`Supabase 클라이언트 초기화 오류입니다. 환경 변수를 확인해주세요.\nURL: ${envUrl ? '설정됨' : '없음'}\nKey: ${envKey ? '설정됨' : '없음'}`);
        setLoading(false);
        return;
      }

      // 환경 변수 확인 (디버깅용)
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log('[LoginForm] 환경 변수 확인:', {
        hasUrl: !!envUrl,
        hasKey: !!envKey,
        urlLength: envUrl?.length || 0,
        keyLength: envKey?.length || 0,
      });

      console.log('[LoginForm] 로그인 시도:', { email, passwordLength: password.length });
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[LoginForm] 로그인 오류 상세:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
          error: signInError
        });
        setError(`로그인 실패: ${signInError.message || '알 수 없는 오류'} (상태: ${signInError.status || 'N/A'})`);
        setLoading(false);
        return;
      }

      console.log('[LoginForm] 로그인 성공:', { userId: data.user?.id, email: data.user?.email });

      // 일부 환경에서 signIn 결과의 data.user가 비어있는 케이스가 있어
      // 세션/유저를 한 번 더 조회해서 확실하게 처리합니다.
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.error('getUser error:', userErr);
      }

      const user = data.user ?? userData.user;

      if (!user) {
        // 세션은 생겼는데 유저를 못 읽는 경우: 쿠키/스토리지 문제 가능성이 큼
        const { data: sessionData } = await supabase.auth.getSession();
        console.warn('로그인 후 user 없음. session 존재 여부:', !!sessionData.session);
        setError('로그인 세션을 확인하지 못했습니다. Ctrl+F5 후 다시 로그인해 주세요.');
        return;
      }

      // 관리자 여부 확인
      const raw = (user.user_metadata as any)?.is_admin;
      const isAdmin = raw === true || raw === 'true';
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('관리자 권한이 없습니다.');
        setLoading(false);
        return;
      }

      // 로그인 성공 (민감한 정보는 표시하지 않음)
      setDebug(`로그인 성공: ${user.email ?? '(no email)'}`);
      console.log('[LoginForm] ====== 로그인 성공 ======');
      console.log('[LoginForm] 사용자 정보:', { 
        userId: user.id, 
        email: user.email,
        isAdmin: raw === true || raw === 'true'
      });

      // 세션이 제대로 설정되었는지 확인
      const { data: sessionCheck } = await supabase.auth.getSession();
      console.log('[LoginForm] 로그인 후 세션 확인:', {
        hasSession: !!sessionCheck.session,
        userId: sessionCheck.session?.user?.id,
        email: sessionCheck.session?.user?.email
      });

      // 쿠키가 제대로 설정되었는지 확인
      const cookies = document.cookie.split(';').filter(c => c.trim().startsWith('sb-'));
      console.log('[LoginForm] 로그인 후 쿠키 확인:', cookies.map(c => c.split('=')[0].trim()));
      console.log('[LoginForm] 쿠키 개수:', cookies.length);

      console.log('[LoginForm] ====== 대시보드로 이동합니다 ======');
      
      // 로딩 상태는 유지 (리다이렉트 중임을 표시)
      // 세션 쿠키가 설정되도록 짧은 지연 후 리다이렉트
      // Supabase SSR이 쿠키를 설정하는데 시간이 필요할 수 있음
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 하드 리다이렉트로 세션 쿠키가 서버에서 인식되도록 함
      // replace를 사용하여 뒤로가기 시 로그인 페이지로 돌아가지 않도록 함
      console.log('[LoginForm] 리다이렉트 실행: /dashboard');
      window.location.replace('/dashboard');
      
      // 리다이렉트가 실행되지 않는 경우를 대비한 폴백
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.warn('[LoginForm] 리다이렉트가 실행되지 않았습니다. 강제 리다이렉트 시도...');
          window.location.href = '/dashboard';
        }
      }, 1000);
    } catch (err) {
      console.error('[LoginForm] 로그인 예외:', err);
      let errorMessage = '알 수 없는 오류';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // "Failed to fetch" 오류인 경우 더 자세한 정보 제공
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = '네트워크 오류: Supabase 서버에 연결할 수 없습니다. 인터넷 연결과 환경 변수를 확인해주세요.';
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(`로그인 중 오류가 발생했습니다: ${errorMessage}`);
      setDebug(`오류 상세: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            대회 관리 시스템
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {debug && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
              {debug}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
          
          <div className="text-xs text-red-600 text-center mt-4 bg-red-50 border border-red-200 rounded p-2">
            ⚠️ 보안 경고: 비밀번호는 절대 URL에 입력하지 마세요. 항상 로그인 폼을 사용하세요.
          </div>
        </form>
      </div>
    </div>
  );
}
