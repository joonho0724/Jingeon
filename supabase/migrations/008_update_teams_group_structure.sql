-- teams 테이블 구조 변경
-- group_name → group_name1 (1차 리그용)
-- group_team_no → group_team_no1 (1차 리그 팀 번호)
-- group_name2 추가 (2차 리그용, null)

-- 1. group_name을 group_name1로 변경
ALTER TABLE teams RENAME COLUMN group_name TO group_name1;

-- 2. group_team_no를 group_team_no1로 변경
ALTER TABLE teams RENAME COLUMN group_team_no TO group_team_no1;

-- 3. group_name2 컬럼 추가 (2차 리그용, null 허용)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_name2 TEXT;

-- 4. 인덱스 업데이트 (group_name → group_name1)
DROP INDEX IF EXISTS idx_teams_group_name;
CREATE INDEX IF NOT EXISTS idx_teams_group_name1 ON teams(group_name1);
CREATE INDEX IF NOT EXISTS idx_teams_group_name2 ON teams(group_name2);
