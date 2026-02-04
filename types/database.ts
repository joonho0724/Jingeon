export type Team = {
  id: string;
  name: string;
  age_group: 'U11' | 'U12';
  group_name: string;
  registration_no: number | null; // 대회 전체 팀 번호(예: 1~56)
  group_team_no: number | null; // 조 내 팀 번호(예: 1~4)
  created_at: string;
  updated_at: string;
};

export type Venue = {
  id: string;
  code: string; // A, B, C ...
  name: string; // 경기장 이름
  round: '1차' | '2차'; // 리그 구분
  created_at: string;
};

export type Match = {
  id: string;
  date: string;
  time: string | null;
  round: '1차' | '2차';
  group_name: string;
  age_group: 'U11' | 'U12'; // 연령대
  match_no: number | null; // 경기번호
  pitch_code: string | null; // 경기장 코드: A, B, C, D, E, F, G, H ...
  home_team_no: number | null; // 대진표 상 홈팀 번호 (1~4 등)
  away_team_no: number | null; // 대진표 상 원정팀 번호 (1~4 등)
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: '예정' | '진행중' | '종료';
  youtube_link: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchWithTeams = Match & {
  home_team: Team | null;
  away_team: Team | null;
};

export type Standing = {
  team_id: string;
  team_name: string;
  age_group: 'U11' | 'U12';
  group_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  fair_play_points: number; // 페어플레이점수 (벌점 누계, 낮을수록 좋음)
};

export type FairPlayPoint = {
  id: string;
  match_id: string;
  team_id: string;
  player_id: string | null; // 선수 배번 또는 이름
  staff_type: '선수' | '지도자' | '임원';
  penalty_type: '경고' | '경고누적퇴장' | '직접퇴장' | '경고후직접퇴장' | '공정위팀경고' | '공정위경고' | '공정위출전정지';
  points: number; // 벌점
  description: string | null; // 상세 설명
  created_at: string;
};
