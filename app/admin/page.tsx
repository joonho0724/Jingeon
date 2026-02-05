import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">관리자 페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/matches/new"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              경기일정 등록
            </h2>
            <p className="text-gray-600 text-sm">
              새로운 경기일정을 등록합니다.
            </p>
          </Link>

          <Link
            href="/admin/matches"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              경기 결과 입력
            </h2>
            <p className="text-gray-600 text-sm">
              경기 결과와 유튜브 링크를 입력합니다.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              대회 기본정보
            </h2>
            <p className="text-gray-600 text-sm">
              경기장(코드/이름) 및 팀 번호 정보를 설정합니다.
            </p>
          </Link>

          <Link
            href="/admin/crawl-results"
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              경기 결과 자동 수집
            </h2>
            <p className="text-gray-600 text-sm">
              joinkfa.com에서 경기 결과를 자동으로 수집하여 업데이트합니다.
            </p>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
