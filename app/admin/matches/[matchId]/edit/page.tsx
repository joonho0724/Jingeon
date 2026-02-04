import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MatchResultForm from '@/components/Match/MatchResultForm';
import FairPlayForm from '@/components/Match/FairPlayForm';
import { getMatches } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EditMatchPage({
  params,
}: {
  params: { matchId: string };
}) {
  const matches = await getMatches();
  const match = matches.find(m => m.id === params.matchId);

  if (!match) {
    notFound();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">경기 결과 입력</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/matches"
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
            >
              결과 목록으로
            </Link>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
            >
              관리자 홈으로
            </Link>
          </div>
        </div>
        
        <div className="space-y-6">
          <MatchResultForm match={match} />
          <FairPlayForm match={match} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
