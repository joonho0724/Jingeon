'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DeleteMatchButtonProps {
  matchId: string;
  matchInfo: string;
}

export default function DeleteMatchButton({ matchId, matchInfo }: DeleteMatchButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`정말로 이 경기를 삭제하시겠습니까?\n\n${matchInfo}`)) {
      return;
    }

    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (deleteError) {
        alert(`경기 삭제 오류: ${deleteError.message}`);
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      alert('경기 삭제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  );
}
