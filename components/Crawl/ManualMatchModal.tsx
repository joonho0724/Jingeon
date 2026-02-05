'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { MatchWithTeams } from '@/types/database';

interface CrawledMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  ageGroup: string;
  matchNumber?: number;
}

interface ManualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  crawledMatch: CrawledMatch;
  reason: string;
  onSuccess: () => void;
}

export default function ManualMatchModal({
  isOpen,
  onClose,
  crawledMatch,
  reason,
  onSuccess,
}: ManualMatchModalProps) {
  const [dbMatches, setDbMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMatches();
    }
  }, [isOpen]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setDbMatches(data.matches || []);
      }
    } catch (err) {
      console.error('경기 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 경기 목록 (연령대, 날짜, 팀명으로 필터링)
  const filteredMatches = dbMatches.filter((match) => {
    // 연령대 필터
    if (match.age_group !== crawledMatch.ageGroup) return false;

    // 날짜 필터 (같은 날짜)
    if (match.date !== crawledMatch.date) return false;

    // 검색어 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const homeTeamName = match.home_team?.name?.toLowerCase() || '';
      const awayTeamName = match.away_team?.name?.toLowerCase() || '';
      const matchDate = match.date || '';
      const matchTime = match.time || '';

      if (
        !homeTeamName.includes(searchLower) &&
        !awayTeamName.includes(searchLower) &&
        !matchDate.includes(searchLower) &&
        !matchTime.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  const handleMatch = async () => {
    if (!selectedMatchId) {
      setError('매칭할 경기를 선택해주세요.');
      return;
    }

    setMatching(true);
    setError(null);

    try {
      const response = await fetch('/api/crawl/manual-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: selectedMatchId,
          crawledMatch,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || '매칭에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '매칭 중 오류가 발생했습니다.');
    } finally {
      setMatching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">수동 매칭</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 크롤링된 경기 정보 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">크롤링된 경기 정보</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">날짜/시간:</span> {crawledMatch.date} {crawledMatch.time}
                </p>
                <p>
                  <span className="font-medium">연령대:</span> {crawledMatch.ageGroup}
                </p>
                <p>
                  <span className="font-medium">팀:</span> {crawledMatch.homeTeam} vs {crawledMatch.awayTeam}
                </p>
                <p>
                  <span className="font-medium">점수:</span> {crawledMatch.homeScore} : {crawledMatch.awayScore}
                </p>
                {crawledMatch.matchNumber && (
                  <p>
                    <span className="font-medium">경기번호:</span> {crawledMatch.matchNumber}
                  </p>
                )}
                <p className="text-red-600 mt-2">
                  <span className="font-medium">실패 이유:</span> {reason}
                </p>
              </div>
            </div>

            {/* 검색 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="팀명, 날짜, 시간으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* DB 경기 목록 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                매칭할 경기 선택 ({filteredMatches.length}개)
              </h4>
              {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  매칭 가능한 경기가 없습니다.
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          선택
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          날짜/시간
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          홈팀
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          원정팀
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          조
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMatches.map((match) => (
                        <tr
                          key={match.id}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedMatchId === match.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedMatchId(match.id)}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="radio"
                              name="match"
                              checked={selectedMatchId === match.id}
                              onChange={() => setSelectedMatchId(match.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {match.date} {match.time || ''}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {match.home_team?.name || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {match.away_team?.name || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {match.group_name}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                match.status === '종료'
                                  ? 'bg-green-100 text-green-800'
                                  : match.status === '진행중'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {match.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={matching}
              >
                취소
              </button>
              <button
                onClick={handleMatch}
                disabled={!selectedMatchId || matching}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  !selectedMatchId || matching
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {matching ? '매칭 중...' : '매칭 및 업데이트'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
