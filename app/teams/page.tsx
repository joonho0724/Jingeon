import { getTeams } from '@/lib/supabase/queries';
import Link from 'next/link';
import type { Team } from '@/types/database';

export default async function TeamsPage() {
  let teams: Team[] = [];
  
  try {
    teams = await getTeams();
  } catch (error) {
    console.error('데이터 로드 오류:', error);
  }

  const teamsByAgeGroup = {
    U12: teams.filter(t => t.age_group === 'U12'),
    U11: teams.filter(t => t.age_group === 'U11'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">팀 정보</h1>

      {(['U12', 'U11'] as const).map((ageGroup) => (
        <section key={ageGroup} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {ageGroup}
          </h2>
          {teamsByAgeGroup[ageGroup].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamsByAgeGroup[ageGroup].map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {team.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {team.group_name1}조
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">등록된 팀이 없습니다.</p>
          )}
        </section>
      ))}
    </div>
  );
}
