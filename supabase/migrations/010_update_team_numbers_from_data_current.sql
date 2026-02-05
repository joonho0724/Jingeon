-- ⚠️ DEV/MAINTENANCE ONLY
-- 이 마이그레이션은 기존 데이터에 대해 팀 번호를 현재 규정에 맞게 수정하기 위한 일회성 스크립트입니다.
-- 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

-- 팀 번호 업데이트 SQL (현재 테이블 구조용)
-- ⚠️ 현재 테이블이 group_name, group_team_no를 사용하는 경우 이 파일을 사용하세요.
-- 마이그레이션 008을 실행한 후에는 010_update_team_numbers_from_data.sql을 사용하세요.
--
-- ⚠️ 중요: Unique constraint 때문에 같은 조 내에서 같은 팀 번호를 가질 수 없습니다.
-- 각 조별로 먼저 팀 번호를 NULL로 초기화한 후, 각 팀 번호별로 하나씩만 업데이트합니다.

BEGIN;

-- ============================================
-- 1단계: 모든 팀 번호 초기화 (NULL로 설정)
-- ============================================
UPDATE teams SET group_team_no = NULL;

-- ============================================
-- 2단계: U11 조별 팀 번호 업데이트 (서브쿼리로 각 번호별로 하나씩만)
-- ============================================

-- U11 조 1
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '1' 
    AND (name = 'K리거강용FC B' OR name = '서울K리거강용FC') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '1' 
    AND (name = '일산JFC U12' OR name = '경기일산JFCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '1' 
    AND (name = '리틀코리아FC U12' OR name = '인천리틀코리아FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '1' 
    AND name = '제주제주서초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 2
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '2' 
    AND (name = '솔트FC U12' OR name = '서울솔트축구클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '2' 
    AND (name = '고양무원FC U12' OR name = '경기고양무원풋볼클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '2' 
    AND (name = '계양구유소년 U12' OR name = '인천계양구유소년U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '2' 
    AND name = '제주대정초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 3
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '3' 
    AND (name = '서귀포FC' OR name = '제주더나이스U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '3' 
    AND (name = '화랑 U12' OR name = '서울화랑U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '3' 
    AND (name = '연세FC U12' OR name = '경기연세FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '3' 
    AND (name = '인유서구 U12' OR name = '인천인유서구U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 4
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '4' 
    AND (name = '관악FC U12' OR name = '서울관악FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '4' 
    AND (name = 'TEAM6 FC' OR name = '경기TEAM6FC') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '4' 
    AND (name = '축구의신 U12' OR name = '인천축구의신U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '4' 
    AND name = '제주제주동초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 5
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '5' 
    AND (name = '제주SK U12' OR name = '제주SKU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '5' 
    AND (name = '월드컵FC U12' OR name = '경기월드컵FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '5' 
    AND (name = '남양산FC U12' OR name = '경남남양산FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '5' 
    AND name = '서울신용산초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 6
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '6' 
    AND (name = '쏘니유소년FC U12' OR name = '제주쏘니유소년축구클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '6' 
    AND (name = '용인대YFC U12' OR name = '경기용인대YFCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '6' 
    AND (name = '보물섬남해SC U12' OR name = '경남보물섬남해스포츠클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '6' 
    AND name = '서울구룡초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 7
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '7' 
    AND (name = '위례FC U12' OR name = '서울위례FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '7' 
    AND (name = '마산합성FC U12' OR name = '경남마산합성풋볼클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '7' 
    AND name = '제주서귀포초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '7' 
    AND name = '서귀포FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 8
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '8' 
    AND (name = '프로FC U12' OR name = '제주프로FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '8' 
    AND (name = '신답FC U12 그린' OR name = '서울신답FCU12그린') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '8' 
    AND (name = 'FCMJ 풋볼아카데미' OR name = '부산FCMJ풋볼아카데미') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '8' 
    AND name = '경기FC진건레드' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 9
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '9' 
    AND (name = '신답FC U12 화이트' OR name = '서울신답FCU12화이트') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '9' 
    AND (name = '안양AFA U12' OR name = '경기안양AFAU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '9' 
    AND (name = '연산SC U12 B' OR name = '부산연산SCU12B') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '9' 
    AND name = '제주외도초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 10
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '10' 
    AND (name = '이천수FC U12' OR name = '제주이천수축구클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '10' 
    AND (name = 'FC구로 U12' OR name = '서울FC구로U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '10' 
    AND (name = '화성시 U12' OR name = '경기화성시U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '10' 
    AND (name = '연산SC U12 A' OR name = '부산연산SCU12A') 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 11
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '11' 
    AND (name = 'LOJE UTD U12' OR name = '제주LOJEUNITEDU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '11' 
    AND (name = '성남시티FC U12' OR name = '경기성남시티FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '11' 
    AND (name = '달성군청유소년 U12 화원' OR name = '대구달성군청유소년축구단U12화원') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '11' 
    AND name = '경기FC진건' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 12
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '12' 
    AND (name = '영등포구SC U12' OR name = '서울영등포구스포츠클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '12' 
    AND (name = 'SSJFC U12' OR name = '경기SSJFCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '12' 
    AND (name = '하이두FC' OR name = '대구하이두축구클럽') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '12' 
    AND name = '제주화북초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 13
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '13' 
    AND (name = 'K리거강용FC A' OR name = '서울K리거강용FCA') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '13' 
    AND (name = '서창FC U12' OR name = '인천서창FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '13' 
    AND (name = '청주CTS U12' OR name = '충북청주CTSU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '13' 
    AND name = '제주중문초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 14
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '14' 
    AND (name = 'AAFC U12' OR name = '서울AAFCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '14' 
    AND (name = '강화SC U12' OR name = '인천강화스포츠클럽U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '14' 
    AND (name = 'JK풋볼 U12' OR name = '광주JK풋볼U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '14' 
    AND name = '서울양강초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 15
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '15' 
    AND (name = '서초MB U12' OR name = '서울서초MB U-12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '15' 
    AND (name = 'YSC U12' OR name = '인천YSCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '15' 
    AND (name = '강릉온리원FC U12' OR name = '강원강릉온리원FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '15' 
    AND name = '서울대동주니어FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U11 조 16
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '16' 
    AND (name = '스포트랙스FC U12' OR name = '경기남양주시스포트랙스FCU12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '16' 
    AND (name = '연수구청 유소년 U12' OR name = '인천연수구청유소년축구단U12') 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U11' AND group_name = '16' 
    AND name = '서울노원FC한마음U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- ============================================
-- 3단계: U12 조별 팀 번호 업데이트 (서브쿼리로 각 번호별로 하나씩만)
-- ============================================

-- U12 조 1
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '1' 
    AND name = '서귀포FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '1' 
    AND name = 'K리거강용FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '1' 
    AND name = '월드컵FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '1' 
    AND name = '리틀코리아FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 2
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '2' 
    AND name = '제주서초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '2' 
    AND name = 'FC구로 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '2' 
    AND name = '김포PNCFC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '2' 
    AND name = '서창FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 3
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '3' 
    AND name = '중문초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '3' 
    AND name = '화랑 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '3' 
    AND name = '양주JUST유소년 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '3' 
    AND name = '축구의신신 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 4
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '4' 
    AND name = '서귀포초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '4' 
    AND name = '관악FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '4' 
    AND name = 'TEAM6 FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '4' 
    AND name = 'YSC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 5
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '5' 
    AND name = '화북초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '5' 
    AND name = '구룡초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '5' 
    AND name = '스포트랙스FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '5' 
    AND name = '인유서구 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 6
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '6' 
    AND name = '외도초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '6' 
    AND name = 'FC한마음 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '6' 
    AND name = '일산JFC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '6' 
    AND name = '남양산FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 7
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '7' 
    AND name = '제주SK U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '7' 
    AND name = '위례FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '7' 
    AND name = '안양AFA U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '7' 
    AND name = '보물섬남해SC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 8
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '8' 
    AND name = 'GOATFC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '8' 
    AND name = '대동주니어FC' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '8' 
    AND name = '화성시 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '8' 
    AND name = '마산합성FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 9
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '9' 
    AND name = '제주동초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '9' 
    AND name = '마포스포츠클럽 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '9' 
    AND name = '성남시티FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '9' 
    AND name = '달성군청유소년 U12 화원' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 10
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '10' 
    AND name = '프로FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '10' 
    AND name = 'AAFC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '10' 
    AND name = 'SSJFC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '10' 
    AND name = '하이두FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 11
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '11' 
    AND name = 'LOJE UTD U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '11' 
    AND name = '서강초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '11' 
    AND name = 'FC진건' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '11' 
    AND name = 'FCMJ 풋볼아카데미' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 12
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '12' 
    AND name = '바모스FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '12' 
    AND name = '대동초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '12' 
    AND name = '진건초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '12' 
    AND name = '연산SC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 13
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '13' 
    AND name = '대정초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '13' 
    AND name = '신답FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '13' 
    AND name = '고양무원FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '13' 
    AND name = '화정초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 14
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '14' 
    AND name = '영등포구SC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '14' 
    AND name = '서초MB U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '14' 
    AND name = '강화SC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '14' 
    AND name = '강릉온리원FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 15
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '15' 
    AND name = '신용산초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '15' 
    AND name = '솔트FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '15' 
    AND name = '연수구청 유소년 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '15' 
    AND name = 'JK풋볼 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- U12 조 16
UPDATE teams SET group_team_no = 1 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '16' 
    AND name = '양강초' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 2 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '16' 
    AND name = '연세FC U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 3 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '16' 
    AND name = '계양구유소년 U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

UPDATE teams SET group_team_no = 4 
WHERE id = (
  SELECT id FROM teams 
  WHERE age_group = 'U12' AND group_name = '16' 
    AND name = '청주CTS U12' 
    AND group_team_no IS NULL 
  LIMIT 1
);

-- ============================================
-- 업데이트 결과 확인
-- ============================================
-- 다음 쿼리로 업데이트 결과를 확인할 수 있습니다:
-- 
-- SELECT 
--   name,
--   age_group,
--   group_name,
--   group_team_no
-- FROM teams
-- WHERE group_team_no IS NOT NULL
-- ORDER BY age_group, group_name, group_team_no;

-- 트랜잭션 롤백 (변경사항 취소)
ROLLBACK;

-- 만약 변경사항을 확정하려면 아래 주석을 해제하고 ROLLBACK을 주석 처리하세요:
-- COMMIT;
