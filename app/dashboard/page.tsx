import { getMatches, getTeams } from '@/lib/supabase/queries';
import type { MatchWithTeams, Team } from '@/types/database';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import { getCurrentWeather, getWeeklyForecast } from '@/lib/weather';
import WeeklyForecastCard from '@/components/Dashboard/WeeklyForecastCard';
import CurrentDateTime from '@/components/Dashboard/CurrentDateTime';
import { Wind, Droplets, CloudRain, Gauge } from 'lucide-react';
import Link from 'next/link';

const FIXED_MY_TEAM_NAMES = ['진건초', 'FC진건', 'FC진건레드', 'FC진건블루'] as const;

// 풍향을 방위로 변환
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export default async function DashboardPage() {

  let allMatches: MatchWithTeams[] = [];
  let teams: Team[] = [];
  let weather = null;
  let weeklyForecast = null;
  
  try {
    allMatches = await getMatches();
    teams = await getTeams();
    weather = await getCurrentWeather();
    weeklyForecast = await getWeeklyForecast();
  } catch (error) {
    // Supabase 환경 변수가 설정되지 않은 경우 빈 배열 반환
    console.error('데이터 로드 오류:', error);
  }
  
  // 내 팀(고정 4개) 목록
  const fixedMyTeams = FIXED_MY_TEAM_NAMES.map((name) => teams.find((t) => t.name === name)).filter(
    (t): t is Team => Boolean(t)
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

      {/* 날씨 섹션 (서귀포 기준) */}
      <section className="mb-8 space-y-4">
        {weather && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                  <span>현재 날씨 · 서귀포</span>
                  <CurrentDateTime />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {Math.round(weather.temperature)}
                    <span className="text-lg align-top ml-0.5">°C</span>
                  </span>
                  <span className="text-sm text-gray-700">{weather.description}</span>
                  {weather.feelsLike !== undefined && (
                    <span className="text-xs text-gray-500">
                      체감 {weather.feelsLike.toFixed(1)}°
                    </span>
                  )}
                </div>
                {/* 주간 예보의 오늘 데이터를 사용 (일관성 유지) */}
                {(() => {
                  const todayForecast = weeklyForecast?.find(f => f.date === today);
                  if (todayForecast) {
                    return (
                      <div className="text-xs text-gray-600">
                        최저 {todayForecast.minTemp}° / 최고 {todayForecast.maxTemp}°
                      </div>
                    );
                  }
                  if (weather.minTemp !== undefined && weather.maxTemp !== undefined) {
                    return (
                      <div className="text-xs text-gray-600">
                        최저 {Math.round(weather.minTemp)}° / 최고 {Math.round(weather.maxTemp)}°
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              {weather.icon && (
                <div className="flex-shrink-0">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="w-16 h-16"
                    style={{
                      filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3)) drop-shadow(0 0 1px white)',
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* 추가 날씨 정보 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-blue-200">
              {weather.humidity !== undefined && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600">습도</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(weather.humidity)}%</span>
                  </div>
                </div>
              )}
              {weather.windSpeed !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Wind 
                      className="w-4 h-4 text-gray-600" 
                      style={{
                        transform: weather.windDirection !== undefined 
                          ? `rotate(${weather.windDirection}deg)` 
                          : 'none',
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600">풍속</span>
                    <span className="text-sm font-medium text-gray-900">
                      {weather.windSpeed.toFixed(1)}m/s
                      {weather.windDirection !== undefined && (
                        <span className="ml-1 text-xs text-gray-500">
                          {getWindDirection(weather.windDirection)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
              {weather.pop !== undefined && (
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600">강수확률</span>
                    <span className="text-sm font-medium text-gray-900">{weather.pop}%</span>
                  </div>
                </div>
              )}
              {weather.precipitation !== undefined && weather.precipitation > 0 && (
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-700" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600">강수량</span>
                    <span className="text-sm font-medium text-gray-900">{weather.precipitation.toFixed(1)}mm</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 주간 예보 카드 */}
        {weeklyForecast && weeklyForecast.length > 0 && (
          <WeeklyForecastCard forecasts={weeklyForecast} />
        )}
      </section>

      {/* 내 팀 (고정 4개) */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">팀 별 일정</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium text-gray-900">진건초등학교</span>
              <br />
              We are Jingeonies.
            </p>
          </div>
          <Link href="/teams" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            팀 목록 →
          </Link>
        </div>

        {fixedMyTeams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-sm text-gray-700">
            <div className="font-medium text-gray-900 mb-1">고정된 내 팀을 찾지 못했습니다.</div>
            <div className="text-gray-600">
              팀 이름이 DB와 다를 수 있어요. 현재 설정된 팀명: {FIXED_MY_TEAM_NAMES.join(', ')}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixedMyTeams.map((team) => {
              const teamMatches = allMatches.filter(
                (m) => m.home_team_id === team.id || m.away_team_id === team.id
              );

              const firstRoundGroupName =
                teamMatches.find((m) => m.round === '1차')?.group_name || team.group_name;

              const secondRoundGroupName =
                teamMatches.find((m) => m.round === '2차')?.group_name || null;

              const teamUpcoming = allMatches
                .filter(
                  (m) =>
                    (m.home_team_id === team.id || m.away_team_id === team.id) &&
                    (m.status === '예정' || m.status === '진행중')
                )
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                  const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .slice(0, 3);

              const teamToday = allMatches
                .filter(
                  (m) =>
                    m.date === today &&
                    (m.home_team_id === team.id || m.away_team_id === team.id) &&
                    (m.status === '예정' || m.status === '진행중')
                )
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                  const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                  return dateA.getTime() - dateB.getTime();
                });

              return (
                <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                        <span>{team.age_group}</span>
                        <span className="text-gray-300">·</span>
                        <Link
                          href={`/standings?ageGroup=${team.age_group}&round=1차#${team.age_group}-1차-${firstRoundGroupName}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {firstRoundGroupName}조(1차 리그)
                        </Link>
                        <span className="text-gray-300">/</span>
                        {secondRoundGroupName ? (
                          <Link
                            href={`/standings?ageGroup=${team.age_group}&round=2차#${team.age_group}-2차-${secondRoundGroupName}`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            {secondRoundGroupName}조(2차 리그)
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-500">2차 리그 미편성</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">{team.name}</div>
                    </div>
                    <Link
                      href={`/teams/${team.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                    >
                      팀 상세 →
                    </Link>
                  </div>

                  <div className="p-4">
                    {teamToday.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          오늘의 경기
                        </h3>
                        <div className="space-y-2">
                          {teamToday.map((match) => {
                            const isHome = match.home_team_id === team.id;
                            const opponent = isHome ? match.away_team : match.home_team;
                            if (!opponent) return null;
                            return (
                              <Link
                                key={match.id}
                                href={`/matches/${match.id}`}
                                className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {isHome ? (
                                        <span className="text-blue-600">홈</span>
                                      ) : (
                                        <span className="text-orange-600">원정</span>
                                      )}
                                      <span className="mx-2 text-gray-400">vs</span>
                                      {opponent.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatDate(match.date)} {match.time && formatTime(match.time)}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(match.status)}`}>
                                    {match.status}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {teamUpcoming.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">다음 경기</h3>
                        <div className="space-y-2">
                          {teamUpcoming.slice(0, 3).map((match) => {
                            const isHome = match.home_team_id === team.id;
                            const opponent = isHome ? match.away_team : match.home_team;
                            if (!opponent) return null;
                            return (
                              <Link
                                key={match.id}
                                href={`/matches/${match.id}`}
                                className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {isHome ? (
                                        <span className="text-blue-600">홈</span>
                                      ) : (
                                        <span className="text-orange-600">원정</span>
                                      )}
                                      <span className="mx-2 text-gray-400">vs</span>
                                      {opponent.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatDate(match.date)} {match.time && formatTime(match.time)}
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(match.status)}`}>
                                    {match.status}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {teamToday.length === 0 && teamUpcoming.length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-4">예정/진행중인 경기가 없습니다.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
