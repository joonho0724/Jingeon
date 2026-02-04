-- 005_venues_rls_and_team_numbers.sql
-- 1) venues 테이블 RLS 정책 추가
-- 2) teams 테이블에 팀 번호(전체/조내) 컬럼 추가

-- 1) venues RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view venues" ON venues;
DROP POLICY IF EXISTS "Only admins can insert venues" ON venues;
DROP POLICY IF EXISTS "Only admins can update venues" ON venues;
DROP POLICY IF EXISTS "Only admins can delete venues" ON venues;

CREATE POLICY "Anyone can view venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert venues" ON venues
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update venues" ON venues
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete venues" ON venues
  FOR DELETE USING (is_admin());

-- 2) teams 팀번호 컬럼
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS registration_no INTEGER,      -- 대회 전체 팀 번호(예: 1~56), 선택
ADD COLUMN IF NOT EXISTS group_team_no SMALLINT;       -- 조 내 팀 번호(예: 1~4), 선택

-- 조 내 팀 번호 범위 제한(선택)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_teams_group_team_no_range'
  ) THEN
    ALTER TABLE teams
    ADD CONSTRAINT chk_teams_group_team_no_range
    CHECK (group_team_no IS NULL OR (group_team_no >= 1 AND group_team_no <= 4));
  END IF;
END $$;

-- (age_group, group_name) 내에서 group_team_no는 유일해야 함 (NULL 제외)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_teams_group_team_no
  ON teams (age_group, group_name, group_team_no)
  WHERE group_team_no IS NOT NULL;

-- registration_no는 유일해야 함 (NULL 제외)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_teams_registration_no
  ON teams (registration_no)
  WHERE registration_no IS NOT NULL;

