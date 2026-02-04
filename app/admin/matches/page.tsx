import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getMatches } from '@/lib/supabase/queries';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';
import DeleteMatchButton from '@/components/Match/DeleteMatchButton';

export default async function AdminMatchesPage() {
  const matches = await getMatches();

  const matchesByRound = {
    '1차': matches.filter(m => m.round === '1차'),
    '2차': matches.filter(m => m.round === '2차'),
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">경기 결과 입력</h1>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
            >
              관리자 홈으로
            </Link>
          </div>
          <Link
            href="/admin/matches/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            새 경기 추가
          </Link>
        </div>

        {(['1차', '2차'] as const).map((round) => (
          <section key={round} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {round} 리그
            </h2>
            
            {matchesByRound[round].length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          날짜/시간
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          홈팀
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          점수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          원정팀
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          상태
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matchesByRound[round].map((match) => (
                        <tr key={match.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{formatDate(match.date)}</div>
                            {match.time && (
                              <div className="text-gray-500">{formatTime(match.time)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {match.home_team?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            {match.home_score !== null && match.away_score !== null ? (
                              <span className="text-lg font-bold">
                                {match.home_score} : {match.away_score}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {match.away_team?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              match.status === '예정' ? 'bg-gray-100 text-gray-600' :
                              match.status === '진행중' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {match.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="flex justify-center space-x-4">
                              <Link
                                href={`/admin/matches/${match.id}/edit`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                수정
                              </Link>
                              <DeleteMatchButton matchId={match.id} matchInfo={`${match.home_team?.name || '-'} vs ${match.away_team?.name || '-'}`} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">등록된 경기가 없습니다.</p>
            )}
          </section>
        ))}
      </div>
    </ProtectedRoute>
  );
}
