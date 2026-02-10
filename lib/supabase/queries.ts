import { createClient } from './server';
import { createAdminClient } from './admin';
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

// 팀 생성 또는 업데이트 (upsert)
// 관리자 권한이 필요한 작업이므로 admin client 사용
export async function upsertTeam(team: {
  name: string;
  age_group: 'U11' | 'U12';
  group_name1: string; // 1차 리그 조
  group_name2?: string | null; // 2차 리그 조 (선택사항)
  registration_no?: number | null;
  group_team_no1?: number | null; // 1차 리그 조 내 팀 번호
}): Promise<{ team: Team | null; isNew: boolean }> {
  const supabase = createAdminClient();
  
  // 기존 팀 찾기 (이름과 연령대로)
  // 1. 정확 일치 우선
  const { data: exactMatch, error: exactError } = await supabase
    .from('teams')
    .select('*')
    .eq('age_group', team.age_group)
    .eq('name', team.name)
    .limit(1)
    .maybeSingle();

  if (exactMatch && !exactError) {
    // 정확 일치하는 팀이 있으면 업데이트
    const updateData: Partial<Team> = {
      name: team.name, // 크롤링한 이름으로 업데이트 (동일하지만 명시적으로)
      group_name1: team.group_name1,
    };
    
    if (team.registration_no !== undefined) {
      updateData.registration_no = team.registration_no;
    }
    if (team.group_team_no1 !== undefined) {
      updateData.group_team_no1 = team.group_team_no1;
    }
    if (team.group_name2 !== undefined) {
      updateData.group_name2 = team.group_name2;
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', exactMatch.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return { team: null, isNew: false };
    }

    console.log(`[팀 업데이트] ${team.name} (${team.age_group}) - 1차조: ${team.group_name1}, 팀번호: ${team.group_team_no1 || 'N/A'}`);
    return { team: data, isNew: false };
  }

  // 2. 부분 일치 검색 (포함 관계)
  const { data: partialMatches, error: partialError } = await supabase
    .from('teams')
    .select('*')
    .eq('age_group', team.age_group);

  if (!partialError && partialMatches) {
    // 부분 일치 찾기
    const partialMatch = partialMatches.find(t => 
      t.name.includes(team.name) || team.name.includes(t.name)
    );

    if (partialMatch) {
      // 부분 일치하는 팀이 있으면 이름을 크롤링한 이름으로 업데이트
      const updateData: Partial<Team> = {
        name: team.name, // 크롤링한 이름으로 업데이트
        group_name1: team.group_name1,
      };
      
      if (team.registration_no !== undefined) {
        updateData.registration_no = team.registration_no;
      }
      if (team.group_team_no1 !== undefined) {
        updateData.group_team_no1 = team.group_team_no1;
      }
      if (team.group_name2 !== undefined) {
        updateData.group_name2 = team.group_name2;
      }

      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', partialMatch.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team (partial match):', error);
        return { team: null, isNew: false };
      }

      console.log(`[팀 업데이트 (부분일치)] ${partialMatch.name} → ${team.name} (${team.age_group}) - 1차조: ${team.group_name1}`);
      return { team: data, isNew: false };
    }
  }

  // 3. 새로 생성
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: team.name,
      age_group: team.age_group,
      group_name1: team.group_name1,
      group_name2: team.group_name2 || null,
      registration_no: team.registration_no || null,
      group_team_no1: team.group_team_no1 || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team:', error);
    return { team: null, isNew: true };
  }

  console.log(`[팀 생성] ${team.name} (${team.age_group}) - 1차조: ${team.group_name1}, 팀번호: ${team.group_team_no1 || 'N/A'}`);
  return { team: data, isNew: true };
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
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  const result: MatchWithTeams[] = (data || []).map((match: any) => ({
    ...match,
    home_team: match.home_team || null,
    away_team: match.away_team || null,
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
// 관리자 권한이 필요한 작업이므로 admin client 사용
export async function updateMatchResult(
  matchId: string,
  result: {
    home_score: number;
    away_score: number;
    status: '종료';
    youtube_link?: string;
    match_no?: number;
    date?: string;
    time?: string;
  }
): Promise<Match | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('matches')
    .update(result)
    .eq('id', matchId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating match result:', error);
    return null;
  }

  if (!data) {
    console.error(`Error updating match result: 경기를 찾을 수 없습니다 (ID: ${matchId})`);
    return null;
  }

  return data;
}

// 경기번호만 업데이트 (점수나 상태는 변경하지 않음)
// 관리자 권한이 필요한 작업이므로 admin client 사용
export async function updateMatchNumber(
  matchId: string,
  matchNo: number
): Promise<Match | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('matches')
    .update({ match_no: matchNo })
    .eq('id', matchId)
    .select()
    .single();

  if (error) {
    console.error('Error updating match number:', error);
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
  const { data: matchData, error } = await supabase
    .from('matches')
    .select('*')
    .eq('round', round)
    .eq('group_name', groupName);

  if (error) {
    console.error('Error fetching matches for standings:', error);
    return [];
  }

  const matches = (matchData || []) as Match[];

  // 순위표 맵 초기화
  const standingsMap = new Map<string, Standing>();


  // 초기화: 리그별로 팀 목록 추출 방식이 다름
  let teamsInGroup: Team[] = [];
  
  if (round === '1차') {
    // 1차 리그: teams 테이블의 group_name1으로 필터링
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .eq('group_name1', groupName);
    teamsInGroup = (teams || []) as Team[];
  } else {
    // 2차 리그: matches 테이블에서 해당 조의 경기에 참가한 팀들을 추출
    const teamIds = new Set<string>();
    (matchData || []).forEach((match: any) => {
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

  // 중복 팀 필터링: 같은 조에 같은 팀이 여러 개 있을 수 있으므로,
  // 팀명을 정규화하여 중복을 제거하고, 가장 최근에 생성된 팀만 사용
  const normalizedTeamMap = new Map<string, Team>();
  
  teamsInGroup.forEach((team) => {
    // 팀명 정규화 (공백 제거, 소문자 변환)
    const normalizedName = team.name
      .replace(/\s+/g, '')
      .toLowerCase()
      .replace(/fc/g, '')
      .replace(/u12/g, '')
      .replace(/u11/g, '');
    
    // 이미 같은 팀이 있으면, 더 최근에 생성된 팀으로 교체
    if (normalizedTeamMap.has(normalizedName)) {
      const existingTeam = normalizedTeamMap.get(normalizedName)!;
      if (new Date(team.created_at) > new Date(existingTeam.created_at)) {
        normalizedTeamMap.set(normalizedName, team);
      }
    } else {
      normalizedTeamMap.set(normalizedName, team);
    }
  });

  // 정규화된 팀 목록으로 순위표 초기화
  normalizedTeamMap.forEach((team) => {
    standingsMap.set(team.id, {
      team_id: team.id,
      team_name: team.name,
      age_group: team.age_group,
      group_name: round === '1차' ? team.group_name1 : (team.group_name2 || groupName), // 1차는 group_name1, 2차는 group_name2 또는 matches의 group_name 사용
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
  // 중복된 팀의 경기 결과도 반영하기 위해 팀 ID 매핑 생성
  const teamIdMapping = new Map<string, string>(); // 중복 팀 ID -> 대표 팀 ID
  normalizedTeamMap.forEach((team) => {
    const normalizedName = team.name
      .replace(/\s+/g, '')
      .toLowerCase()
      .replace(/fc/g, '')
      .replace(/u12/g, '')
      .replace(/u11/g, '');
    
    // 같은 정규화된 이름을 가진 모든 팀을 찾아서 대표 팀 ID로 매핑
    teamsInGroup.forEach((t) => {
      const tNormalizedName = t.name
        .replace(/\s+/g, '')
        .toLowerCase()
        .replace(/fc/g, '')
        .replace(/u12/g, '')
        .replace(/u11/g, '');
      
      if (tNormalizedName === normalizedName && t.id !== team.id) {
        teamIdMapping.set(t.id, team.id);
      }
    });
  });

  (matchData as Match[]).forEach((match) => {
    if (match.home_score === null || match.away_score === null) return;

    // 중복 팀 ID를 대표 팀 ID로 변환
    const homeTeamId = teamIdMapping.get(match.home_team_id) || match.home_team_id;
    const awayTeamId = teamIdMapping.get(match.away_team_id) || match.away_team_id;

    const homeStanding = standingsMap.get(homeTeamId);
    const awayStanding = standingsMap.get(awayTeamId);

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
        awayStanding.lost++;
        homeStanding.points += 3;
      } else if (match.home_score < match.away_score) {
        homeStanding.lost++;
        awayStanding.won++;
        awayStanding.points += 3;
      } else {
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points += 1;
        awayStanding.points += 1;
      }
    }
  });

  // 페어플레이 점수 계산
  const { data: fairPlayData } = await supabase
    .from('fair_play_points')
    .select('*');

  if (fairPlayData) {
    (fairPlayData as FairPlayPoint[]).forEach((point) => {
      const standing = standingsMap.get(point.team_id);
      if (standing) {
        standing.fair_play_points += point.points;
      }
    });
  }

  // 득실차 계산
  standingsMap.forEach((standing) => {
    standing.goal_difference = standing.goals_for - standing.goals_against;
  });

  // 정렬: 승점 내림차순 → 페어플레이점수 오름차순 (낮을수록 좋음)
  const standings = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return a.fair_play_points - b.fair_play_points;
  });

  return standings;
}
