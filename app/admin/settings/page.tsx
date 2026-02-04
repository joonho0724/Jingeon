import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getTeams, getVenues, getMatches } from '@/lib/supabase/queries';
import TeamNumberManager from '@/components/Admin/TeamNumberManager';
import VenueManager from '@/components/Admin/VenueManager';
import Link from 'next/link';

export default async function AdminSettingsPage() {
  const [teams, venues, matches] = await Promise.all([getTeams(), getVenues(), getMatches()]);

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">대회 기본정보</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
          >
            관리자 홈으로
          </Link>
        </div>

        <div className="space-y-10">
          <VenueManager initialVenues={venues} />
          <TeamNumberManager initialTeams={teams} initialMatches={matches} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

