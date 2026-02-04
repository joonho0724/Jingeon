import { getMatches } from '@/lib/supabase/queries';
import MatchCard from '@/components/Dashboard/MatchCard';
import AgeGroupTabs from '@/components/Matches/AgeGroupTabs';
import type { MatchWithTeams } from '@/types/database';

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: { ageGroup?: string };
}) {
  // 기본값은 U11
  const selectedAgeGroup = (searchParams?.ageGroup === 'U12' ? 'U12' : 'U11') as 'U11' | 'U12';

  let matches: MatchWithTeams[] = [];
  
  try {
    matches = await getMatches();
  } catch (error) {
    console.error('데이터 로드 오류:', error);
  }

  // 선택된 연령대의 경기만 필터링
  // matches.age_group을 우선 사용, 없으면 팀의 age_group 사용
  const filteredMatches = matches.filter((match) => {
    // matches 테이블의 age_group 컬럼이 있으면 우선 사용
    if (match.age_group) {
      return match.age_group === selectedAgeGroup;
    }
    // fallback: 팀의 age_group 사용
    const homeAge = match.home_team?.age_group;
    const awayAge = match.away_team?.age_group;
    return homeAge === selectedAgeGroup || awayAge === selectedAgeGroup;
  });

  // 리그별로 그룹화 및 정렬 (날짜 → 시간 → 조 → 팀번호 순)
  const matchesByRound = {
    '1차': filteredMatches
      .filter(m => m.round === '1차')
      .sort((a, b) => {
        // 1. 날짜
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        // 2. 시간
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        if (timeA !== timeB) {
          return timeA.localeCompare(timeB);
        }
        // 3. 조 (숫자로 변환해서 비교)
        const groupA = parseInt(a.group_name) || 0;
        const groupB = parseInt(b.group_name) || 0;
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        // 4. 팀번호 (홈팀 번호 기준)
        const teamNoA = a.home_team_no || 0;
        const teamNoB = b.home_team_no || 0;
        return teamNoA - teamNoB;
      }),
    '2차': filteredMatches
      .filter(m => m.round === '2차')
      .sort((a, b) => {
        // 1. 날짜
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        // 2. 시간
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        if (timeA !== timeB) {
          return timeA.localeCompare(timeB);
        }
        // 3. 조 (숫자로 변환해서 비교)
        const groupA = parseInt(a.group_name) || 0;
        const groupB = parseInt(b.group_name) || 0;
        if (groupA !== groupB) {
          return groupA - groupB;
        }
        // 4. 팀번호 (홈팀 번호 기준)
        const teamNoA = a.home_team_no || 0;
        const teamNoB = b.home_team_no || 0;
        return teamNoA - teamNoB;
      }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">경기 일정</h1>

      <AgeGroupTabs currentAgeGroup={selectedAgeGroup} />

      {(['1차', '2차'] as const).map((round) => (
        <section key={round} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {round} 리그
          </h2>
          
          {matchesByRound[round].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchesByRound[round].map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">등록된 경기가 없습니다.</p>
          )}
        </section>
      ))}
    </div>
  );
}
