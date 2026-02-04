-- 팀 테이블
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('U11', 'U12')),
  group_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경기 테이블
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME,
  round TEXT NOT NULL CHECK (round IN ('1차', '2차')),
  group_name TEXT NOT NULL,
  venue TEXT, -- 경기장 코드: A, B, C, D, E, F, G, H
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT NULL,
  away_score INTEGER DEFAULT NULL,
  status TEXT NOT NULL DEFAULT '예정' CHECK (status IN ('예정', '진행중', '종료')),
  youtube_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round);
CREATE INDEX IF NOT EXISTS idx_matches_group_name ON matches(group_name);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_teams_age_group ON teams(age_group);
CREATE INDEX IF NOT EXISTS idx_teams_group_name ON teams(group_name);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security 활성화
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능
CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

-- 관리자만 데이터 입력/수정/삭제 가능
-- 주의: 실제 구현 시 auth.users 테이블과 연동하여 관리자 여부 확인 필요
-- 예시: auth.jwt() ->> 'is_admin' = 'true' 또는 별도 admin_users 테이블 사용

-- 관리자 INSERT 정책 (임시 - 실제 구현 시 수정 필요)
CREATE POLICY "Only admins can insert teams" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Only admins can insert matches" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- 관리자 UPDATE 정책
CREATE POLICY "Only admins can update teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Only admins can update matches" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- 관리자 DELETE 정책
CREATE POLICY "Only admins can delete teams" ON teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Only admins can delete matches" ON matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- 페어플레이 벌점 테이블 (경기별 팀별 벌점 기록)
-- 대회규정 제 13조에 따른 페어플레이점수 산정을 위한 테이블
CREATE TABLE IF NOT EXISTS fair_play_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id TEXT, -- 선수 배번 또는 이름 (선수인 경우)
  staff_type TEXT NOT NULL CHECK (staff_type IN ('선수', '지도자', '임원')),
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('경고', '경고누적퇴장', '직접퇴장', '경고후직접퇴장', '공정위팀경고', '공정위경고', '공정위출전정지')),
  points INTEGER NOT NULL, -- 벌점
  description TEXT, -- 상세 설명 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_fair_play_points_match_id ON fair_play_points(match_id);
CREATE INDEX IF NOT EXISTS idx_fair_play_points_team_id ON fair_play_points(team_id);

-- Row Level Security 활성화
ALTER TABLE fair_play_points ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능
CREATE POLICY "Anyone can view fair_play_points" ON fair_play_points
  FOR SELECT USING (true);

-- 관리자만 데이터 입력/수정/삭제 가능
CREATE POLICY "Only admins can insert fair_play_points" ON fair_play_points
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Only admins can update fair_play_points" ON fair_play_points
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

CREATE POLICY "Only admins can delete fair_play_points" ON fair_play_points
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- 초기 팀 데이터 삽입
INSERT INTO teams (name, age_group, group_name) VALUES
  ('진건초', 'U12', 'A'),
  ('FC진건', 'U12', 'A'),
  ('FC진건_블루', 'U11', 'A'),
  ('FC진건_레드', 'U11', 'A')
ON CONFLICT DO NOTHING;
