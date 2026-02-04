import { MatchWithTeams } from '@/types/database';
import { formatDate, formatTime, getStatusColor, getPitchName } from '@/lib/utils';
import Link from 'next/link';
import YouTubeEmbed from '@/components/Match/YouTubeEmbed';

interface MatchCardProps {
  match: MatchWithTeams;
}

export default function MatchCard({ match }: MatchCardProps) {
  const statusColor = getStatusColor(match.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
          {match.status}
        </span>
        <span className="text-sm text-gray-500">
          {formatDate(match.date)} {match.time && formatTime(match.time)}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-500 mb-1">
          {match.round} 리그 - {match.group_name}조
          {match.pitch_code && <span className="ml-2">({getPitchName(match.pitch_code)})</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {match.home_team?.name || '팀 정보 없음'}
            </div>
            {match.status === '종료' && match.home_score !== null && (
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {match.home_score}
              </div>
            )}
          </div>
          <div className="mx-4 text-gray-400">VS</div>
          <div className="flex-1 text-right">
            <div className="font-medium text-gray-900">
              {match.away_team?.name || '팀 정보 없음'}
            </div>
            {match.status === '종료' && match.away_score !== null && (
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {match.away_score}
              </div>
            )}
          </div>
        </div>
      </div>

      {match.status === '종료' && match.youtube_link && (
        <div className="mt-4">
          <YouTubeEmbed url={match.youtube_link} />
        </div>
      )}

      <Link
        href={`/matches/${match.id}`}
        className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
      >
        상세 보기 →
      </Link>
    </div>
  );
}
