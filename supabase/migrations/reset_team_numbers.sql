-- ⚠️ DEV/MAINTENANCE ONLY
-- 이 스크립트는 모든 팀 번호를 NULL로 초기화하기 위한 디버깅/정리용입니다.
-- 운영 환경이나 새 데이터베이스에서는 실행하지 마세요.

-- 모든 팀 번호를 NULL로 초기화하는 SQL
-- ⚠️ 주의: 이 SQL은 모든 팀의 group_team_no를 NULL로 설정합니다.

BEGIN;

-- 모든 팀 번호 초기화
UPDATE teams SET group_team_no = NULL;

-- 확인 쿼리 (실행 전에 확인)
-- SELECT 
--   name,
--   age_group,
--   group_name,
--   group_team_no
-- FROM teams
-- WHERE group_team_no IS NOT NULL
-- ORDER BY age_group, group_name, group_team_no;

-- 변경사항 확인 후 COMMIT 또는 ROLLBACK
-- COMMIT;  -- 변경사항 확정
-- ROLLBACK;  -- 변경사항 취소
