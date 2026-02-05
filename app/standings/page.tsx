import { getStandings } from '@/lib/supabase/queries';
import { getTeams } from '@/lib/supabase/queries';
import { getMatches } from '@/lib/supabase/queries';
import Link from 'next/link';
import AgeGroupTabs from '@/components/Standings/AgeGroupTabs';
import type { Standing } from '@/types/database';

// 캐시 무효화 설정: 크롤링 후 즉시 업데이트 반영
export const revalidate = 0;

export default async function StandingsPage({
  searchParams,
}: {
  searchParams?: { ageGroup?: string; round?: string };
}) {
  // 기본값은 U11
  const selectedAgeGroup = (searchParams?.ageGroup === 'U12' ? 'U12' : 'U11') as 'U11' | 'U12';
  // 기본값은 1차
  const selectedRound = (searchParams?.round === '2차' ? '2차' : '1차') as '1차' | '2차';
  
  // 모든 팀 조회하여 조 목록 확인
  const teams = await getTeams();
  
  // 모든 경기 조회하여 리그별 경기 존재 여부 확인
  const allMatches = await getMatches();
  
  // 연령대별, 조별로 그룹화
  const groupsByAge: Record<string, Set<string>> = {
    'U11': new Set(),
    'U12': new Set(),
  };
  
  teams.forEach(team => {
    if (groupsByAge[team.age_group]) {
      // 1차 리그는 group_name1 사용
      if (team.group_name1) {
        groupsByAge[team.age_group].add(team.group_name1);
      }
    }
  });
  
  // 조 번호 순서대로 정렬
  const sortedGroups = {
    'U11': Array.from(groupsByAge['U11']).sort((a, b) => parseInt(a) - parseInt(b)),
    'U12': Array.from(groupsByAge['U12']).sort((a, b) => parseInt(a) - parseInt(b)),
  };
  
  // 리그별 경기 존재 여부 확인
  const hasMatches = {
    '1차': allMatches.some(m => m.round === '1차'),
    '2차': allMatches.some(m => m.round === '2차'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">대회결과</h1>

      <AgeGroupTabs currentAgeGroup={selectedAgeGroup} />

      <div className="mt-6">
        {/* 리그 탭 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="League Tabs">
            <a
              href={`/standings?ageGroup=${selectedAgeGroup}`}
              className={`${
                selectedRound === '1차'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              1차 리그
            </a>
            <a
              href={`/standings?ageGroup=${selectedAgeGroup}&round=2차`}
              className={`${
                selectedRound === '2차'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              2차 리그
            </a>
          </nav>
        </div>

        {/* 선택된 리그만 표시 */}
        {hasMatches[selectedRound] ? (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{selectedRound} 리그</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedGroups[selectedAgeGroup].map((groupName) => (
                <StandingsTable
                  key={`${selectedAgeGroup}-${selectedRound}-${groupName}`}
                  ageGroup={selectedAgeGroup}
                  round={selectedRound}
                  groupName={groupName}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            {selectedRound} 리그 데이터가 아직 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

async function StandingsTable({
  ageGroup,
  round,
  groupName,
}: {
  ageGroup: 'U11' | 'U12';
  round: '1차' | '2차';
  groupName: string;
}) {
  let standings: Standing[] = [];
  
  try {
    standings = await getStandings(round, groupName);
    // 해당 연령대의 팀만 필터링
    standings = standings.filter(s => s.age_group === ageGroup);
  } catch (error) {
    console.error(`데이터 로드 오류 (${ageGroup} ${round} ${groupName}조):`, error);
  }

  return (
    <div
      id={`${ageGroup}-${round}-${groupName}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900">{groupName}조</h4>
      </div>
      
      {standings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  순위
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  팀명
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  경기
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  승
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  무
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  패
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  득점
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  실점
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  득실
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  승점
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  페어
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((standing, index) => (
                <tr key={standing.team_id} className={index < 2 ? 'bg-green-50' : ''}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Link
                      href={`/teams/${standing.team_id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {standing.team_name}
                    </Link>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.played}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.won}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.drawn}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.lost}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.goals_for}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                    {standing.goals_against}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap text-sm text-center font-medium ${
                    standing.goal_difference > 0 ? 'text-green-600' : 
                    standing.goal_difference < 0 ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                    {standing.points}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap text-sm text-center font-medium ${
                    standing.fair_play_points === 0 ? 'text-green-600' : 
                    standing.fair_play_points <= 3 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {standing.fair_play_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-gray-500">
          아직 경기 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
