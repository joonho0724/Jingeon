-- ⚠️ DEV/MAINTENANCE ONLY
-- 이 마이그레이션은 특정 시점의 데이터에 맞춰 팀 번호를 수정하기 위한 일회성 스크립트입니다.
-- 새 데이터베이스를 만들 때 다시 실행하면 안 됩니다.

-- 팀 번호 업데이트 SQL
-- ⚠️ 주의: 이 SQL을 실행하기 전에 먼저 008_update_teams_group_structure.sql 마이그레이션을 실행해야 합니다.
-- 
-- 만약 아직 마이그레이션을 실행하지 않았다면:
-- 1. 먼저 008_update_teams_group_structure.sql 실행
-- 2. 그 다음 이 파일 실행
--
-- 또는 현재 테이블 구조가 group_name을 사용한다면, 아래 SQL에서 group_name1을 group_name으로 변경하세요.

-- ============================================
-- U11 조별 팀 번호 업데이트
-- ============================================

-- U11 조 1
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'K리거강용FC B' OR name = '서울K리거강용FC' THEN 1
  WHEN name = '일산JFC U12' OR name = '경기일산JFCU12' THEN 2
  WHEN name = '리틀코리아FC U12' OR name = '인천리틀코리아FCU12' THEN 3
  WHEN name = '제주제주서초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '1'
  AND (name IN ('K리거강용FC B', '서울K리거강용FC', '일산JFC U12', '경기일산JFCU12', '리틀코리아FC U12', '인천리틀코리아FCU12', '제주제주서초'));

-- U11 조 2
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '솔트FC U12' OR name = '서울솔트축구클럽U12' THEN 1
  WHEN name = '고양무원FC U12' OR name = '경기고양무원풋볼클럽U12' THEN 2
  WHEN name = '계양구유소년 U12' OR name = '인천계양구유소년U12' THEN 3
  WHEN name = '제주대정초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '2'
  AND (name IN ('솔트FC U12', '서울솔트축구클럽U12', '고양무원FC U12', '경기고양무원풋볼클럽U12', '계양구유소년 U12', '인천계양구유소년U12', '제주대정초', '경기김포PNCFCU12'));

-- U11 조 3
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '서귀포FC' OR name = '제주더나이스U12' THEN 1
  WHEN name = '화랑 U12' OR name = '서울화랑U12' THEN 2
  WHEN name = '연세FC U12' OR name = '경기연세FCU12' THEN 3
  WHEN name = '인유서구 U12' OR name = '인천인유서구U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '3'
  AND (name IN ('서귀포FC', '제주더나이스U12', '화랑 U12', '서울화랑U12', '연세FC U12', '경기연세FCU12', '인유서구 U12', '인천인유서구U12', '경기양주JUST유소년U12'));

-- U11 조 4
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '관악FC U12' OR name = '서울관악FCU12' THEN 1
  WHEN name = 'TEAM6 FC' OR name = '경기TEAM6FC' THEN 2
  WHEN name = '축구의신 U12' OR name = '인천축구의신U12' THEN 3
  WHEN name = '제주제주동초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '4'
  AND (name IN ('관악FC U12', '서울관악FCU12', 'TEAM6 FC', '경기TEAM6FC', '축구의신 U12', '인천축구의신U12', '제주제주동초'));

-- U11 조 5
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '제주SK U12' OR name = '제주SKU12' THEN 1
  WHEN name = '월드컵FC U12' OR name = '경기월드컵FCU12' THEN 2
  WHEN name = '남양산FC U12' OR name = '경남남양산FCU12' THEN 3
  WHEN name = '서울신용산초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '5'
  AND (name IN ('제주SK U12', '제주SKU12', '월드컵FC U12', '경기월드컵FCU12', '남양산FC U12', '경남남양산FCU12', '서울신용산초'));

-- U11 조 6
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '쏘니유소년FC U12' OR name = '제주쏘니유소년축구클럽U12' THEN 1
  WHEN name = '용인대YFC U12' OR name = '경기용인대YFCU12' THEN 2
  WHEN name = '보물섬남해SC U12' OR name = '경남보물섬남해스포츠클럽U12' THEN 3
  WHEN name = '서울구룡초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '6'
  AND (name IN ('쏘니유소년FC U12', '제주쏘니유소년축구클럽U12', '용인대YFC U12', '경기용인대YFCU12', '보물섬남해SC U12', '경남보물섬남해스포츠클럽U12', '서울구룡초'));

-- U11 조 7
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '위례FC U12' OR name = '서울위례FCU12' THEN 1
  WHEN name = '마산합성FC U12' OR name = '경남마산합성풋볼클럽U12' THEN 2
  WHEN name = '제주서귀포초' THEN 3
  WHEN name = '서귀포FC' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '7'
  AND (name IN ('위례FC U12', '서울위례FCU12', '마산합성FC U12', '경남마산합성풋볼클럽U12', '제주서귀포초', '서귀포FC'));

-- U11 조 8
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '프로FC U12' OR name = '제주프로FCU12' THEN 1
  WHEN name = '신답FC U12 그린' OR name = '서울신답FCU12그린' THEN 2
  WHEN name = 'FCMJ 풋볼아카데미' OR name = '부산FCMJ풋볼아카데미' THEN 3
  WHEN name = '경기FC진건레드' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '8'
  AND (name IN ('프로FC U12', '제주프로FCU12', '신답FC U12 그린', '서울신답FCU12그린', 'FCMJ 풋볼아카데미', '부산FCMJ풋볼아카데미', '경기FC진건레드', '제주GOATFCU12'));

-- U11 조 9
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '신답FC U12 화이트' OR name = '서울신답FCU12화이트' THEN 1
  WHEN name = '안양AFA U12' OR name = '경기안양AFAU12' THEN 2
  WHEN name = '연산SC U12 B' OR name = '부산연산SCU12B' THEN 3
  WHEN name = '제주외도초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '9'
  AND (name IN ('신답FC U12 화이트', '서울신답FCU12화이트', '안양AFA U12', '경기안양AFAU12', '연산SC U12 B', '부산연산SCU12B', '제주외도초', '서울마포스포츠클럽U12'));

-- U11 조 10
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '이천수FC U12' OR name = '제주이천수축구클럽U12' THEN 1
  WHEN name = 'FC구로 U12' OR name = '서울FC구로U12' THEN 2
  WHEN name = '화성시 U12' OR name = '경기화성시U12' THEN 3
  WHEN name = '연산SC U12 A' OR name = '부산연산SCU12A' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '10'
  AND (name IN ('이천수FC U12', '제주이천수축구클럽U12', 'FC구로 U12', '서울FC구로U12', '화성시 U12', '경기화성시U12', '연산SC U12 A', '부산연산SCU12A'));

-- U11 조 11
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'LOJE UTD U12' OR name = '제주LOJEUNITEDU12' THEN 1
  WHEN name = '성남시티FC U12' OR name = '경기성남시티FCU12' THEN 2
  WHEN name = '달성군청유소년 U12 화원' OR name = '대구달성군청유소년축구단U12화원' THEN 3
  WHEN name = '경기FC진건' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '11'
  AND (name IN ('LOJE UTD U12', '제주LOJEUNITEDU12', '성남시티FC U12', '경기성남시티FCU12', '달성군청유소년 U12 화원', '대구달성군청유소년축구단U12화원', '경기FC진건', '서울서강초'));

-- U11 조 12
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '영등포구SC U12' OR name = '서울영등포구스포츠클럽U12' THEN 1
  WHEN name = 'SSJFC U12' OR name = '경기SSJFCU12' THEN 2
  WHEN name = '하이두FC' OR name = '대구하이두축구클럽' THEN 3
  WHEN name = '제주화북초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '12'
  AND (name IN ('영등포구SC U12', '서울영등포구스포츠클럽U12', 'SSJFC U12', '경기SSJFCU12', '하이두FC', '대구하이두축구클럽', '제주화북초', '제주바모스FCU12', '서울대동초', '부산연산SCU12', '경기진건초'));

-- U11 조 13
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'K리거강용FC A' OR name = '서울K리거강용FCA' THEN 1
  WHEN name = '서창FC U12' OR name = '인천서창FCU12' THEN 2
  WHEN name = '청주CTS U12' OR name = '충북청주CTSU12' THEN 3
  WHEN name = '제주중문초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '13'
  AND (name IN ('K리거강용FC A', '서울K리거강용FCA', '서창FC U12', '인천서창FCU12', '청주CTS U12', '충북청주CTSU12', '제주중문초', '서울신답FCU12', '대전화정초'));

-- U11 조 14
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'AAFC U12' OR name = '서울AAFCU12' THEN 1
  WHEN name = '강화SC U12' OR name = '인천강화스포츠클럽U12' THEN 2
  WHEN name = 'JK풋볼 U12' OR name = '광주JK풋볼U12' THEN 3
  WHEN name = '서울양강초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '14'
  AND (name IN ('AAFC U12', '서울AAFCU12', '강화SC U12', '인천강화스포츠클럽U12', 'JK풋볼 U12', '광주JK풋볼U12', '서울양강초'));

-- U11 조 15
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '서초MB U12' OR name = '서울서초MB U-12' THEN 1
  WHEN name = 'YSC U12' OR name = '인천YSCU12' THEN 2
  WHEN name = '강릉온리원FC U12' OR name = '강원강릉온리원FCU12' THEN 3
  WHEN name = '서울대동주니어FC' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '15'
  AND (name IN ('서초MB U12', '서울서초MB U-12', 'YSC U12', '인천YSCU12', '강릉온리원FC U12', '강원강릉온리원FCU12', '서울대동주니어FC'));

-- U11 조 16
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '스포트랙스FC U12' OR name = '경기남양주시스포트랙스FCU12' THEN 1
  WHEN name = '연수구청 유소년 U12' OR name = '인천연수구청유소년축구단U12' THEN 2
  WHEN name = '서울노원FC한마음U12' THEN 3
  ELSE group_team_no
END
WHERE age_group = 'U11' 
  AND group_name = '16'
  AND (name IN ('스포트랙스FC U12', '경기남양주시스포트랙스FCU12', '연수구청 유소년 U12', '인천연수구청유소년축구단U12', '서울노원FC한마음U12'));

-- ============================================
-- U12 조별 팀 번호 업데이트
-- ============================================

-- U12 조 1
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '서귀포FC' THEN 1
  WHEN name = 'K리거강용FC' THEN 2
  WHEN name = '월드컵FC U12' THEN 3
  WHEN name = '리틀코리아FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '1'
  AND (name IN ('서귀포FC', 'K리거강용FC', '월드컵FC U12', '리틀코리아FC U12'));

-- U12 조 2
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '제주서초' THEN 1
  WHEN name = 'FC구로 U12' THEN 2
  WHEN name = '김포PNCFC U12' THEN 3
  WHEN name = '서창FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '2'
  AND (name IN ('제주서초', 'FC구로 U12', '김포PNCFC U12', '서창FC U12'));

-- U12 조 3
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '중문초' THEN 1
  WHEN name = '화랑 U12' THEN 2
  WHEN name = '양주JUST유소년 U12' THEN 3
  WHEN name = '축구의신신 U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '3'
  AND (name IN ('중문초', '화랑 U12', '양주JUST유소년 U12', '축구의신신 U12'));

-- U12 조 4
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '서귀포초' THEN 1
  WHEN name = '관악FC U12' THEN 2
  WHEN name = 'TEAM6 FC' THEN 3
  WHEN name = 'YSC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '4'
  AND (name IN ('서귀포초', '관악FC U12', 'TEAM6 FC', 'YSC U12'));

-- U12 조 5
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '화북초' THEN 1
  WHEN name = '구룡초' THEN 2
  WHEN name = '스포트랙스FC U12' THEN 3
  WHEN name = '인유서구 U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '5'
  AND (name IN ('화북초', '구룡초', '스포트랙스FC U12', '인유서구 U12'));

-- U12 조 6
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '외도초' THEN 1
  WHEN name = 'FC한마음 U12' THEN 2
  WHEN name = '일산JFC U12' THEN 3
  WHEN name = '남양산FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '6'
  AND (name IN ('외도초', 'FC한마음 U12', '일산JFC U12', '남양산FC U12'));

-- U12 조 7
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '제주SK U12' THEN 1
  WHEN name = '위례FC U12' THEN 2
  WHEN name = '안양AFA U12' THEN 3
  WHEN name = '보물섬남해SC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '7'
  AND (name IN ('제주SK U12', '위례FC U12', '안양AFA U12', '보물섬남해SC U12'));

-- U12 조 8
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'GOATFC U12' THEN 1
  WHEN name = '대동주니어FC' THEN 2
  WHEN name = '화성시 U12' THEN 3
  WHEN name = '마산합성FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '8'
  AND (name IN ('GOATFC U12', '대동주니어FC', '화성시 U12', '마산합성FC U12'));

-- U12 조 9
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '제주동초' THEN 1
  WHEN name = '마포스포츠클럽 U12' THEN 2
  WHEN name = '성남시티FC U12' THEN 3
  WHEN name = '달성군청유소년 U12 화원' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '9'
  AND (name IN ('제주동초', '마포스포츠클럽 U12', '성남시티FC U12', '달성군청유소년 U12 화원'));

-- U12 조 10
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '프로FC U12' THEN 1
  WHEN name = 'AAFC U12' THEN 2
  WHEN name = 'SSJFC U12' THEN 3
  WHEN name = '하이두FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '10'
  AND (name IN ('프로FC U12', 'AAFC U12', 'SSJFC U12', '하이두FC U12'));

-- U12 조 11
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = 'LOJE UTD U12' THEN 1
  WHEN name = '서강초' THEN 2
  WHEN name = 'FC진건' THEN 3
  WHEN name = 'FCMJ 풋볼아카데미' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '11'
  AND (name IN ('LOJE UTD U12', '서강초', 'FC진건', 'FCMJ 풋볼아카데미'));

-- U12 조 12
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '바모스FC U12' THEN 1
  WHEN name = '대동초' THEN 2
  WHEN name = '진건초' THEN 3
  WHEN name = '연산SC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '12'
  AND (name IN ('바모스FC U12', '대동초', '진건초', '연산SC U12'));

-- U12 조 13
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '대정초' THEN 1
  WHEN name = '신답FC U12' THEN 2
  WHEN name = '고양무원FC U12' THEN 3
  WHEN name = '화정초' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '13'
  AND (name IN ('대정초', '신답FC U12', '고양무원FC U12', '화정초'));

-- U12 조 14
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '영등포구SC U12' THEN 1
  WHEN name = '서초MB U12' THEN 2
  WHEN name = '강화SC U12' THEN 3
  WHEN name = '강릉온리원FC U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '14'
  AND (name IN ('영등포구SC U12', '서초MB U12', '강화SC U12', '강릉온리원FC U12'));

-- U12 조 15
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '신용산초' THEN 1
  WHEN name = '솔트FC U12' THEN 2
  WHEN name = '연수구청 유소년 U12' THEN 3
  WHEN name = 'JK풋볼 U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '15'
  AND (name IN ('신용산초', '솔트FC U12', '연수구청 유소년 U12', 'JK풋볼 U12'));

-- U12 조 16
UPDATE teams 
SET group_team_no = CASE 
  WHEN name = '양강초' THEN 1
  WHEN name = '연세FC U12' THEN 2
  WHEN name = '계양구유소년 U12' THEN 3
  WHEN name = '청주CTS U12' THEN 4
  ELSE group_team_no
END
WHERE age_group = 'U12' 
  AND group_name = '16'
  AND (name IN ('양강초', '연세FC U12', '계양구유소년 U12', '청주CTS U12'));

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
