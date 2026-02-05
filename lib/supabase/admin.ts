import { createClient } from '@supabase/supabase-js';

/**
 * 관리자 권한으로 Supabase 클라이언트를 생성합니다.
 * RLS 정책을 우회하기 위해 service role key를 사용합니다.
 * ⚠️ 보안 주의: 이 클라이언트는 서버 사이드에서만 사용해야 합니다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
