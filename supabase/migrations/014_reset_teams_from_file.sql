-- ⚠️ DEV/MAINTENANCE ONLY
-- team-names.txt 기반으로 teams를 보정하기 위한 실험/정리용 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

BEGIN;
-- ============================================
-- teams 테이블 초기화 및 재구성
-- 생성일: 2026-02-05T06:21:41.339Z
-- team-names.txt 파일 기준
-- ============================================

-- ============================================
-- 1. 기존 U11, U12 팀 삭제
-- ============================================
-- 주의: 이 작업은 기존 팀 데이터를 모두 삭제합니다.
-- 경기 데이터(matches)와의 외래키 관계로 인해
-- 먼저 matches 테이블의 해당 팀 참조를 처리해야 할 수 있습니다.

-- 옵션 1: CASCADE 삭제 (경기 데이터도 함께 삭제)
-- DELETE FROM teams WHERE age_group IN ('U11', 'U12');

-- 옵션 2: 경기 데이터 보존 (권장)
-- 먼저 matches 테이블의 home_team_id, away_team_id를 NULL로 설정하거나
-- 새로운 팀 ID로 업데이트해야 합니다.

-- 여기서는 경기 데이터를 보존하기 위해
-- 기존 팀을 삭제하지 않고, 새로운 팀만 추가하는 방식으로 진행합니다.
-- (또는 기존 팀을 업데이트하는 방식)

-- 기존 팀 삭제 (경기 데이터 확인 후 실행)
-- DELETE FROM teams WHERE age_group IN ('U11', 'U12');

-- ============================================
-- 2. U11 팀 삽입
-- ============================================

-- 1조 1번: 제주서초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주서초',
  'U11',
  '1',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 2번: K리거강용FC B
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'K리거강용FC B',
  'U11',
  '1',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 3번: 일산JFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '일산JFC U12',
  'U11',
  '1',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 4번: 리틀코리아FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '리틀코리아FC U12',
  'U11',
  '1',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 1번: 대정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대정초',
  'U11',
  '2',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 2번: 솔트FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '솔트FC U12',
  'U11',
  '2',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 3번: 고양무원FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '고양무원FC U12',
  'U11',
  '2',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 4번: 계양구유소년 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '계양구유소년 U12',
  'U11',
  '2',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 1번: 서귀포FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서귀포FC',
  'U11',
  '3',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 2번: 화랑 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화랑 U12',
  'U11',
  '3',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 3번: 연세FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연세FC U12',
  'U11',
  '3',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 4번: 인유서구 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인유서구 U12',
  'U11',
  '3',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 1번: 제주동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주동초',
  'U11',
  '4',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 2번: 관악FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '관악FC U12',
  'U11',
  '4',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 3번: TEAM6 FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'TEAM6 FC',
  'U11',
  '4',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 4번: 축구의신 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '축구의신 U12',
  'U11',
  '4',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 1번: 제주SK U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주SK U12',
  'U11',
  '5',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 2번: 신용산초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '신용산초',
  'U11',
  '5',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 3번: 월드컵FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '월드컵FC U12',
  'U11',
  '5',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 4번: 남양산FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '남양산FC U12',
  'U11',
  '5',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 1번: 쏘니유소년FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '쏘니유소년FC U12',
  'U11',
  '6',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 2번: 구룡초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '구룡초',
  'U11',
  '6',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 3번: 용인대YFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '용인대YFC U12',
  'U11',
  '6',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 4번: 보물섬남해SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '보물섬남해SC U12',
  'U11',
  '6',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 1번: 서귀포초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서귀포초',
  'U11',
  '7',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 2번: 위례FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '위례FC U12',
  'U11',
  '7',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 3번: FC진건블루
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC진건블루',
  'U11',
  '7',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 4번: 마산합성FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '마산합성FC U12',
  'U11',
  '7',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 1번: 프로FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '프로FC U12',
  'U11',
  '8',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 2번: 신답FC U12 그린
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '신답FC U12 그린',
  'U11',
  '8',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 3번: FC진건레드
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC진건레드',
  'U11',
  '8',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 4번: FCMJ 풋볼아카데미
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FCMJ 풋볼아카데미',
  'U11',
  '8',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 1번: 외도초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '외도초',
  'U11',
  '9',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 2번: 신답FC U12 화이트
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '신답FC U12 화이트',
  'U11',
  '9',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 3번: 안양AFA U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '안양AFA U12',
  'U11',
  '9',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 4번: 연산SC U12 B
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연산SC U12 B',
  'U11',
  '9',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 1번: 이천수FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '이천수FC U12',
  'U11',
  '10',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 2번: FC구로 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC구로 U12',
  'U11',
  '10',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 3번: 화성시 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화성시 U12',
  'U11',
  '10',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 4번: 연산SC U12 A
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연산SC U12 A',
  'U11',
  '10',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 1번: LOJE UTD U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'LOJE UTD U12',
  'U11',
  '11',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 2번: 서강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서강초',
  'U11',
  '11',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 3번: 성남시티FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '성남시티FC U12',
  'U11',
  '11',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 4번: 달성군청유소년 U12 화원
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '달성군청유소년 U12 화원',
  'U11',
  '11',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 1번: 화북초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화북초',
  'U11',
  '12',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 2번: 영등포구SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '영등포구SC U12',
  'U11',
  '12',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 3번: SSJFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'SSJFC U12',
  'U11',
  '12',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 4번: 하이두FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '하이두FC',
  'U11',
  '12',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 1번: 중문초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '중문초',
  'U11',
  '13',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 2번: K리거강용FC A
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'K리거강용FC A',
  'U11',
  '13',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 3번: 서창FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서창FC U12',
  'U11',
  '13',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 4번: 청주CTS U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '청주CTS U12',
  'U11',
  '13',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 1번: 양강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '양강초',
  'U11',
  '14',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 2번: AAFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'AAFC U12',
  'U11',
  '14',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 3번: 강화SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강화SC U12',
  'U11',
  '14',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 4번: JK풋볼 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'JK풋볼 U12',
  'U11',
  '14',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 1번: 대동주니어FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대동주니어FC',
  'U11',
  '15',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 2번: 서초MB U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서초MB U12',
  'U11',
  '15',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 3번: YSC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'YSC U12',
  'U11',
  '15',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 4번: 강릉온리원FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강릉온리원FC U12',
  'U11',
  '15',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 1번: FC한마음
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC한마음',
  'U11',
  '16',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 2번: 스포트랙스FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '스포트랙스FC U12',
  'U11',
  '16',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 3번: 연수구청 유소년 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연수구청 유소년 U12',
  'U11',
  '16',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. U12 팀 삽입
-- ============================================

-- 1조 1번: 서귀포FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서귀포FC',
  'U12',
  '1',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 2번: K리거강용FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'K리거강용FC',
  'U12',
  '1',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 3번: 월드컵FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '월드컵FC U12',
  'U12',
  '1',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 1조 4번: 리틀코리아FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '리틀코리아FC U12',
  'U12',
  '1',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 1번: 제주서초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주서초',
  'U12',
  '2',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 2번: FC구로 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC구로 U12',
  'U12',
  '2',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 3번: 김포PNCFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '김포PNCFC U12',
  'U12',
  '2',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2조 4번: 서창FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서창FC U12',
  'U12',
  '2',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 1번: 중문초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '중문초',
  'U12',
  '3',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 2번: 화랑 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화랑 U12',
  'U12',
  '3',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 3번: 양주JUST유소년 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '양주JUST유소년 U12',
  'U12',
  '3',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3조 4번: 축구의신신 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '축구의신신 U12',
  'U12',
  '3',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 1번: 서귀포초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서귀포초',
  'U12',
  '4',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 2번: 관악FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '관악FC U12',
  'U12',
  '4',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 3번: TEAM6 FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'TEAM6 FC',
  'U12',
  '4',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 4조 4번: YSC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'YSC U12',
  'U12',
  '4',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 1번: 화북초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화북초',
  'U12',
  '5',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 2번: 구룡초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '구룡초',
  'U12',
  '5',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 3번: 스포트랙스FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '스포트랙스FC U12',
  'U12',
  '5',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 5조 4번: 인유서구 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인유서구 U12',
  'U12',
  '5',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 1번: 외도초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '외도초',
  'U12',
  '6',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 2번: FC한마음 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC한마음 U12',
  'U12',
  '6',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 3번: 일산JFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '일산JFC U12',
  'U12',
  '6',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 6조 4번: 남양산FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '남양산FC U12',
  'U12',
  '6',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 1번: 제주SK U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주SK U12',
  'U12',
  '7',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 2번: 위례FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '위례FC U12',
  'U12',
  '7',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 3번: 안양AFA U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '안양AFA U12',
  'U12',
  '7',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 7조 4번: 보물섬남해SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '보물섬남해SC U12',
  'U12',
  '7',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 1번: GOATFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'GOATFC U12',
  'U12',
  '8',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 2번: 대동주니어FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대동주니어FC',
  'U12',
  '8',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 3번: 화성시 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화성시 U12',
  'U12',
  '8',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 8조 4번: 마산합성FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '마산합성FC U12',
  'U12',
  '8',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 1번: 제주동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주동초',
  'U12',
  '9',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 2번: 마포스포츠클럽 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '마포스포츠클럽 U12',
  'U12',
  '9',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 3번: 성남시티FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '성남시티FC U12',
  'U12',
  '9',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 9조 4번: 달성군청유소년 U12 화원
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '달성군청유소년 U12 화원',
  'U12',
  '9',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 1번: 프로FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '프로FC U12',
  'U12',
  '10',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 2번: AAFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'AAFC U12',
  'U12',
  '10',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 3번: SSJFC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'SSJFC U12',
  'U12',
  '10',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 10조 4번: 하이두FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '하이두FC U12',
  'U12',
  '10',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 1번: LOJE UTD U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'LOJE UTD U12',
  'U12',
  '11',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 2번: 서강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서강초',
  'U12',
  '11',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 3번: FC진건
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FC진건',
  'U12',
  '11',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 11조 4번: FCMJ 풋볼아카데미
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'FCMJ 풋볼아카데미',
  'U12',
  '11',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 1번: 바모스FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '바모스FC U12',
  'U12',
  '12',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 2번: 대동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대동초',
  'U12',
  '12',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 3번: 진건초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '진건초',
  'U12',
  '12',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 12조 4번: 연산SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연산SC U12',
  'U12',
  '12',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 1번: 대정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대정초',
  'U12',
  '13',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 2번: 신답FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '신답FC U12',
  'U12',
  '13',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 3번: 고양무원FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '고양무원FC U12',
  'U12',
  '13',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 13조 4번: 화정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '화정초',
  'U12',
  '13',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 1번: 영등포구SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '영등포구SC U12',
  'U12',
  '14',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 2번: 서초MB U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서초MB U12',
  'U12',
  '14',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 3번: 강화SC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강화SC U12',
  'U12',
  '14',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 14조 4번: 강릉온리원FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강릉온리원FC U12',
  'U12',
  '14',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 1번: 신용산초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '신용산초',
  'U12',
  '15',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 2번: 솔트FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '솔트FC U12',
  'U12',
  '15',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 3번: 연수구청 유소년 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연수구청 유소년 U12',
  'U12',
  '15',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 15조 4번: JK풋볼 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  'JK풋볼 U12',
  'U12',
  '15',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 1번: 양강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '양강초',
  'U12',
  '16',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 2번: 연세FC U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '연세FC U12',
  'U12',
  '16',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 3번: 계양구유소년 U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '계양구유소년 U12',
  'U12',
  '16',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 16조 4번: 청주CTS U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '청주CTS U12',
  'U12',
  '16',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING

COMMIT;
-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용

-- ============================================
-- 확인 쿼리
-- ============================================
-- SELECT age_group, COUNT(*) as count FROM teams WHERE age_group IN ('U11', 'U12') GROUP BY age_group;
-- SELECT age_group, group_name1, COUNT(*) as count FROM teams WHERE age_group IN ('U11', 'U12') GROUP BY age_group, group_name1 ORDER BY age_group, group_name1;