-- ⚠️ DEV/MAINTENANCE ONLY
-- teams 리셋 이후 기존 matches에 home_team_id / away_team_id를 다시 연결하기 위한 보조 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

-- 018_relink_matches_to_teams.sql
-- 목적:
-- - 이미 생성되어 있는 경기 일정(matches)에 대해
--   새로 정리된 teams 테이블 기준으로 home_team_id / away_team_id를 다시 연결한다.
-- - 1차 리그(round = '1차')를 우선 대상으로 한다.
--
-- 매핑 기준:
-- - matches.age_group      = teams.age_group
-- - matches.round          = '1차'
-- - matches.group_name     = teams.group_name1
-- - matches.home_team_no   = teams.group_team_no1 (홈)
-- - matches.away_team_no   = teams.group_team_no1 (원정)
--
-- ⚠️ 주의:
-- - 이 스크립트는 기존 home_team_id / away_team_id 값을 덮어쓴다.
-- - 2차 리그(round = '2차')는 teams.group_name2 / 별도 매핑 규칙 정리 후에 추가하는 것이 안전하다.

BEGIN;

-- 1) 1차 리그 홈팀 매핑
UPDATE matches AS m
SET home_team_id = t.id
FROM teams AS t
WHERE
  m.round = '1차'
  AND m.age_group = t.age_group
  AND m.group_name = t.group_name1
  AND m.home_team_no IS NOT NULL
  AND t.group_team_no1 = m.home_team_no;

-- 2) 1차 리그 원정팀 매핑
UPDATE matches AS m
SET away_team_id = t.id
FROM teams AS t
WHERE
  m.round = '1차'
  AND m.age_group = t.age_group
  AND m.group_name = t.group_name1
  AND m.away_team_no IS NOT NULL
  AND t.group_team_no1 = m.away_team_no;

COMMIT;

