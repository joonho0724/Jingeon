-- 006_reorder_matches_columns.sql
-- matches 테이블의 컬럼 순서를 논리적으로 정리
-- PostgreSQL에서는 ALTER TABLE로 컬럼 순서를 직접 변경할 수 없으므로,
-- 테이블을 재생성하는 방식으로 진행합니다.

-- 1) 임시 테이블 생성 (정리된 컬럼 순서)
CREATE TABLE matches_new (
  -- 기본 식별자
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 대회/리그 메타 정보
  age_group TEXT NOT NULL CHECK (age_group IN ('U11', 'U12')),
  round TEXT NOT NULL CHECK (round IN ('1차', '2차')),
  group_name TEXT NOT NULL,
  match_no INTEGER,
  
  -- 일정 정보
  date DATE NOT NULL,
  time TIME,
  
  -- 경기장 정보
  pitch_code TEXT,
  
  -- 팀 매핑 (ID + 번호)
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  home_team_no SMALLINT,
  away_team_no SMALLINT,
  
  -- 경기 결과
  home_score INTEGER DEFAULT NULL,
  away_score INTEGER DEFAULT NULL,
  status TEXT NOT NULL DEFAULT '예정' CHECK (status IN ('예정', '진행중', '종료')),
  
  -- 부가 정보
  youtube_link TEXT,
  
  -- 감사(Audit) 필드
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) 기존 데이터 복사 (컬럼 순서는 중요하지 않음, 이름으로 매핑)
INSERT INTO matches_new (
  id, age_group, round, group_name, match_no,
  date, time, pitch_code,
  home_team_id, away_team_id, home_team_no, away_team_no,
  home_score, away_score, status, youtube_link,
  created_at, updated_at
)
SELECT 
  id, age_group, round, group_name, match_no,
  date, time, pitch_code,
  home_team_id, away_team_id, home_team_no, away_team_no,
  home_score, away_score, status, youtube_link,
  created_at, updated_at
FROM matches;

-- 3) 기존 테이블의 인덱스, 제약조건, 트리거 정보 확인 및 재생성
-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches_new(date);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches_new(round);
CREATE INDEX IF NOT EXISTS idx_matches_group_name ON matches_new(group_name);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches_new(status);
CREATE INDEX IF NOT EXISTS idx_matches_age_group ON matches_new(age_group);
CREATE INDEX IF NOT EXISTS idx_matches_round_group_match_no ON matches_new(age_group, round, group_name, match_no);

-- 4) 기존 테이블 백업 및 교체
-- 트랜잭션으로 안전하게 처리
BEGIN;

-- 기존 테이블 이름 변경 (백업)
ALTER TABLE matches RENAME TO matches_old;

-- 새 테이블을 matches로 이름 변경
ALTER TABLE matches_new RENAME TO matches;

-- 트리거 재생성 (age_group 자동 설정)
DROP TRIGGER IF EXISTS trigger_set_match_age_group ON matches;
CREATE TRIGGER trigger_set_match_age_group
BEFORE INSERT OR UPDATE OF home_team_id, away_team_id ON matches
FOR EACH ROW
EXECUTE FUNCTION set_match_age_group();

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책은 테이블 이름이 바뀌어도 자동으로 유지되지만, 확인용 주석
-- 기존 RLS 정책은 matches 테이블에 그대로 적용됨

COMMIT;

-- 5) 기존 테이블 삭제 (백업 테이블은 필요시 수동으로 삭제)
-- DROP TABLE IF EXISTS matches_old; -- 주의: 데이터 확인 후 수동으로 실행
