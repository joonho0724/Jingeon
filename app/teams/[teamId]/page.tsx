import { getTeams, getTeamMatches } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import MatchCard from '@/components/Dashboard/MatchCard';
import { formatDate } from '@/lib/utils';

export default async function TeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  const teams = await getTeams();
  const team = teams.find(t => t.id === params.teamId);

  if (!team) {
    notFound();
  }

  const matches = await getTeamMatches(params.teamId);
  
  // 경기 통계 계산
  const stats = {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };

  matches
    .filter(m => m.status === '종료' && m.home_score !== null && m.away_score !== null)
    .forEach((match) => {
      const isHome = match.home_team_id === team.id;
      const teamScore = isHome ? match.home_score! : match.away_score!;
      const opponentScore = isHome ? match.away_score! : match.home_score!;

      stats.played++;
      stats.goalsFor += teamScore;
      stats.goalsAgainst += opponentScore;

      if (teamScore > opponentScore) {
        stats.won++;
        stats.points += 3;
      } else if (teamScore < opponentScore) {
        stats.lost++;
      } else {
        stats.drawn++;
        stats.points += 1;
      }
    });

  // 예정된 경기 또는 진행중인 경기만 표시 (모두 표시)
  const upcomingMatches = matches
    .filter(m => m.status === '예정' || m.status === '진행중')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  const finishedMatches = matches.filter(m => m.status === '종료');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{team.name}</h1>
        <p className="text-gray-600">
          {team.age_group} - {team.group_name1}조
        </p>
      </div>

      {/* 통계 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">팀 통계</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">경기수</div>
            <div className="text-2xl font-bold text-gray-900">{stats.played}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">승점</div>
            <div className="text-2xl font-bold text-green-600">{stats.points}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">승/무/패</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.won}승 {stats.drawn}무 {stats.lost}패
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">득점/실점</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.goalsFor} / {stats.goalsAgainst}
            </div>
          </div>
        </div>
      </section>

      {/* 예정된 경기 */}
      {upcomingMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">예정된 경기</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* 종료된 경기 */}
      {finishedMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">종료된 경기</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finishedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
