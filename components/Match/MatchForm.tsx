'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Team, Venue } from '@/types/database';

interface MatchFormProps {
  teams: Team[];
  venues: Venue[];
}

export default function MatchForm({ teams, venues }: MatchFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    round: '1차' as '1차' | '2차',
    group_name: '',
    match_no: '',
    pitch_code: '',
    home_team_id: '',
    away_team_id: '',
    home_team_no: '',
    away_team_no: '',
  });

  // 선택한 리그에 맞는 경기장 목록 필터링
  const filteredVenues = venues.filter((v) => v.round === formData.round);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.home_team_id === formData.away_team_id) {
      setError('홈팀과 원정팀은 같을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('matches')
        .insert({
          date: formData.date,
          time: formData.time || null,
          round: formData.round,
          group_name: formData.group_name,
          match_no: formData.match_no ? Number(formData.match_no) : null,
          pitch_code: formData.pitch_code || null,
          home_team_id: formData.home_team_id,
          home_team_no: formData.home_team_no ? Number(formData.home_team_no) : null,
          away_team_id: formData.away_team_id,
          away_team_no: formData.away_team_no ? Number(formData.away_team_no) : null,
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('경기 등록 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-1">
            리그
          </label>
          <select
            id="round"
            value={formData.round}
            onChange={(e) => setFormData({ ...formData, round: e.target.value as '1차' | '2차' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="1차">1차 리그</option>
            <option value="2차">2차 리그</option>
          </select>
        </div>

        <div>
          <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 mb-1">
            조 (숫자)
          </label>
          <input
            id="group_name"
            type="number"
            min={1}
            max={16}
            value={formData.group_name}
            onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            시간 (선택사항)
          </label>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="pitch_code" className="block text-sm font-medium text-gray-700 mb-1">
            경기장 코드 (선택사항, A~Z)
          </label>
          <select
            id="pitch_code"
            value={formData.pitch_code}
            onChange={(e) => setFormData({ ...formData, pitch_code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하세요</option>
            {filteredVenues.map((v) => (
              <option key={v.id} value={v.code}>
                {v.code} - {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="match_no" className="block text-sm font-medium text-gray-700 mb-1">
              경기번호 (선택사항)
            </label>
            <input
              id="match_no"
              type="number"
              min={1}
              value={formData.match_no}
              onChange={(e) => setFormData({ ...formData, match_no: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="home_team_no" className="block text-sm font-medium text-gray-700 mb-1">
              홈팀 번호 (선택사항)
            </label>
            <input
              id="home_team_no"
              type="number"
              min={1}
              max={4}
              value={formData.home_team_no}
              onChange={(e) => setFormData({ ...formData, home_team_no: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="away_team_no" className="block text-sm font-medium text-gray-700 mb-1">
              원정팀 번호 (선택사항)
            </label>
            <input
              id="away_team_no"
              type="number"
              min={1}
              max={4}
              value={formData.away_team_no}
              onChange={(e) => setFormData({ ...formData, away_team_no: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="home_team_id" className="block text-sm font-medium text-gray-700 mb-1">
            홈팀
          </label>
          <select
            id="home_team_id"
            value={formData.home_team_id}
            onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">선택하세요</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="away_team_id" className="block text-sm font-medium text-gray-700 mb-1">
            원정팀
          </label>
          <select
            id="away_team_id"
            value={formData.away_team_id}
            onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">선택하세요</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
