-- ⚠️ DEV/MAINTENANCE ONLY
-- team-names.txt를 기반으로 teams를 완전히 초기화/재구성하기 위한 일회성 스크립트입니다.
-- 운영 환경에서 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

BEGIN;
-- ============================================
-- teams 테이블 완전 초기화 및 재구성
-- 생성일: 2026-02-05T06:43:12.170Z
-- team-names.txt 파일 기준
-- ============================================

-- ⚠️  주의: 이 SQL은 기존 U11, U12 팀을 모두 삭제합니다.
-- 경기 데이터(matches)와의 외래키 관계를 고려하여
-- 먼저 matches 테이블의 참조를 처리해야 합니다.

-- ============================================
-- 1단계: 기존 U11, U12 팀 삭제
-- ============================================
-- 옵션 A: CASCADE 삭제 (경기 데이터도 함께 삭제)
-- DELETE FROM teams WHERE age_group IN ('U11', 'U12');

-- 옵션 B: 경기 데이터 보존 (권장)
-- 먼저 matches 테이블의 home_team_id, away_team_id를 NULL로 설정
UPDATE matches SET home_team_id = NULL WHERE home_team_id IN (SELECT id FROM teams WHERE age_group IN ('U11', 'U12'));
UPDATE matches SET away_team_id = NULL WHERE away_team_id IN (SELECT id FROM teams WHERE age_group IN ('U11', 'U12'));

-- fair_play_points 테이블의 team_id도 NULL로 설정
UPDATE fair_play_points SET team_id = NULL WHERE team_id IN (SELECT id FROM teams WHERE age_group IN ('U11', 'U12'));

-- 이제 기존 팀 삭제
DELETE FROM teams WHERE age_group IN ('U11', 'U12');

-- ============================================
-- 2단계: U11 팀 삽입
-- ============================================

-- 1조 1번: 제주제주서초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주제주서초',
  'U11',
  '1',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 2번: 서울K리거강용FCB
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울K리거강용FCB',
  'U11',
  '1',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 3번: 경기일산JFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기일산JFCU12',
  'U11',
  '1',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 4번: 인천리틀코리아FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천리틀코리아FCU12',
  'U11',
  '1',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 1번: 제주대정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주대정초',
  'U11',
  '2',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 2번: 서울솔트축구클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울솔트축구클럽U12',
  'U11',
  '2',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 3번: 경기고양무원풋볼클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기고양무원풋볼클럽U12',
  'U11',
  '2',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 4번: 인천계양구유소년U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천계양구유소년U12',
  'U11',
  '2',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 1번: 제주더나이스U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주더나이스U12',
  'U11',
  '3',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 2번: 서울화랑U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울화랑U12',
  'U11',
  '3',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 3번: 경기연세FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기연세FCU12',
  'U11',
  '3',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 4번: 인천인유서구U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천인유서구U12',
  'U11',
  '3',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 1번: 제주제주동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주제주동초',
  'U11',
  '4',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 2번: 서울관악FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울관악FCU12',
  'U11',
  '4',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 3번: 경기TEAM6FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기TEAM6FC',
  'U11',
  '4',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 4번: 인천축구의신U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천축구의신U12',
  'U11',
  '4',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 1번: 제주SKU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주SKU12',
  'U11',
  '5',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 2번: 서울신용산초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울신용산초',
  'U11',
  '5',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 3번: 경기월드컵FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기월드컵FCU12',
  'U11',
  '5',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 4번: 경남남양산FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남남양산FCU12',
  'U11',
  '5',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 1번: 제주쏘니유소년축구클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주쏘니유소년축구클럽U12',
  'U11',
  '6',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 2번: 서울구룡초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울구룡초',
  'U11',
  '6',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 3번: 경기용인대YFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기용인대YFCU12',
  'U11',
  '6',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 4번: 경남보물섬남해스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남보물섬남해스포츠클럽U12',
  'U11',
  '6',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 1번: 제주서귀포초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주서귀포초',
  'U11',
  '7',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 2번: 서울위례FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울위례FCU12',
  'U11',
  '7',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 3번: 경기FC진건블루
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기FC진건블루',
  'U11',
  '7',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 4번: 경남마산합성풋볼클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남마산합성풋볼클럽U12',
  'U11',
  '7',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 1번: 제주프로FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주프로FCU12',
  'U11',
  '8',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 2번: 서울신답FCU12그린
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울신답FCU12그린',
  'U11',
  '8',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 3번: 경기FC진건레드
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기FC진건레드',
  'U11',
  '8',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 4번: 부산FCMJ풋볼아카데미
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '부산FCMJ풋볼아카데미',
  'U11',
  '8',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 1번: 제주외도초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주외도초',
  'U11',
  '9',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 2번: 서울신답FCU12화이트
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울신답FCU12화이트',
  'U11',
  '9',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 3번: 경기안양AFAU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기안양AFAU12',
  'U11',
  '9',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 4번: 부산연산SCU12B
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '부산연산SCU12B',
  'U11',
  '9',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 1번: 제주이천수축구클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주이천수축구클럽U12',
  'U11',
  '10',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 2번: 서울FC구로U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울FC구로U12',
  'U11',
  '10',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 3번: 경기화성시U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기화성시U12',
  'U11',
  '10',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 4번: 부산연산SCU12A
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '부산연산SCU12A',
  'U11',
  '10',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 1번: 제주LOJEUNITEDU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주LOJEUNITEDU12',
  'U11',
  '11',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 2번: 서울서강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울서강초',
  'U11',
  '11',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 3번: 경기성남시티FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기성남시티FCU12',
  'U11',
  '11',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 4번: 대구달성군청유소년축구단U12화원
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대구달성군청유소년축구단U12화원',
  'U11',
  '11',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 1번: 제주화북초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주화북초',
  'U11',
  '12',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 2번: 서울영등포구스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울영등포구스포츠클럽U12',
  'U11',
  '12',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 3번: 경기SSJFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기SSJFCU12',
  'U11',
  '12',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 4번: 대구하이두축구클럽
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대구하이두축구클럽',
  'U11',
  '12',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 1번: 제주중문초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주중문초',
  'U11',
  '13',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 2번: 서울K리거강용FCA
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울K리거강용FCA',
  'U11',
  '13',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 3번: 인천서창FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천서창FCU12',
  'U11',
  '13',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 4번: 충북청주CTSU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '충북청주CTSU12',
  'U11',
  '13',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 1번: 서울양강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울양강초',
  'U11',
  '14',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 2번: 서울AAFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울AAFCU12',
  'U11',
  '14',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 3번: 인천강화스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천강화스포츠클럽U12',
  'U11',
  '14',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 4번: 광주JK풋볼U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '광주JK풋볼U12',
  'U11',
  '14',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 1번: 서울대동주니어FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울대동주니어FC',
  'U11',
  '15',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 2번: 서울서초MB U-12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울서초MB U-12',
  'U11',
  '15',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 3번: 인천YSCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천YSCU12',
  'U11',
  '15',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 4번: 강원강릉온리원FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강원강릉온리원FCU12',
  'U11',
  '15',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 1번: 서울노원FC한마음U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울노원FC한마음U12',
  'U11',
  '16',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 2번: 경기남양주시스포트랙스FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기남양주시스포트랙스FCU12',
  'U11',
  '16',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 3번: 인천연수구청유소년축구단U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천연수구청유소년축구단U12',
  'U11',
  '16',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- ============================================
-- 3단계: U12 팀 삽입
-- ============================================

-- 1조 1번: 제주더나이스U12제주더나이스U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주더나이스U12제주더나이스U12',
  'U12',
  '1',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 2번: 서울K리거강용FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울K리거강용FC',
  'U12',
  '1',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 3번: 경기월드컵FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기월드컵FCU12',
  'U12',
  '1',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 1조 4번: 인천리틀코리아FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천리틀코리아FCU12',
  'U12',
  '1',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 1번: 제주제주서초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주제주서초',
  'U12',
  '2',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 2번: 서울FC구로U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울FC구로U12',
  'U12',
  '2',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 3번: 경기김포PNCFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기김포PNCFCU12',
  'U12',
  '2',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 2조 4번: 인천서창FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천서창FCU12',
  'U12',
  '2',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 1번: 제주중문초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주중문초',
  'U12',
  '3',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 2번: 서울화랑U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울화랑U12',
  'U12',
  '3',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 3번: 경기양주JUST유소년U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기양주JUST유소년U12',
  'U12',
  '3',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 3조 4번: 인천축구의신U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천축구의신U12',
  'U12',
  '3',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 1번: 제주서귀포초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주서귀포초',
  'U12',
  '4',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 2번: 서울관악FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울관악FCU12',
  'U12',
  '4',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 3번: 경기TEAM6FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기TEAM6FC',
  'U12',
  '4',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 4조 4번: 인천YSCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천YSCU12',
  'U12',
  '4',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 1번: 제주화북초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주화북초',
  'U12',
  '5',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 2번: 서울구룡초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울구룡초',
  'U12',
  '5',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 3번: 경기남양주시스포트랙스FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기남양주시스포트랙스FCU12',
  'U12',
  '5',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 5조 4번: 인천인유서구U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천인유서구U12',
  'U12',
  '5',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 1번: 제주외도초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주외도초',
  'U12',
  '6',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 2번: 서울노원FC한마음U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울노원FC한마음U12',
  'U12',
  '6',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 3번: 경기일산JFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기일산JFCU12',
  'U12',
  '6',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 6조 4번: 경남남양산FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남남양산FCU12',
  'U12',
  '6',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 1번: 제주SKU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주SKU12',
  'U12',
  '7',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 2번: 서울위례FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울위례FCU12',
  'U12',
  '7',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 3번: 경기안양AFAU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기안양AFAU12',
  'U12',
  '7',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 7조 4번: 경남보물섬남해스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남보물섬남해스포츠클럽U12',
  'U12',
  '7',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 1번: 제주GOATFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주GOATFCU12',
  'U12',
  '8',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 2번: 서울대동주니어FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울대동주니어FC',
  'U12',
  '8',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 3번: 경기화성시U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기화성시U12',
  'U12',
  '8',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 8조 4번: 경남마산합성풋볼클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경남마산합성풋볼클럽U12',
  'U12',
  '8',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 1번: 제주제주동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주제주동초',
  'U12',
  '9',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 2번: 서울마포스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울마포스포츠클럽U12',
  'U12',
  '9',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 3번: 경기성남시티FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기성남시티FCU12',
  'U12',
  '9',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 9조 4번: 대구달성군청유소년축구단U12화원
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대구달성군청유소년축구단U12화원',
  'U12',
  '9',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 1번: 제주프로FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주프로FCU12',
  'U12',
  '10',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 2번: 서울AAFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울AAFCU12',
  'U12',
  '10',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 3번: 경기SSJFCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기SSJFCU12',
  'U12',
  '10',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 10조 4번: 대구하이두축구클럽
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대구하이두축구클럽',
  'U12',
  '10',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 1번: 제주LOJEUNITEDU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주LOJEUNITEDU12',
  'U12',
  '11',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 2번: 서울서강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울서강초',
  'U12',
  '11',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 3번: 경기FC진건
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기FC진건',
  'U12',
  '11',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 11조 4번: 부산FCMJ풋볼아카데미
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '부산FCMJ풋볼아카데미',
  'U12',
  '11',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 1번: 제주바모스FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주바모스FCU12',
  'U12',
  '12',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 2번: 서울대동초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울대동초',
  'U12',
  '12',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 3번: 경기진건초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기진건초',
  'U12',
  '12',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 12조 4번: 부산연산SCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '부산연산SCU12',
  'U12',
  '12',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 1번: 제주대정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '제주대정초',
  'U12',
  '13',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 2번: 서울신답FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울신답FCU12',
  'U12',
  '13',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 3번: 경기고양무원풋볼클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기고양무원풋볼클럽U12',
  'U12',
  '13',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 13조 4번: 대전화정초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '대전화정초',
  'U12',
  '13',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 1번: 서울영등포구스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울영등포구스포츠클럽U12',
  'U12',
  '14',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 2번: 서울서초MB U-12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울서초MB U-12',
  'U12',
  '14',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 3번: 인천강화스포츠클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천강화스포츠클럽U12',
  'U12',
  '14',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 14조 4번: 강원강릉온리원FCU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '강원강릉온리원FCU12',
  'U12',
  '14',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 1번: 서울신용산초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울신용산초',
  'U12',
  '15',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 2번: 서울솔트축구클럽U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울솔트축구클럽U12',
  'U12',
  '15',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 3번: 인천연수구청유소년축구단U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천연수구청유소년축구단U12',
  'U12',
  '15',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 15조 4번: 광주JK풋볼U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '광주JK풋볼U12',
  'U12',
  '15',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 1번: 서울양강초
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '서울양강초',
  'U12',
  '16',
  1,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 2번: 경기연세FC
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '경기연세FC',
  'U12',
  '16',
  2,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 3번: 인천계양구유소년U12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '인천계양구유소년U12',
  'U12',
  '16',
  3,
  NULL,
  NULL,
  NOW(),
  NOW()
)
;

-- 16조 4번: 충북청주CTSU12
INSERT INTO teams (name, age_group, group_name1, group_team_no1, group_name2, registration_no, created_at, updated_at)
VALUES (
  '충북청주CTSU12',
  'U12',
  '16',
  4,
  NULL,
  NULL,
  NOW(),
  NOW()
)

COMMIT;
-- 롤백하려면 위의 COMMIT; 대신 ROLLBACK; 사용

-- ============================================
-- 확인 쿼리
-- ============================================
-- SELECT age_group, COUNT(*) as count FROM teams WHERE age_group IN ('U11', 'U12') GROUP BY age_group;
-- SELECT age_group, group_name1, COUNT(*) as count FROM teams WHERE age_group IN ('U11', 'U12') GROUP BY age_group, group_name1 ORDER BY age_group, group_name1;
-- SELECT * FROM teams WHERE age_group IN ('U11', 'U12') ORDER BY age_group, group_name1, group_team_no1;