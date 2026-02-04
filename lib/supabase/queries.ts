import { createClient } from './server';
import { FairPlayPoint, Match, MatchWithTeams, Team, Standing, Venue } from '@/types/database';
import { cache } from 'react';

// 팀 목록 조회
export async function getTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('age_group', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return [];
  }

  console.log('Teams fetched:', data?.length || 0, 'teams');
  return data || [];
}

// 경기장 목록 조회
export const getVenues = cache(async (round?: '1차' | '2차'): Promise<Venue[]> => {
  const supabase = await createClient();
  let query = supabase.from('venues').select('*');

  if (round) {
    query = query.eq('round', round);
  }

  const { data, error } = await query.order('code', { ascending: true });

  if (error) {
    console.error('Error fetching venues:', error);
    return [];
  }

  return (data || []) as Venue[];
});

// 경기 목록 조회 (팀 정보 포함)
export async function getMatches(): Promise<MatchWithTeams[]> {
  const supabase = await createClient();

  // 1) 경기만 먼저 조회
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (matchError) {
    console.error('Error fetching matches:', matchError);
    return [];
  }

  if (!matches || matches.length === 0) {
    return [];
  }

  // 2) 팀 목록 조회 후 매치에 매핑
  const { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('*');

  if (teamError) {
    console.error('Error fetching teams for matches:', teamError);
    return [];
  }

  const teamMap = new Map<string, Team>();
  (teams || []).forEach((team: any) => {
    teamMap.set(team.id, team as Team);
  });

  console.log('Raw matches from DB:', matches.length);

  const result: MatchWithTeams[] = (matches as Match[]).map((match) => ({
    ...match,
    home_team: teamMap.get(match.home_team_id) ?? null,
    away_team: teamMap.get(match.away_team_id) ?? null,
  }));

  console.log('Matches fetched with teams:', result.length);

  return result;
}

// 특정 팀의 경기 조회
export async function getTeamMatches(teamId: string): Promise<MatchWithTeams[]> {
  const allMatches = await getMatches();
  return allMatches.filter(
    (m) => m.home_team_id === teamId || m.away_team_id === teamId
  );
}

// 오늘의 경기 조회
export async function getTodayMatches(): Promise<MatchWithTeams[]> {
  const today = new Date().toISOString().split('T')[0];
  const allMatches = await getMatches();

  return allMatches
    .filter((m) => m.date === today && m.status !== '종료')
    .sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
}

// 경기 생성
export async function createMatch(match: {
  date: string;
  time?: string;
  round: '1차' | '2차';
  group_name: string;
  home_team_id: string;
  away_team_id: string;
}): Promise<Match | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single();

  if (error) {
    console.error('Error creating match:', error);
    return null;
  }

  return data;
}

// 경기 결과 업데이트
export async function updateMatchResult(
  matchId: string,
  result: {
    home_score: number;
    away_score: number;
    status: '종료';
    youtube_link?: string;
    match_no?: number;
  }
): Promise<Match | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .update(result)
    .eq('id', matchId)
    .select()
    .single();

  if (error) {
    console.error('Error updating match result:', error);
    return null;
  }

  return data;
}

// 조별 순위 계산
export async function getStandings(
  round: '1차' | '2차',
  groupName: string
): Promise<Standing[]> {
  const supabase = await createClient();
 
  // 해당 조의 경기 조회 (순수 매치 데이터만 사용)
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('round', round)
    .eq('group_name', groupName)
    .eq('status', '종료');

  if (error) {
    console.error('Error fetching matches for standings:', error);
    return [];
  }

  const matchData = (matches || []) as Match[];
  
  // 팀별 통계 계산
  const standingsMap = new Map<string, Standing>();

  // 초기화: 리그별로 팀 목록 추출 방식이 다름
  let teamsInGroup: Team[] = [];
  
  if (round === '1차') {
    // 1차 리그: teams 테이블의 group_name으로 필터링
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .eq('group_name', groupName);
    teamsInGroup = (teams || []) as Team[];
  } else {
    // 2차 리그: matches 테이블에서 해당 조의 경기에 참가한 팀들을 추출
    const teamIds = new Set<string>();
    matchData.forEach((match) => {
      teamIds.add(match.home_team_id);
      teamIds.add(match.away_team_id);
    });
    
    if (teamIds.size > 0) {
      const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .in('id', Array.from(teamIds));
      teamsInGroup = (teams || []) as Team[];
    }
  }

  teamsInGroup.forEach((team) => {
    standingsMap.set(team.id, {
      team_id: team.id,
      team_name: team.name,
      age_group: team.age_group,
      group_name: round === '1차' ? team.group_name : groupName, // 2차 리그는 matches의 group_name 사용
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      fair_play_points: 0, // 페어플레이점수 초기화
    });
  });

  // 경기 결과로 통계 계산
  matchData.forEach((match) => {
    if (match.home_score === null || match.away_score === null) return;

    const homeStanding = standingsMap.get(match.home_team_id);
    const awayStanding = standingsMap.get(match.away_team_id);

    if (homeStanding && awayStanding) {
      // 경기수 증가
      homeStanding.played++;
      awayStanding.played++;

      // 득점/실점
      homeStanding.goals_for += match.home_score;
      homeStanding.goals_against += match.away_score;
      awayStanding.goals_for += match.away_score;
      awayStanding.goals_against += match.home_score;

      // 승/무/패 및 승점
      if (match.home_score > match.away_score) {
        homeStanding.won++;
        homeStanding.points += 3;
        awayStanding.lost++;
      } else if (match.home_score < match.away_score) {
        awayStanding.won++;
        awayStanding.points += 3;
        homeStanding.lost++;
      } else {
        homeStanding.drawn++;
        homeStanding.points += 1;
        awayStanding.drawn++;
        awayStanding.points += 1;
      }

      // 득실차 계산
      homeStanding.goal_difference = homeStanding.goals_for - homeStanding.goals_against;
      awayStanding.goal_difference = awayStanding.goals_for - awayStanding.goals_against;
    }
  });

  // 페어플레이점수 계산 (대회규정 제 13조)
  const { data: fairPlayPoints } = await supabase
    .from('fair_play_points')
    .select('*')
    .in('match_id', matchData.map(m => m.id));

  // 팀별 페어플레이점수 합계 계산
  const fairPlayMap = new Map<string, number>();
  teamsInGroup.forEach((team) => {
    fairPlayMap.set(team.id, 0);
  });

  (fairPlayPoints as FairPlayPoint[] | null)?.forEach((fpp) => {
    const current = fairPlayMap.get(fpp.team_id) || 0;
    fairPlayMap.set(fpp.team_id, current + fpp.points);
  });

  // 배열로 변환
  const standings = Array.from(standingsMap.values());

  // 순위표에 페어플레이점수 추가
  standings.forEach((standing) => {
    standing.fair_play_points = fairPlayMap.get(standing.team_id) || 0;
  });

  // 정렬 (대회규정 제 13조)
  // 순위 결정: 1. 승점 (높은 순) > 2. 페어플레이점수 (벌점 누계가 낮은 순) > 3. 추첨
  standings.sort((a, b) => {
    // 1순위: 승점 (높은 순)
    if (b.points !== a.points) return b.points - a.points;
    
    // 2순위: 페어플레이점수 (벌점 누계가 낮은 순)
    if (a.fair_play_points !== b.fair_play_points) {
      return a.fair_play_points - b.fair_play_points;
    }
    
    // 3순위: 추첨 (대회 주최측에서 진행하므로 여기서는 동일 순위로 처리)
    // 실제로는 대회 주최측에서 추첨을 진행하므로, 동점인 경우 같은 순위로 표시
    return 0;
  });

  return standings;
}
