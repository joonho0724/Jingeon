'use client';

import { useState } from 'react';
import ManualMatchModal from './ManualMatchModal';

interface CrawlResponse {
  success: boolean;
  totalMatches?: number;
  updatedMatches?: number;
  failedMatches?: number;
  failedMatchesList?: Array<{
    match: {
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      date: string;
      time: string;
      ageGroup: string;
      matchNumber?: number;
    };
    reason: string;
  }>;
  errors?: string[];
  error?: string;
}

// 실패한 경기 행 컴포넌트
function FailedMatchRow({
  item,
  onMatchSuccess,
}: {
  item: {
    match: {
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      date: string;
      time: string;
      ageGroup: string;
      matchNumber?: number;
    };
    reason: string;
  };
  onMatchSuccess: () => void;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <tr>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {item.match.date} {item.match.time}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {item.match.ageGroup}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {item.match.homeTeam}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {item.match.awayTeam}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {item.match.homeScore} : {item.match.awayScore}
        </td>
        <td className="px-4 py-3 text-sm text-red-600">{item.reason}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md"
          >
            수동 매칭
          </button>
        </td>
      </tr>
      {showModal && (
        <ManualMatchModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          crawledMatch={item.match}
          reason={item.reason}
          onSuccess={onMatchSuccess}
        />
      )}
    </>
  );
}

export default function CrawlResultsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResponse | null>(null);

  const handleCrawl = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/crawl/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: CrawlResponse = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || '크롤링 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600 text-sm mb-6">
          joinkfa.com에서 2026 서귀포 칠십리 춘계 유소년 축구 페스티벌 (U11, U12)의 경기 결과를
          자동으로 수집하여 데이터베이스에 업데이트합니다.
        </p>
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>대회 ID는 시스템에 고정되어 있습니다.</strong> 관리자가 별도로 입력할 필요가 없습니다.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCrawl}
            disabled={loading}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '크롤링 중...' : '경기 결과 수집 시작'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800">joinkfa.com에서 경기 결과를 수집하고 있습니다...</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* 결과 요약 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">크롤링 결과</h3>

            {result.success ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">수집된 경기</p>
                  <p className="text-2xl font-bold text-gray-900">{result.totalMatches || 0}건</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">업데이트된 경기</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.updatedMatches || 0}건
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">실패한 경기</p>
                  <p className="text-2xl font-bold text-red-600">
                    {result.failedMatches || 0}건
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">크롤링 실패</p>
                <p className="text-red-600 text-sm mt-1">{result.error}</p>
              </div>
            )}

            {/* 에러 목록 */}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">에러 목록:</p>
                <ul className="list-disc list-inside space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 실패한 경기 목록 */}
            {result.failedMatchesList && result.failedMatchesList.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  실패한 경기 목록 ({result.failedMatchesList.length}건):
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          날짜/시간
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          연령대
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          홈팀
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          원정팀
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          점수
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          실패 이유
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.failedMatchesList.map((item, index) => (
                        <FailedMatchRow
                          key={index}
                          item={item}
                          onMatchSuccess={() => {
                            // 성공 시 해당 경기를 목록에서 제거
                            if (result) {
                              const updatedFailedMatches = result.failedMatchesList?.filter(
                                (_, i) => i !== index
                              ) || [];
                              setResult({
                                ...result,
                                failedMatchesList: updatedFailedMatches,
                                failedMatches: updatedFailedMatches.length,
                                updatedMatches: (result.updatedMatches || 0) + 1,
                              });
                            }
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
