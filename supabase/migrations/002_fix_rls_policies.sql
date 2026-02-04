-- RLS 정책 수정: auth.users 테이블 접근 문제 해결
-- SECURITY DEFINER 함수를 사용하여 auth.users 테이블에 접근

-- 관리자 확인 함수 생성
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_is_admin BOOLEAN;
BEGIN
  SELECT COALESCE(
    (raw_user_meta_data->>'is_admin')::boolean = true 
    OR (raw_user_meta_data->>'is_admin')::text = 'true',
    false
  ) INTO user_is_admin
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_is_admin, false);
END;
$$;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Only admins can insert teams" ON teams;
DROP POLICY IF EXISTS "Only admins can insert matches" ON matches;
DROP POLICY IF EXISTS "Only admins can update teams" ON teams;
DROP POLICY IF EXISTS "Only admins can update matches" ON matches;
DROP POLICY IF EXISTS "Only admins can delete teams" ON teams;
DROP POLICY IF EXISTS "Only admins can delete matches" ON matches;
DROP POLICY IF EXISTS "Only admins can insert fair_play_points" ON fair_play_points;
DROP POLICY IF EXISTS "Only admins can update fair_play_points" ON fair_play_points;
DROP POLICY IF EXISTS "Only admins can delete fair_play_points" ON fair_play_points;

-- 새로운 정책 생성 (함수 사용)
CREATE POLICY "Only admins can insert teams" ON teams
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can insert matches" ON matches
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update teams" ON teams
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can update matches" ON matches
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete teams" ON teams
  FOR DELETE USING (is_admin());

CREATE POLICY "Only admins can delete matches" ON matches
  FOR DELETE USING (is_admin());

CREATE POLICY "Only admins can insert fair_play_points" ON fair_play_points
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update fair_play_points" ON fair_play_points
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete fair_play_points" ON fair_play_points
  FOR DELETE USING (is_admin());
