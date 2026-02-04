import { getMatches } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import { formatDate, formatTime } from '@/lib/utils';
import YouTubeEmbed from '@/components/Match/YouTubeEmbed';
import { getSession, isAdmin } from '@/lib/auth';
import Link from 'next/link';

export default async function MatchDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  const matches = await getMatches();
  const match = matches.find(m => m.id === params.matchId);

  if (!match) {
    notFound();
  }

  const session = await getSession();
  const admin = session ? await isAdmin() : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            {match.round} 리그 - {match.group_name}조
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {match.home_team?.name || '-'} vs {match.away_team?.name || '-'}
          </h1>
          <div className="text-gray-600">
            {formatDate(match.date)} {match.time && formatTime(match.time)}
          </div>
        </div>

        {match.status === '종료' && match.home_score !== null && match.away_score !== null && (
          <div className="mb-6 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {match.home_score} : {match.away_score}
            </div>
            <div className="text-sm text-gray-600">
              {match.home_score > match.away_score ? match.home_team?.name || '-' : 
               match.home_score < match.away_score ? match.away_team?.name || '-' : 
               '무승부'}
            </div>
          </div>
        )}

        {match.status === '종료' && match.youtube_link && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">경기 영상</h2>
            <YouTubeEmbed url={match.youtube_link} />
          </div>
        )}

        {admin && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href={`/admin/matches/${match.id}/edit`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              경기 결과 수정
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
