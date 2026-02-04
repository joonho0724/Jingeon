'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

interface MobileNavProps {
  admin: boolean;
  session: boolean;
}

export default function MobileNav({ admin, session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        aria-label="메뉴 열기"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <nav className="flex flex-col py-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                대시보드
              </Link>
              <Link
                href="/matches"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                경기 일정
              </Link>
              <Link
                href="/standings"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                순위표
              </Link>
              <Link
                href="/rules"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                대회규정
              </Link>
              <Link
                href="/venues"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                경기장 정보
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  관리자
                </Link>
              )}
              <div className="border-t border-gray-200 mt-2 pt-2">
                {session ? (
                  <div className="px-4">
                    <LogoutButton />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    로그인
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
