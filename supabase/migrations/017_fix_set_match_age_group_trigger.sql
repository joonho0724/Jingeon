-- set_match_age_group 트리거 함수 수정
-- 목적: home_team_id/away_team_id가 NULL로 변경될 때 NEW.age_group을 NULL로 덮어써서
-- matches.age_group NOT NULL 제약을 위반하는 문제 방지

BEGIN;

CREATE OR REPLACE FUNCTION set_match_age_group()
RETURNS TRIGGER AS $$
DECLARE
  home_age TEXT;
  away_age TEXT;
BEGIN
  -- 팀이 아직 연결되지 않은 상태(예: 팀 리셋/재매핑 중)에서는 age_group을 건드리지 않음
  IF NEW.home_team_id IS NULL OR NEW.away_team_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT age_group INTO home_age
  FROM teams
  WHERE id = NEW.home_team_id;

  SELECT age_group INTO away_age
  FROM teams
  WHERE id = NEW.away_team_id;

  -- 팀 테이블에 없는 경우에도 기존 값을 유지 (NOT NULL 보호)
  IF home_age IS NULL THEN
    RETURN NEW;
  END IF;

  -- home 기준으로 age_group 세팅
  NEW.age_group := home_age;

  -- 상호 검증 (둘 다 있을 때만)
  IF away_age IS NOT NULL AND away_age <> NEW.age_group THEN
    RAISE EXCEPTION '홈팀과 원정팀의 연령대가 일치하지 않습니다.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;

