'use client';

import { useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Venue } from '@/types/database';

type EditableVenue = Venue & { _localId?: string };

export default function VenueManager({ initialVenues }: { initialVenues: Venue[] }) {
  const supabase = createClient();
  const [selectedRound, setSelectedRound] = useState<'1차' | '2차'>('1차');
  const [venues, setVenues] = useState<EditableVenue[]>(() => {
    // 초기 데이터를 리그별로 필터링
    // round 값이 없으면 1차 리그로 간주 (기존 데이터 호환)
    return initialVenues.filter((v) => (v.round ?? '1차') === '1차');
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 리그 변경 시 venues 필터링
  useEffect(() => {
    // round 값이 없으면 1차 리그로 간주
    const filtered = initialVenues.filter((v) => (v.round ?? '1차') === selectedRound);
    setVenues(filtered);
  }, [selectedRound, initialVenues]);

  const sortedVenues = useMemo(() => {
    return [...venues].sort((a, b) => a.code.localeCompare(b.code));
  }, [venues]);

  const addVenueRow = () => {
    setVenues((prev) => [
      ...prev,
      {
        id: '',
        code: '',
        name: '',
        round: selectedRound,
        created_at: new Date().toISOString(),
        _localId: crypto.randomUUID(),
      },
    ]);
  };

  const removeVenueRow = async (v: EditableVenue) => {
    if (!v.id) {
      // 아직 DB에 없는 로컬 행
      setVenues((prev) => prev.filter((x) => x._localId !== v._localId));
      return;
    }

    if (!confirm(`경기장 "${v.code} - ${v.name}"를 삭제할까요?`)) return;

    setLoading(true);
    setMessage(null);
    const { error } = await supabase.from('venues').delete().eq('id', v.id);
    setLoading(false);

    if (error) {
      setMessage(`삭제 실패: ${error.message}`);
      return;
    }

    setVenues((prev) => prev.filter((x) => x.id !== v.id));
    setMessage('삭제되었습니다.');
  };

  const saveVenues = async () => {
    setLoading(true);
    setMessage(null);

    const payload = venues
      .map((v) => ({
        id: v.id || undefined,
        code: (v.code || '').trim().toUpperCase(),
        name: (v.name || '').trim(),
        round: selectedRound,
      }))
      .filter((v) => v.code.length > 0 && v.name.length > 0);

    if (payload.length === 0) {
      setLoading(false);
      setMessage('저장할 데이터가 없습니다. (코드/이름이 비어있지 않은 행만 저장됩니다)');
      return;
    }

    // code + round 조합으로 upsert
    const { data, error } = await supabase
      .from('venues')
      .upsert(payload, { onConflict: 'code,round' })
      .select();

    setLoading(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    setVenues((data || []) as Venue[]);
    setMessage('저장 완료');
  };

  // 리그 변경 핸들러
  const handleRoundChange = (round: '1차' | '2차') => {
    setSelectedRound(round);
    const filtered = initialVenues.filter((v) => (v.round ?? '1차') === round);
    setVenues(filtered);
    setMessage(null);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">경기장 설정</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedRound} 리그: 코드(A~Z)와 경기장 이름을 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addVenueRow}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            추가
          </button>
          <button
            type="button"
            onClick={saveVenues}
            disabled={loading}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 리그 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="League Tabs">
          <button
            type="button"
            onClick={() => handleRoundChange('1차')}
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
            onClick={() => handleRoundChange('2차')}
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVenues.map((v) => (
              <tr key={v.id || v._localId}>
                <td className="px-3 py-2">
                  <input
                    value={v.code}
                    onChange={(e) =>
                      setVenues((prev) =>
                        prev.map((x) =>
                          (x.id && x.id === v.id) || (x._localId && x._localId === v._localId)
                            ? { ...x, code: e.target.value.toUpperCase().slice(0, 2) }
                            : x
                        )
                      )
                    }
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="A"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={v.name}
                    onChange={(e) =>
                      setVenues((prev) =>
                        prev.map((x) =>
                          (x.id && x.id === v.id) || (x._localId && x._localId === v._localId)
                            ? { ...x, name: e.target.value }
                            : x
                        )
                      )
                    }
                    className="w-full min-w-64 px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="걸매A-1구장"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeVenueRow(v)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {sortedVenues.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={3}>
                  {selectedRound} 리그에 등록된 경기장이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
