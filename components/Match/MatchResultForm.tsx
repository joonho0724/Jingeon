'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MatchWithTeams } from '@/types/database';
import { isValidYouTubeUrl } from '@/lib/utils';

interface MatchResultFormProps {
  match: MatchWithTeams;
}

export default function MatchResultForm({ match }: MatchResultFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    home_score: match.home_score?.toString() || '',
    away_score: match.away_score?.toString() || '',
    status: match.status,
    youtube_link: match.youtube_link || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const homeScore = parseInt(formData.home_score);
    const awayScore = parseInt(formData.away_score);

    if (isNaN(homeScore) || isNaN(awayScore)) {
      setError('점수를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (homeScore < 0 || awayScore < 0) {
      setError('점수는 0 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (formData.youtube_link && !isValidYouTubeUrl(formData.youtube_link)) {
      setError('유효한 유튜브 URL을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const updateData: {
        home_score: number;
        away_score: number;
        status: '예정' | '진행중' | '종료';
        youtube_link?: string | null;
      } = {
        home_score: homeScore,
        away_score: awayScore,
        status: formData.status,
      };

      if (formData.status === '종료') {
        updateData.youtube_link = formData.youtube_link || null;
      }

      const { error: updateError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', match.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      router.push('/admin/matches');
      router.refresh();
    } catch (err) {
      setError('경기 결과 업데이트 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`정말로 이 경기를 삭제하시겠습니까?\n\n${match.home_team?.name || '-'} vs ${match.away_team?.name || '-'}\n${new Date(match.date).toLocaleDateString('ko-KR')} ${match.time || ''}`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id);

      if (deleteError) {
        setError(deleteError.message);
        setLoading(false);
        return;
      }

      router.push('/admin/matches');
      router.refresh();
    } catch (err) {
      setError('경기 삭제 중 오류가 발생했습니다.');
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

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">
          {match.round} 리그 - {match.group_name}조
        </div>
        <div className="text-lg font-semibold text-gray-900">
          {match.home_team?.name || '-'} vs {match.away_team?.name || '-'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {new Date(match.date).toLocaleDateString('ko-KR')} {match.time}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            경기 상태
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as '예정' | '진행중' | '종료' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="예정">예정</option>
            <option value="진행중">진행중</option>
            <option value="종료">종료</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="home_score" className="block text-sm font-medium text-gray-700 mb-1">
              {match.home_team?.name || '-'} 점수
            </label>
            <input
              type="number"
              id="home_score"
              min="0"
              value={formData.home_score}
              onChange={(e) => setFormData({ ...formData, home_score: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="away_score" className="block text-sm font-medium text-gray-700 mb-1">
              {match.away_team?.name || '-'} 점수
            </label>
            <input
              type="number"
              id="away_score"
              min="0"
              value={formData.away_score}
              onChange={(e) => setFormData({ ...formData, away_score: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {formData.status === '종료' && (
          <div>
            <label htmlFor="youtube_link" className="block text-sm font-medium text-gray-700 mb-1">
              유튜브 영상 링크 (선택사항)
            </label>
            <input
              type="url"
              id="youtube_link"
              value={formData.youtube_link}
              onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              경기 영상의 유튜브 URL을 입력하세요.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '삭제 중...' : '경기 삭제'}
        </button>
        <div className="flex space-x-4">
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
      </div>
    </form>
  );
}
