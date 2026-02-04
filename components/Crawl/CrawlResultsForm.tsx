'use client';

import { useState } from 'react';

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
    };
    reason: string;
  }>;
  errors?: string[];
  error?: string;
}

interface AnalyzeResponse {
  success: boolean;
  analysis?: {
    mainPage: {
      url: string;
      title: string;
      links: Array<{ text: string; href: string; selector: string }>;
      buttons: Array<{ text: string; selector: string }>;
      possibleLeagueSelectors: string[];
    };
    filterPage?: {
      url: string;
      title: string;
      selects: Array<{ name: string; id: string; options: string[] }>;
      inputs: Array<{ type: string; name: string; id: string; value: string }>;
      buttons: Array<{ text: string; type: string; selector: string }>;
    };
    tournaments?: Array<{
      name: string;
      ageGroup: 'U11' | 'U12' | 'unknown';
      url?: string;
      id?: string;
    }>;
  };
  error?: string;
}

export default function CrawlResultsForm() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CrawlResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [directUrls, setDirectUrls] = useState<string>('');
  const [apiPayload, setApiPayload] = useState<string>('');
  const [useApiDirect, setUseApiDirect] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/crawl/analyze');
      const data: AnalyzeResponse = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      setAnalysis({
        success: false,
        error: error.message || '분석 중 오류가 발생했습니다.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCrawl = async () => {
    setLoading(true);
    setResult(null);

    try {
      const body: any = {};
      
      // API 직접 호출이 활성화된 경우 (현재는 사용하지 않지만 호환성을 위해 유지)
      if (useApiDirect && apiPayload.trim()) {
        try {
          const payload = JSON.parse(apiPayload);
          body.apiPayload = payload;
        } catch (e) {
          setResult({
            success: false,
            error: 'API Payload 형식이 올바르지 않습니다. JSON 형식을 확인해주세요.',
          });
          setLoading(false);
          return;
        }
      }
      
      // 대회 ID는 서버에서 고정값으로 사용됨 (관리자 입력 불필요)

      const response = await fetch('/api/crawl/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
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

        {/* API 직접 호출 옵션 (권장) */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="useApiDirect"
              checked={useApiDirect}
              onChange={(e) => setUseApiDirect(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="useApiDirect" className="text-sm font-medium text-gray-700">
              API 직접 호출 (권장 - 가장 빠르고 안정적)
            </label>
          </div>

          {useApiDirect && (
            <div className="space-y-4 mt-4">
              <div className="bg-white p-4 rounded border border-green-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">사용 방법:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>브라우저에서 joinkfa.com 접속</li>
                  <li>F12 키를 눌러 개발자 도구 열기</li>
                  <li><strong>Network 탭</strong> 선택</li>
                  <li>필터: 2026년, 대회, 초등, 제주로 설정하여 대회 목록 조회</li>
                  <li>Network 탭에서 <strong>getMatchList.do</strong> 요청 찾기</li>
                  <li>요청을 클릭 → <strong>Payload</strong> 또는 <strong>Request Payload</strong> 확인</li>
                  <li>아래 필드에 JSON 형식으로 붙여넣기</li>
                </ol>
                <p className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✅ 이 방법은 브라우저 자동화 없이 API를 직접 호출하므로 가장 빠르고 안정적입니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  getMatchList.do 요청 본문 (JSON 형식)
                </label>
                <textarea
                  value={apiPayload}
                  onChange={(e) => setApiPayload(e.target.value)}
                  placeholder='{"year": "2026", "style": "S", "mgcNm": "초등", "sido": "제주"}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  rows={5}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    💡 <strong>확인 방법:</strong> Network 탭에서 getMatchList.do 요청을 클릭 → 오른쪽 패널에서 <strong>Payload</strong> 탭 클릭
                  </p>
                  <p className="text-xs text-gray-500">
                    또는 <strong>Headers</strong> 탭에서 스크롤하여 <strong>Request Payload</strong> 섹션 확인
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApiPayload('{"v_CURPAGENUM":"1","v_ROWCOUNTPERPAGE":"20","v_ORDERBY":"","v_YEAR":"2026","v_STYLE":"MATCH","v_MGC_IDX":"51","v_AREACODE":"CJ","v_SIGUNGU_CODE":"","v_ITEM_CD":"S","v_TITLE":"","v_TEAMID":"","v_USER_ID":""}');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    기본값 사용 (2026년, 대회, 초등, 제주)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || loading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              analyzing || loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {analyzing ? '분석 중...' : '페이지 구조 분석'}
          </button>
          <button
            onClick={handleCrawl}
            disabled={loading || analyzing}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              loading || analyzing
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '크롤링 중...' : '경기 결과 수집 시작'}
          </button>
        </div>
      </div>

      {analyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800">joinkfa.com 페이지 구조를 분석하고 있습니다...</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">페이지 구조 분석 결과</h3>
          
          {analysis.success && analysis.analysis ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">메인 페이지</h4>
                <p className="text-sm text-gray-600">URL: {analysis.analysis.mainPage.url}</p>
                <p className="text-sm text-gray-600">제목: {analysis.analysis.mainPage.title}</p>
                <p className="text-sm text-gray-600">
                  링크 수: {analysis.analysis.mainPage.links.length}개
                </p>
                <p className="text-sm text-gray-600">
                  가능한 리그/대회 선택자: {analysis.analysis.mainPage.possibleLeagueSelectors.length}개
                </p>
                
                {analysis.analysis.mainPage.possibleLeagueSelectors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">발견된 선택자:</p>
                    <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                      {analysis.analysis.mainPage.possibleLeagueSelectors.slice(0, 10).map((selector, idx) => (
                        <li key={idx} className="font-mono">{selector}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {analysis.analysis.filterPage && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">필터 페이지</h4>
                  <p className="text-sm text-gray-600">URL: {analysis.analysis.filterPage.url}</p>
                  <p className="text-sm text-gray-600">
                    Select 요소: {analysis.analysis.filterPage.selects.length}개
                  </p>
                  <p className="text-sm text-gray-600">
                    Input 요소: {analysis.analysis.filterPage.inputs.length}개
                  </p>
                  <p className="text-sm text-gray-600">
                    Button 요소: {analysis.analysis.filterPage.buttons.length}개
                  </p>
                  
                  {/* Select 요소 상세 정보 */}
                  {analysis.analysis.filterPage.selects.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Select 요소:</p>
                      {analysis.analysis.filterPage.selects.map((select, idx) => (
                        <div key={idx} className="mb-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="font-medium">이름: {select.name || select.id || 'N/A'}</p>
                          <p className="text-gray-600">옵션 수: {select.options.length}개</p>
                          {select.options.length > 0 && (
                            <p className="text-gray-500 mt-1">
                              옵션: {select.options.slice(0, 5).join(', ')}
                              {select.options.length > 5 && '...'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 대회 목록 */}
              {analysis.analysis.tournaments && analysis.analysis.tournaments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    발견된 대회 ({analysis.analysis.tournaments.length}개)
                  </h4>
                  <div className="space-y-2">
                    {analysis.analysis.tournaments.map((tournament, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          tournament.ageGroup === 'U11' || tournament.ageGroup === 'U12'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{tournament.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  tournament.ageGroup === 'U11'
                                    ? 'bg-blue-100 text-blue-700'
                                    : tournament.ageGroup === 'U12'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {tournament.ageGroup === 'U11'
                                  ? 'U11'
                                  : tournament.ageGroup === 'U12'
                                  ? 'U12'
                                  : '연령대 미확인'}
                              </span>
                              {tournament.id && (
                                <span className="text-xs text-gray-500">ID: {tournament.id}</span>
                              )}
                            </div>
                            {tournament.url && (
                              <p className="text-xs text-gray-500 mt-1 break-all">{tournament.url}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">분석 실패</p>
              <p className="text-red-600 text-sm mt-1">{analysis.error}</p>
            </div>
          )}
        </div>
      )}

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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.failedMatchesList.map((item, index) => (
                        <tr key={index}>
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
                        </tr>
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
