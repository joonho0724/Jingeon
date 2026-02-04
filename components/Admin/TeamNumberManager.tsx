'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Team, MatchWithTeams } from '@/types/database';

type EditableTeam = Team & {
  group_name_2nd?: string; // 2차 리그 조
  group_team_no_2nd?: number | null; // 2차 리그 조 내 팀 번호
};

export default function TeamNumberManager({
  initialTeams,
  initialMatches,
}: {
  initialTeams: Team[];
  initialMatches: MatchWithTeams[];
}) {
  const supabase = createClient();
  const [selectedRound, setSelectedRound] = useState<'1차' | '2차'>('1차');
  const [teams, setTeams] = useState<EditableTeam[]>(() => {
    // 2차 리그 정보를 matches에서 추출하여 teams에 병합
    const secondRoundMatches = initialMatches.filter((m) => m.round === '2차');
    const teamMap = new Map<string, EditableTeam>();

    // 1차 리그 정보로 초기화
    initialTeams.forEach((team) => {
      teamMap.set(team.id, { ...team });
    });

    // 2차 리그 정보 추가
    secondRoundMatches.forEach((match) => {
      // 홈팀
      if (match.home_team_id && match.group_name) {
        const team = teamMap.get(match.home_team_id);
        if (team) {
          team.group_name_2nd = match.group_name;
          team.group_team_no_2nd = match.home_team_no;
        }
      }
      // 원정팀
      if (match.away_team_id && match.group_name) {
        const team = teamMap.get(match.away_team_id);
        if (team) {
          // 이미 홈팀으로 설정된 경우, 동일한 조인지 확인
          if (!team.group_name_2nd || team.group_name_2nd === match.group_name) {
            team.group_name_2nd = match.group_name;
            // 팀번호는 홈팀 번호가 없을 때만 원정팀 번호 사용
            if (!team.group_team_no_2nd) {
              team.group_team_no_2nd = match.away_team_no;
            }
          }
        }
      }
    });

    return Array.from(teamMap.values());
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byAge: Record<'U11' | 'U12', Record<string, EditableTeam[]>> = {
      U11: {},
      U12: {},
    };

    teams.forEach((t) => {
      const age = t.age_group;
      const groupName = selectedRound === '1차' ? t.group_name : t.group_name_2nd || '';
      if (!groupName) return; // 2차 리그에서 조 정보가 없는 팀은 제외

      if (!byAge[age][groupName]) byAge[age][groupName] = [];
      byAge[age][groupName].push(t);
    });

    (Object.keys(byAge) as Array<'U11' | 'U12'>).forEach((age) => {
      Object.keys(byAge[age]).forEach((g) => {
        byAge[age][g].sort((a, b) => {
          const aNo = selectedRound === '1차' ? a.group_team_no ?? 999 : a.group_team_no_2nd ?? 999;
          const bNo = selectedRound === '1차' ? b.group_team_no ?? 999 : b.group_team_no_2nd ?? 999;
          if (aNo !== bNo) return aNo - bNo;
          return a.name.localeCompare(b.name);
        });
      });
    });

    return byAge;
  }, [teams, selectedRound]);

  const setTeamField = (teamId: string, patch: Partial<EditableTeam>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...patch } : t)));
  };

  const saveTeams = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (selectedRound === '1차') {
        // 1차 리그: teams 테이블 업데이트
        const updates = teams.map((t) => ({
          id: t.id,
          registration_no: t.registration_no,
          group_name: t.group_name,
          group_team_no: t.group_team_no,
        }));

        const results = await Promise.all(
          updates.map((u) =>
            supabase
              .from('teams')
              .update({
                registration_no: u.registration_no,
                group_name: u.group_name,
                group_team_no: u.group_team_no,
              })
              .eq('id', u.id)
          )
        );

        const firstError = results.find((r) => r.error)?.error;
        if (firstError) {
          setMessage(`저장 실패: ${firstError.message}`);
          setLoading(false);
          return;
        }
      } else {
        // 2차 리그: matches 테이블 업데이트
        // 각 팀의 2차 리그 조/팀번호를 matches 테이블에 반영
        const teamUpdates = teams
          .filter((t) => t.group_name_2nd && t.group_team_no_2nd !== undefined)
          .map((t) => ({
            teamId: t.id,
            groupName: t.group_name_2nd!,
            teamNo: t.group_team_no_2nd,
          }));

        // 해당 팀의 모든 2차 리그 경기를 찾아서 업데이트
        const { data: allMatches } = await supabase
          .from('matches')
          .select('*')
          .eq('round', '2차');

        if (allMatches) {
          const updatePromises: Promise<any>[] = [];

          teamUpdates.forEach((update) => {
            allMatches.forEach((match: any) => {
              const updates: any = {};

              // 홈팀인 경우
              if (match.home_team_id === update.teamId) {
                if (match.group_name !== update.groupName) {
                  updates.group_name = update.groupName;
                }
                if (match.home_team_no !== update.teamNo) {
                  updates.home_team_no = update.teamNo;
                }
              }

              // 원정팀인 경우
              if (match.away_team_id === update.teamId) {
                if (match.group_name !== update.groupName) {
                  updates.group_name = update.groupName;
                }
                if (match.away_team_no !== update.teamNo) {
                  updates.away_team_no = update.teamNo;
                }
              }

              if (Object.keys(updates).length > 0) {
                updatePromises.push(
                  supabase
                    .from('matches')
                    .update(updates)
                    .eq('id', match.id)
                );
              }
            });
          });

          const results = await Promise.all(updatePromises);
          const firstError = results.find((r) => r.error)?.error;
          if (firstError) {
            setMessage(`저장 실패: ${firstError.message}`);
            setLoading(false);
            return;
          }
        }
      }

      setMessage('저장 완료');
    } catch (error: any) {
      setMessage(`저장 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">팀 번호 설정</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedRound === '1차'
              ? '1차 리그: 팀 번호(전체: 1~56 등)와 조 내 팀 번호(1~4)를 설정합니다.'
              : '2차 리그: 조와 조 내 팀 번호(1~4)를 설정합니다. (2차 리그 경기가 등록되어 있어야 표시됩니다.)'}
          </p>
        </div>
        <button
          type="button"
          onClick={saveTeams}
          disabled={loading}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* 리그 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="League Tabs">
          <button
            type="button"
            onClick={() => setSelectedRound('1차')}
            className={`${
              selectedRound === '1차'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            1차 리그
          </button>
          <button
            type="button"
            onClick={() => setSelectedRound('2차')}
            className={`${
              selectedRound === '2차'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            2차 리그
          </button>
        </nav>
      </div>

      {message && (
        <div className="mb-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
          {message}
        </div>
      )}

      <div className="space-y-8">
        {(['U11', 'U12'] as const).map((age) => {
          const groups = Object.keys(grouped[age]).sort((a, b) => Number(a) - Number(b));
          return (
            <div key={age}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{age}</h3>

              {groups.length === 0 ? (
                <p className="text-sm text-gray-600">
                  {selectedRound === '2차'
                    ? '2차 리그 경기가 등록되지 않았거나, 등록된 팀이 없습니다.'
                    : '등록된 팀이 없습니다.'}
                </p>
              ) : (
                <div className="space-y-6">
                  {groups.map((groupName) => (
                    <div key={`${age}-${groupName}`} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="font-medium text-gray-900">{groupName}조</div>
                        <div className="text-xs text-gray-500">
                          조 내 번호는 1~4 (중복 불가)
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                팀명
                              </th>
                              {selectedRound === '1차' && (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  전체 팀 번호
                                </th>
                              )}
                              {selectedRound === '1차' && (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  조
                                </th>
                              )}
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                조 내 번호
                              </th>
                              {selectedRound === '2차' && (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  조
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {grouped[age][groupName].map((t) => (
                              <tr key={t.id}>
                                <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{t.name}</td>
                                {selectedRound === '1차' && (
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min={1}
                                      value={t.registration_no ?? ''}
                                      onChange={(e) =>
                                        setTeamField(t.id, {
                                          registration_no: e.target.value === '' ? null : Number(e.target.value),
                                        })
                                      }
                                      className="w-28 px-2 py-1 border border-gray-300 rounded-md"
                                      placeholder="예: 12"
                                    />
                                  </td>
                                )}
                                {selectedRound === '1차' && (
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min={1}
                                      max={16}
                                      value={t.group_name ?? ''}
                                      onChange={(e) =>
                                        setTeamField(t.id, {
                                          group_name: e.target.value,
                                        })
                                      }
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                      placeholder="조"
                                    />
                                  </td>
                                )}
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min={1}
                                    max={4}
                                    value={
                                      selectedRound === '1차' ? t.group_team_no ?? '' : t.group_team_no_2nd ?? ''
                                    }
                                    onChange={(e) => {
                                      if (selectedRound === '1차') {
                                        setTeamField(t.id, {
                                          group_team_no: e.target.value === '' ? null : Number(e.target.value),
                                        });
                                      } else {
                                        setTeamField(t.id, {
                                          group_team_no_2nd: e.target.value === '' ? null : Number(e.target.value),
                                        });
                                      }
                                    }}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                                    placeholder="1~4"
                                  />
                                </td>
                                {selectedRound === '2차' && (
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min={1}
                                      max={16}
                                      value={t.group_name_2nd ?? ''}
                                      onChange={(e) =>
                                        setTeamField(t.id, {
                                          group_name_2nd: e.target.value,
                                        })
                                      }
                                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                      placeholder="조"
                                    />
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
