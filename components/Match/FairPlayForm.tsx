'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MatchWithTeams, FairPlayPoint, Team } from '@/types/database';
import { calculatePenaltyPoints, penaltyTypeDescriptions, StaffType, PenaltyType } from '@/lib/utils/fairPlay';

interface FairPlayFormProps {
  match: MatchWithTeams;
}

interface FairPlayFormData {
  team_id: string;
  player_id: string;
  staff_type: StaffType;
  penalty_type: PenaltyType;
  description: string;
}

export default function FairPlayForm({ match }: FairPlayFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fairPlayPoints, setFairPlayPoints] = useState<FairPlayPoint[]>([]);
  const [formData, setFormData] = useState<FairPlayFormData>({
    team_id: match.home_team_id,
    player_id: '',
    staff_type: '선수',
    penalty_type: '경고',
    description: '',
  });

  // 기존 페어플레이 점수 조회
  useEffect(() => {
    loadFairPlayPoints();
  }, [match.id]);

  const loadFairPlayPoints = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('fair_play_points')
        .select('*')
        .eq('match_id', match.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('페어플레이 점수 조회 오류:', fetchError);
        return;
      }

      setFairPlayPoints(data || []);
    } catch (err) {
      console.error('페어플레이 점수 조회 중 오류:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.team_id) {
      setError('팀을 선택해주세요.');
      setLoading(false);
      return;
    }

    if (formData.staff_type === '선수' && !formData.player_id.trim()) {
      setError('선수인 경우 배번 또는 이름을 입력해주세요.');
      setLoading(false);
      return;
    }

    const points = calculatePenaltyPoints(formData.staff_type, formData.penalty_type);

    try {
      const { error: insertError } = await supabase
        .from('fair_play_points')
        .insert({
          match_id: match.id,
          team_id: formData.team_id,
          player_id: formData.staff_type === '선수' ? formData.player_id.trim() : null,
          staff_type: formData.staff_type,
          penalty_type: formData.penalty_type,
          points: points,
          description: formData.description.trim() || null,
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // 폼 초기화
      setFormData({
        team_id: match.home_team_id,
        player_id: '',
        staff_type: '선수',
        penalty_type: '경고',
        description: '',
      });

      // 목록 새로고침
      await loadFairPlayPoints();
      setLoading(false);
    } catch (err) {
      setError('페어플레이 점수 입력 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 벌점 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('fair_play_points')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      await loadFairPlayPoints();
    } catch (err) {
      setError('페어플레이 점수 삭제 중 오류가 발생했습니다.');
    }
  };

  // 팀별 벌점 합계 계산
  const getTeamTotalPoints = (teamId: string) => {
    return fairPlayPoints
      .filter(fpp => fpp.team_id === teamId)
      .reduce((sum, fpp) => sum + fpp.points, 0);
  };

  const homeTeamTotal = getTeamTotalPoints(match.home_team_id);
  const awayTeamTotal = getTeamTotalPoints(match.away_team_id);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">페어플레이 점수 입력</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 팀별 벌점 합계 표시 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">{match.home_team?.name || '-'}</div>
          <div className="text-2xl font-bold text-gray-900">{homeTeamTotal}점</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">{match.away_team?.name || '-'}</div>
          <div className="text-2xl font-bold text-gray-900">{awayTeamTotal}점</div>
        </div>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-1">
            팀 선택
          </label>
          <select
            id="team_id"
            value={formData.team_id}
            onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={match.home_team_id}>{match.home_team?.name || '-'}</option>
            <option value={match.away_team_id}>{match.away_team?.name || '-'}</option>
          </select>
        </div>

        <div>
          <label htmlFor="staff_type" className="block text-sm font-medium text-gray-700 mb-1">
            구분
          </label>
          <select
            id="staff_type"
            value={formData.staff_type}
            onChange={(e) => setFormData({ ...formData, staff_type: e.target.value as StaffType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="선수">선수</option>
            <option value="지도자">지도자</option>
            <option value="임원">임원</option>
          </select>
        </div>

        {formData.staff_type === '선수' && (
          <div>
            <label htmlFor="player_id" className="block text-sm font-medium text-gray-700 mb-1">
              선수 배번 또는 이름
            </label>
            <input
              type="text"
              id="player_id"
              value={formData.player_id}
              onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
              placeholder="예: 7번 또는 홍길동"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="penalty_type" className="block text-sm font-medium text-gray-700 mb-1">
            벌점 유형
          </label>
          <select
            id="penalty_type"
            value={formData.penalty_type}
            onChange={(e) => setFormData({ ...formData, penalty_type: e.target.value as PenaltyType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="경고">경고 (선수: 1점, 지도자/임원: 2점)</option>
            <option value="경고누적퇴장">경고 누적(2회) 퇴장 (선수: 3점, 지도자/임원: 4점)</option>
            <option value="직접퇴장">직접 퇴장 (선수: 3점, 지도자/임원: 4점)</option>
            <option value="경고후직접퇴장">경고 1회 후 직접퇴장 (선수: 4점, 지도자/임원: 6점)</option>
            <option value="공정위팀경고">공정소위원회 결정 팀 경고 (6점)</option>
            <option value="공정위경고">공정소위원회 결정 경고 (1점)</option>
            <option value="공정위출전정지">공정소위원회 결정 출전정지 (1경기당 2점)</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            자동 계산 벌점: {calculatePenaltyPoints(formData.staff_type, formData.penalty_type)}점
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            상세 설명 (선택사항)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="벌점에 대한 상세 설명을 입력하세요."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '저장 중...' : '벌점 추가'}
        </button>
      </form>

      {/* 벌점 목록 */}
      {fairPlayPoints.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">벌점 기록</h3>
          <div className="space-y-2">
            {fairPlayPoints.map((fpp) => {
              const team = fpp.team_id === match.home_team_id ? match.home_team : match.away_team;
              return (
                <div
                  key={fpp.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{team?.name || '-'}</span>
                      <span className="text-sm text-gray-600">({fpp.staff_type})</span>
                      {fpp.player_id && (
                        <span className="text-sm text-gray-600">- {fpp.player_id}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      {penaltyTypeDescriptions[fpp.penalty_type]} ({fpp.points}점)
                    </div>
                    {fpp.description && (
                      <div className="text-xs text-gray-500 mt-1">{fpp.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(fpp.id)}
                    className="ml-4 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
