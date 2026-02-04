-- 004_add_match_numbers_and_pitch_code.sql
-- matches 테이블에 경기번호 및 팀번호, 경기장 코드(pitch_code)를 도입하고
-- venues 테이블을 code + name 구조로 정리한다.

-- 1) venues 테이블 생성/정리
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- A, B, C, ...
  name TEXT NOT NULL,        -- 예: 걸매A-1구장
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존에 matches.venue에 사용되던 코드들을 venues.code로 이관
INSERT INTO venues (code, name)
SELECT DISTINCT v.code, 
  CASE v.code
    WHEN 'A' THEN '걸매A-1구장'
    WHEN 'B' THEN '걸매A-2구장'
    WHEN 'C' THEN '걸매B-1구장'
    WHEN 'D' THEN '효돈A-1구장'
    WHEN 'E' THEN '효돈A-2구장'
    WHEN 'F' THEN '효돈B-1구장'
    WHEN 'G' THEN '공천포A-1구장'
    WHEN 'H' THEN '공천포A-2구장'
    ELSE v.code
  END AS name
FROM (
  SELECT DISTINCT venue AS code
  FROM matches
  WHERE venue IS NOT NULL
) v
ON CONFLICT (code) DO NOTHING;

-- 2) matches.venue -> matches.pitch_code로 이름 변경
ALTER TABLE matches
RENAME COLUMN venue TO pitch_code;

-- 3) 경기번호 및 팀번호 컬럼 추가
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS match_no INTEGER,
ADD COLUMN IF NOT EXISTS home_team_no SMALLINT,
ADD COLUMN IF NOT EXISTS away_team_no SMALLINT;

-- 4) 인덱스 및 제약조건
-- 연령대, 라운드, 조, 경기번호 조합으로 조회/검증이 쉬워지도록 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_matches_round_group_match_no
  ON matches (age_group, round, group_name, match_no);

-- 경기번호는 조/리그/연령대 내에서만 의미가 있으므로, 필요 시 아래 유니크 제약을 활성화할 수 있다.
-- ALTER TABLE matches
-- ADD CONSTRAINT uniq_match_per_group
--   UNIQUE (age_group, round, group_name, match_no);

