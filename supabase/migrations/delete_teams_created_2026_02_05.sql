-- ⚠️ DEV/MAINTENANCE ONLY
-- 특정 날짜(2026-02-05)에 생성된 teams 행을 정리하기 위한 일회성 스크립트입니다.
-- 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

-- created_at이 2026-02-05인 팀들을 모두 삭제하는 SQL
-- ⚠️ 주의: 이 SQL은 해당 날짜에 생성된 모든 팀을 영구적으로 삭제합니다.
-- ⚠️ matches 테이블에서 이 팀들을 참조하는 경기가 있다면 외래 키 제약조건 오류가 발생할 수 있습니다.

BEGIN;

-- ============================================
-- 1단계: 삭제할 팀 확인 (실행 전에 반드시 확인!)
-- ============================================
SELECT 
  id,
  name,
  age_group,
  group_name,
  group_team_no,
  created_at
FROM teams
WHERE DATE(created_at) = '2026-02-05'
ORDER BY created_at, name;

-- ============================================
-- 2단계: 해당 팀을 참조하는 경기 확인 (선택사항)
-- ============================================
-- 만약 matches 테이블에서 이 팀들을 참조하는 경기가 있다면 먼저 확인하세요:
-- 
-- SELECT 
--   m.id as match_id,
--   m.date,
--   m.time,
--   ht.name as home_team,
--   at.name as away_team
-- FROM matches m
-- LEFT JOIN teams ht ON m.home_team_id = ht.id
-- LEFT JOIN teams at ON m.away_team_id = at.id
-- WHERE DATE(ht.created_at) = '2026-02-05' 
--    OR DATE(at.created_at) = '2026-02-05';

-- ============================================
-- 3단계: 팀 삭제
-- ============================================
DELETE FROM teams
WHERE DATE(created_at) = '2026-02-05';

-- ============================================
-- 4단계: 삭제 결과 확인
-- ============================================
-- 삭제 후 확인 (결과가 0개여야 함)
SELECT COUNT(*) as remaining_teams_created_2026_02_05
FROM teams
WHERE DATE(created_at) = '2026-02-05';

-- ============================================
-- 트랜잭션 커밋 또는 롤백
-- ============================================
-- 확인 후 문제 없으면:
COMMIT;

-- 문제가 있으면:
-- ROLLBACK;
