-- ⚠️ DEV/MAINTENANCE ONLY
-- 1차 리그 기존 데이터에 대해 home_team_no / away_team_no를 규칙에 따라 채우기 위한 정리용 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

-- 019_set_match_team_numbers_from_schedule.sql
-- 목적:
-- - 1차 리그(round = '1차') 경기들에 대해
--   조별 대진 규칙(4팀 풀리그 / 3팀 풀리그)에 따라
--   home_team_no, away_team_no를 채운다.
--
-- 규칙 (4팀 조: 1,2,3,4)
--   1경기: 1 vs 2
--   2경기: 3 vs 4
--   3경기: 1 vs 3
--   4경기: 2 vs 4
--   5경기: 1 vs 4
--   6경기: 2 vs 3
--
-- 규칙 (3팀 조: 1,2,3)
--   1경기: 1 vs 2
--   2경기: 1 vs 3
--   3경기: 2 vs 3
--
-- 매칭 기준:
-- - age_group, round, group_name 단위로
-- - date, time, pitch_code, id 순으로 정렬한 순서가 1~6(or 1~3)번째 경기라고 가정

BEGIN;

WITH ordered AS (
  SELECT
    id,
    age_group,
    round,
    group_name,
    ROW_NUMBER() OVER (
      PARTITION BY age_group, round, group_name
      ORDER BY date, time, pitch_code, id
    ) AS rn,
    COUNT(*) OVER (
      PARTITION BY age_group, round, group_name
    ) AS cnt
  FROM matches
  WHERE round = '1차'
)
UPDATE matches AS m
SET
  home_team_no = CASE
    -- 4팀 조 (경기 6개)
    WHEN o.cnt = 6 THEN CASE o.rn
      WHEN 1 THEN 1  -- 1 vs 2
      WHEN 2 THEN 3  -- 3 vs 4
      WHEN 3 THEN 1  -- 1 vs 3
      WHEN 4 THEN 2  -- 2 vs 4
      WHEN 5 THEN 1  -- 1 vs 4
      WHEN 6 THEN 2  -- 2 vs 3
      ELSE NULL
    END
    -- 3팀 조 (경기 3개) - U11 16조 등
    WHEN o.cnt = 3 THEN CASE o.rn
      WHEN 1 THEN 1  -- 1 vs 2
      WHEN 2 THEN 1  -- 1 vs 3
      WHEN 3 THEN 2  -- 2 vs 3
      ELSE NULL
    END
    ELSE NULL
  END,
  away_team_no = CASE
    -- 4팀 조
    WHEN o.cnt = 6 THEN CASE o.rn
      WHEN 1 THEN 2  -- 1 vs 2
      WHEN 2 THEN 4  -- 3 vs 4
      WHEN 3 THEN 3  -- 1 vs 3
      WHEN 4 THEN 4  -- 2 vs 4
      WHEN 5 THEN 4  -- 1 vs 4
      WHEN 6 THEN 3  -- 2 vs 3
      ELSE NULL
    END
    -- 3팀 조
    WHEN o.cnt = 3 THEN CASE o.rn
      WHEN 1 THEN 2  -- 1 vs 2
      WHEN 2 THEN 3  -- 1 vs 3
      WHEN 3 THEN 3  -- 2 vs 3
      ELSE NULL
    END
    ELSE NULL
  END
FROM ordered AS o
WHERE m.id = o.id;

COMMIT;

