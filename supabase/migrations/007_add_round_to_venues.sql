-- 007_add_round_to_venues.sql
-- venues 테이블에 round 컬럼 추가하여 리그별 경기장 관리

-- 1) venues 테이블에 round 컬럼 추가
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS round TEXT CHECK (round IN ('1차', '2차')) DEFAULT '1차';

-- 2) 기존 venues 데이터는 모두 1차 리그로 설정
UPDATE venues SET round = '1차' WHERE round IS NULL;

-- 3) code + round 조합으로 유니크 제약 추가
-- 기존 UNIQUE 제약 제거 (code만 유니크였음)
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_code_key;

-- code + round 조합으로 유니크 제약 추가
ALTER TABLE venues
ADD CONSTRAINT venues_code_round_unique UNIQUE (code, round);

-- 4) 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_venues_round ON venues(round);
