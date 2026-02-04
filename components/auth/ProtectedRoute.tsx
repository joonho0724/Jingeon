import { redirect } from 'next/navigation';
import { getSession, getUser, isAdmin } from '@/lib/auth';

export default async function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  console.log('[ProtectedRoute] ====== ProtectedRoute 시작 ======');
  console.log('[ProtectedRoute] requireAdmin:', requireAdmin);
  
  // 먼저 세션 확인 (쿠키에서 세션 읽기)
  const session = await getSession();
  
  console.log('[ProtectedRoute] 세션 확인 결과:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  });
  
  if (!session) {
    // 개발 환경에서만 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProtectedRoute] ====== 세션 없음, /login으로 리다이렉트 ======');
    }
    redirect('/login');
  }

  // 세션이 있으면 유저 정보 가져오기
  const user = await getUser();
  
  console.log('[ProtectedRoute] 유저 확인 결과:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email
  });
  
  if (!user) {
    // 세션은 있는데 유저 정보를 못 가져온 경우
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProtectedRoute] ====== 세션은 있지만 유저 없음, /login으로 리다이렉트 ======');
    }
    redirect('/login');
  }

  if (requireAdmin) {
    console.log('[ProtectedRoute] 관리자 권한 확인 중...');
    const admin = await isAdmin();
    console.log('[ProtectedRoute] 관리자 권한 확인 결과:', admin);
    
    if (!admin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProtectedRoute] ====== 관리자 권한 없음, /dashboard로 리다이렉트 ======');
      }
      redirect('/dashboard');
    }
    console.log('[ProtectedRoute] ====== 관리자 권한 확인 완료, 페이지 표시 ======');
  } else {
    console.log('[ProtectedRoute] ====== 일반 사용자, 페이지 표시 ======');
  }

  return <>{children}</>;
}
