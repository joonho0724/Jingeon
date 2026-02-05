'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Team } from '@/types/database';
import Link from 'next/link';

const STORAGE_KEY = 'myTeamId';

export default function MyTeamSelector({
  teams,
  currentTeamId,
}: {
  teams: Team[];
  currentTeamId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (a.age_group !== b.age_group) return a.age_group.localeCompare(b.age_group);
      const ga = Number(a.group_name1);
      const gb = Number(b.group_name1);
      if (!Number.isNaN(ga) && !Number.isNaN(gb) && ga !== gb) return ga - gb;
      if (a.group_name1 !== b.group_name1) return a.group_name1.localeCompare(b.group_name1);
      return a.name.localeCompare(b.name);
    });
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedTeams;
    return sortedTeams.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        (t.group_name1 ?? '').toLowerCase().includes(q) ||
        t.age_group.toLowerCase().includes(q) ||
        String(t.registration_no ?? '').includes(q) ||
        String(t.group_team_no1 ?? '').includes(q)
      );
    });
  }, [query, sortedTeams]);

  const setTeamIdParam = (teamId: string | null) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (!teamId) params.delete('teamId');
    else params.set('teamId', teamId);
    const next = params.toString();
    router.push(next ? `/dashboard?${next}` : '/dashboard');
  };

  // URL에 teamId가 없으면 localStorage에 저장된 내 팀을 자동 적용
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());
    const urlTeamId = params.get('teamId');
    if (urlTeamId) return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setTeamIdParam(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (teamId: string) => {
    window.localStorage.setItem(STORAGE_KEY, teamId);
    setTeamIdParam(teamId);
  };

  const clearMyTeam = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setTeamIdParam(null);
  };

  const currentTeam = currentTeamId ? teams.find((t) => t.id === currentTeamId) : undefined;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">내 팀</div>
          <div className="text-sm text-gray-600 mt-1">
            {currentTeam ? (
              <>
                <span className="font-medium text-gray-900">{currentTeam.name}</span>
                <span className="ml-2 text-gray-600">
                  ({currentTeam.age_group} · {currentTeam.group_name1}조)
                </span>
                <Link
                  href={`/teams/${currentTeam.id}`}
                  className="ml-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  팀 상세 →
                </Link>
              </>
            ) : (
              '내 팀을 선택하면 대시보드가 내 팀 중심으로 바뀝니다.'
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {currentTeam && (
            <button
              type="button"
              onClick={clearMyTeam}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              내 팀 해제
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="팀명/조/연령대/번호로 검색"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />

        <select
          value={currentTeamId ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            if (v) handleSelect(v);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">팀 선택...</option>
          {filteredTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.age_group} · {t.group_name1}조
              {t.group_team_no1 ? ` · ${t.group_team_no1}번` : ''}
              {t.registration_no ? ` · 전체 ${t.registration_no}번` : ''})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

