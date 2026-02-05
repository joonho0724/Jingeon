'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/auth/LogoutButton';
import MobileNav from './MobileNav';

export default function Header() {
  const supabase = useMemo(() => createClient(), []);
  const [hasSession, setHasSession] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function refreshAuthState() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!isMounted) return;

      setHasSession(!!session);

      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!isMounted) return;
      const raw = (userData.user?.user_metadata as any)?.is_admin;
      setIsAdmin(raw === true || raw === 'true');
    }

    // 초기 1회
    refreshAuthState();

    // 로그인/로그아웃 즉시 반영
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshAuthState();
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/image/Jingeon_emblem.png"
                alt="진건초 엠블럼"
                width={40}
                height={40}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                2026 서귀포 칠십리 춘계 유소년 축구 페스티벌
              </span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
            >
              대시보드
            </Link>
            <Link
              href="/matches"
              className="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
            >
              경기일정
            </Link>
            <Link
              href="/standings"
              className="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
            >
              대회결과
            </Link>
            <Link
              href="/rules"
              className="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
            >
              대회규정
            </Link>
            <Link
              href="/venues"
              className="text-gray-700 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
            >
              경기장 정보
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-700 px-2 lg:px-3 py-2 rounded-md text-sm font-medium"
              >
                관리자
              </Link>
            )}

            {hasSession ? (
              <LogoutButton />
            ) : (
              <Link
                href="/login"
                className="px-3 lg:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
          </nav>

          {/* 모바일 네비게이션 */}
          <div className="md:hidden">
            <MobileNav admin={isAdmin} session={hasSession} />
          </div>
        </div>
      </div>
    </header>
  );
}
