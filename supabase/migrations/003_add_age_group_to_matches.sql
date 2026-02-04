-- matches 테이블에 age_group 컬럼 추가
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('U11', 'U12'));

-- 기존 데이터의 age_group을 home_team의 age_group으로 업데이트
UPDATE matches m
SET age_group = t.age_group
FROM teams t
WHERE m.home_team_id = t.id
AND m.age_group IS NULL;

-- age_group을 NOT NULL로 변경 (기본값은 없지만, 모든 경기는 팀 정보가 있어야 함)
ALTER TABLE matches 
ALTER COLUMN age_group SET NOT NULL;

-- 인덱스 생성 (연령대별 필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_matches_age_group ON matches(age_group);

-- 트리거: 경기 생성 시 home_team의 age_group을 자동으로 설정
CREATE OR REPLACE FUNCTION set_match_age_group()
RETURNS TRIGGER AS $$
BEGIN
  -- home_team의 age_group을 가져와서 설정
  SELECT age_group INTO NEW.age_group
  FROM teams
  WHERE id = NEW.home_team_id;
  
  -- home_team과 away_team의 age_group이 같은지 검증
  IF EXISTS (
    SELECT 1 FROM teams 
    WHERE id = NEW.away_team_id 
    AND age_group != NEW.age_group
  ) THEN
    RAISE EXCEPTION '홈팀과 원정팀의 연령대가 일치하지 않습니다.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_set_match_age_group ON matches;
CREATE TRIGGER trigger_set_match_age_group
BEFORE INSERT OR UPDATE OF home_team_id, away_team_id ON matches
FOR EACH ROW
EXECUTE FUNCTION set_match_age_group();
