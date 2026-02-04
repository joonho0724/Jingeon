import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MatchForm from '@/components/Match/MatchForm';
import BulkUploadForm from '@/components/Match/BulkUploadForm';
import { getTeams, getVenues } from '@/lib/supabase/queries';
import Link from 'next/link';

export default async function NewMatchPage() {
  const teams = await getTeams();
  // 모든 리그의 경기장을 가져옴 (MatchForm에서 리그별로 필터링)
  const venues = await getVenues();

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">경기 일정 등록</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
          >
            관리자 홈으로
          </Link>
        </div>
        
        <div className="space-y-8">
          <BulkUploadForm teams={teams} venues={venues} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>
          <MatchForm teams={teams} venues={venues} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
