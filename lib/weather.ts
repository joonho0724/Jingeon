export type WeatherData = {
  temperature: number; // 현재 기온
  minTemp?: number; // 오늘 최저 기온
  maxTemp?: number; // 오늘 최고 기온
  description: string;
  icon: string | null;
  humidity?: number; // 습도 (REH, %)
  windSpeed?: number; // 풍속 (WSD, m/s)
  windDirection?: number; // 풍향 (VEC, 도)
  precipitation?: number; // 강수량 (RN1, mm)
  pop?: number; // 강수확률 (POP, %)
  feelsLike?: number; // 체감온도 (계산값, °C)
};

export type DailyForecast = {
  date: string; // YYYY-MM-DD
  dayName: string; // 오늘, 내일, 월, 화, 수...
  minTemp: number;
  maxTemp: number;
  morning: {
    pop: number; // 강수확률 (0-100)
    icon: string | null;
    description: string;
  };
  afternoon: {
    pop: number;
    icon: string | null;
    description: string;
  };
};

// KMA(기상청) + OpenWeather 하이브리드 전략
// 1순위: KMA API 허브 (KMA_API_HUB_KEY 설정 시)
// 2순위: KMA 공공데이터포털 (KMA_API_KEY 설정 시)
// 3순위: OpenWeather (OPENWEATHER_API_KEY 설정 시)
export async function getCurrentWeather(): Promise<WeatherData | null> {
  // 기상청 API 허브 인증키 우선 사용
  const hasKmaHubKey = !!process.env.KMA_API_HUB_KEY;
  if (hasKmaHubKey) {
    const kma = await getCurrentWeatherFromKMA(process.env.KMA_API_HUB_KEY);
    if (kma) return kma;
  }
  
  // 기존 공공데이터포털 키 사용 (fallback)
  const hasKmaKey = !!process.env.KMA_API_KEY;
  if (hasKmaKey) {
    const kma = await getCurrentWeatherFromKMA(process.env.KMA_API_KEY, true);
    if (kma) return kma;
  }

  const hasOpenWeatherKey = !!process.env.OPENWEATHER_API_KEY;
  if (hasOpenWeatherKey) {
    return getCurrentWeatherFromOpenWeather();
  }

  console.warn('KMA_API_HUB_KEY / KMA_API_KEY / OPENWEATHER_API_KEY 가 모두 설정되어 있지 않습니다. 날씨 섹션을 숨깁니다.');
  return null;
}

// ---------------------
// OpenWeather (백업용)
// ---------------------

async function getCurrentWeatherFromOpenWeather(): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    // 서귀포 근처 좌표 (대회 경기장 기준 대략 값)
    const lat = 33.2541;
    const lon = 126.5600;

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('units', 'metric'); // 섭씨
    url.searchParams.set('lang', 'kr'); // 한글 설명
    url.searchParams.set('appid', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 600 } }); // 10분 캐시

    if (!res.ok) {
      console.error('OpenWeather API 호출 실패:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();

    const temperature = typeof data.main?.temp === 'number' ? data.main.temp : null;
    const minTemp = typeof data.main?.temp_min === 'number' ? data.main.temp_min : undefined;
    const maxTemp = typeof data.main?.temp_max === 'number' ? data.main.temp_max : undefined;
    const weatherItem = Array.isArray(data.weather) && data.weather.length > 0 ? data.weather[0] : null;

    if (temperature === null || !weatherItem) {
      return null;
    }

    return {
      temperature,
      minTemp,
      maxTemp,
      description: translateWeatherDescription(weatherItem.description ?? ''),
      icon: weatherItem.icon ?? null,
    };
  } catch (error) {
    console.error('OpenWeather 데이터 파싱 중 오류:', error);
    return null;
  }
}

// ---------------------
// 주간 예보 (OpenWeather 5일 예보)
// ---------------------

export async function getWeeklyForecast(): Promise<DailyForecast[] | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    // 서귀포 근처 좌표
    const lat = 33.2541;
    const lon = 126.5600;

    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', 'kr');
    url.searchParams.set('appid', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // 1시간 캐시

    if (!res.ok) {
      console.error('OpenWeather Forecast API 호출 실패:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    if (!data.list || !Array.isArray(data.list)) {
      return null;
    }

    // 일별로 그룹화
    const dailyMap = new Map<string, {
      temps: number[];
      morning: Array<{ pop: number; icon: string; description: string; time: string }>;
      afternoon: Array<{ pop: number; icon: string; description: string; time: string }>;
    }>();

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const hour = date.getHours();

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          temps: [],
          morning: [],
          afternoon: [],
        });
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData.temps.push(item.main.temp);

      const weatherItem = item.weather?.[0];
      if (weatherItem) {
        const entry = {
          pop: Math.round(item.pop * 100), // 강수확률 0-100
          icon: weatherItem.icon,
          description: weatherItem.description,
          time: item.dt_txt,
        };

        // 오전 (6시~12시)
        if (hour >= 6 && hour < 12) {
          dayData.morning.push(entry);
        }
        // 오후 (12시~18시)
        else if (hour >= 12 && hour < 18) {
          dayData.afternoon.push(entry);
        }
      }
    });

    // 날짜 순서대로 정렬
    const sortedDates = Array.from(dailyMap.keys()).sort();
    const today = new Date().toISOString().split('T')[0];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    const forecasts: DailyForecast[] = sortedDates.slice(0, 10).map((dateKey, index) => {
      const dayData = dailyMap.get(dateKey)!;
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay();

      // 오전/오후 데이터 중 가장 높은 강수확률과 대표 아이콘 선택
      const morningPop = dayData.morning.length > 0
        ? Math.max(...dayData.morning.map(m => m.pop))
        : 0;
      const morningIcon = dayData.morning.length > 0
        ? dayData.morning[Math.floor(dayData.morning.length / 2)].icon
        : null;
      const morningDesc = dayData.morning.length > 0
        ? translateWeatherDescription(dayData.morning[Math.floor(dayData.morning.length / 2)].description)
        : '';

      const afternoonPop = dayData.afternoon.length > 0
        ? Math.max(...dayData.afternoon.map(a => a.pop))
        : 0;
      const afternoonIcon = dayData.afternoon.length > 0
        ? dayData.afternoon[Math.floor(dayData.afternoon.length / 2)].icon
        : null;
      const afternoonDesc = dayData.afternoon.length > 0
        ? translateWeatherDescription(dayData.afternoon[Math.floor(dayData.afternoon.length / 2)].description)
        : '';

      let dayName = '';
      if (index === 0) {
        dayName = '오늘';
      } else if (index === 1) {
        dayName = '내일';
      } else {
        dayName = dayNames[dayOfWeek];
      }

      return {
        date: dateKey,
        dayName,
        minTemp: Math.round(Math.min(...dayData.temps)),
        maxTemp: Math.round(Math.max(...dayData.temps)),
        morning: {
          pop: morningPop,
          icon: morningIcon,
          description: morningDesc,
        },
        afternoon: {
          pop: afternoonPop,
          icon: afternoonIcon,
          description: afternoonDesc,
        },
      };
    });

    return forecasts;
  } catch (error) {
    console.error('주간 예보 데이터 파싱 중 오류:', error);
    return null;
  }
}

// ---------------------
// KMA(기상청) 초단기실황
// ---------------------

async function getCurrentWeatherFromKMA(
  serviceKey?: string,
  useDataGoKr: boolean = false
): Promise<WeatherData | null> {
  if (!serviceKey) return null;

  try {
    // 현재 시간 (로컬 시간대 사용, 한국에서 실행 시 이미 KST)
    const now = new Date();
    const currentHour = now.getHours();
    const minute = now.getMinutes();

    // 새벽 시간대(0시~5시)에는 KMA API 데이터가 부족할 수 있으므로 건너뛰기
    // 이 시간대는 OpenWeather API를 사용하는 것이 더 안정적
    if (currentHour >= 0 && currentHour < 6) {
      console.log('[KMA API] 새벽 시간대(0시~5시)는 OpenWeather API로 전환합니다.');
      return null;
    }

    // 서귀포시 정확한 격자 좌표 (기상청 동네예보 격자 기준)
    // 서귀포시 중심부: 위도 33.2541, 경도 126.5600
    // 변환된 격자 좌표: nx=52, ny=33 (기상청 격자 좌표 변환 도구 기준)
    const nx = 52;
    const ny = 33;

    // 초단기실황(base_time: 매시 정각). 40분 이전이면 한 시간 전 자료 사용.
    let baseHour = currentHour;
    if (minute < 40) {
      baseHour -= 1;
    }

    // 자정 이전에서 한 시간 전으로 넘어가면 날짜 -1일
    const baseDateObj = new Date(now.getTime());
    if (baseHour < 0) {
      baseHour = 23;
      baseDateObj.setDate(baseDateObj.getDate() - 1);
    }

    // 여러 시간대를 시도 (최근 6시간 내 데이터, 새벽 시간대 대비)
    const timeAttempts: Array<{ date: string; time: string }> = [];
    
    // 최근 6시간까지 시도 (새벽 시간대에도 데이터가 있을 수 있는 최근 시간대 확인)
    for (let offset = 0; offset <= 6; offset++) {
      const attemptHour = baseHour - offset;
      const attemptDateObj = new Date(baseDateObj.getTime());
      
      if (attemptHour < 0) {
        // 전날로 넘어가는 경우
        attemptDateObj.setDate(attemptDateObj.getDate() - 1);
        const adjustedHour = 24 + attemptHour;
        timeAttempts.push({
          date: formatKmaDate(attemptDateObj),
          time: `${adjustedHour.toString().padStart(2, '0')}00`,
        });
      } else {
        timeAttempts.push({
          date: formatKmaDate(attemptDateObj),
          time: `${attemptHour.toString().padStart(2, '0')}00`,
        });
      }
    }

    // 각 시간대를 시도 (첫 번째 시도만 상세 로그)
    let temperature: number | null = null;
    let ptyFromNcst: string | null = null; // 초단기실황에서 가져온 PTY
    let humidity: number | undefined = undefined;
    let windSpeed: number | undefined = undefined;
    let windDirection: number | undefined = undefined;
    let precipitation: number | undefined = undefined;
    let baseDateForForecast: string | null = null;
    let baseTimeForForecast: string | null = null;
    
    // 초단기실황에서 현재 기온과 추가 정보 가져오기
    for (let i = 0; i < timeAttempts.length; i++) {
      const attempt = timeAttempts[i];
      const isFirstAttempt = i === 0;
      const ncstData = await tryKmaNcstCall(serviceKey, nx, ny, attempt.date, attempt.time, isFirstAttempt, useDataGoKr);
      if (ncstData && ncstData.temperature !== null) {
        temperature = ncstData.temperature;
        ptyFromNcst = ncstData.pty; // 초단기실황에서 PTY도 가져옴
        humidity = ncstData.humidity;
        windSpeed = ncstData.windSpeed;
        windDirection = ncstData.windDirection;
        precipitation = ncstData.precipitation;
        baseDateForForecast = attempt.date;
        baseTimeForForecast = attempt.time;
        break;
      }
    }

    if (temperature === null) {
      return null;
    }

    // 초단기예보에서 SKY, PTY, POP 정보 가져오기
    let sky: string | null = null;
    let pty: string | null = ptyFromNcst; // 초단기실황의 PTY를 기본값으로 사용
    let pop: number | undefined = undefined;
    if (baseDateForForecast && baseTimeForForecast) {
      const forecastData = await tryKmaFcstCall(serviceKey, nx, ny, baseDateForForecast, baseTimeForForecast, useDataGoKr);
      if (forecastData) {
        sky = forecastData.sky;
        // 초단기예보에서 PTY를 가져왔다면 그것을 우선 사용 (더 최신 정보)
        if (forecastData.pty) {
          pty = forecastData.pty;
        }
        if (forecastData.pop !== undefined) {
          pop = forecastData.pop;
        }
      }
    }

    // 초단기예보에서 정보를 가져오지 못한 경우, 단기예보에서 시도
    if (!sky && !pty) {
      const shortTermForecast = await getKmaShortTermWeather(serviceKey, nx, ny, useDataGoKr);
      if (shortTermForecast) {
        sky = shortTermForecast.sky;
        pty = shortTermForecast.pty;
        // 단기예보에서도 POP 가져오기
        if (shortTermForecast.pop !== undefined) {
          pop = shortTermForecast.pop;
        }
      }
    }
    
    // POP이 없으면 단기예보에서 직접 가져오기 시도
    if (pop === undefined) {
      const shortTermForecast = await getKmaShortTermWeather(serviceKey, nx, ny, useDataGoKr);
      if (shortTermForecast && shortTermForecast.pop !== undefined) {
        pop = shortTermForecast.pop;
      }
    }

    const { description, icon } = mapKmaWeatherToDescriptionAndIcon({ sky, pty });

    // 날씨 설명이 없으면 OpenWeather로 fallback
    if (description === '날씨 정보 없음' || !icon) {
      console.log('[KMA API] 날씨 설명 정보가 없어 OpenWeather로 전환합니다.');
      return null;
    }

    // 체감온도 계산 (기온과 풍속이 있을 때)
    let feelsLike: number | undefined = undefined;
    if (temperature !== null && windSpeed !== undefined) {
      feelsLike = calculateFeelsLike(temperature, windSpeed);
    }

    const currentWeather: WeatherData = {
      temperature,
      description,
      icon,
      humidity,
      windSpeed,
      windDirection,
      precipitation,
      pop,
      feelsLike,
    };

    // 단기예보에서 최저/최고 기온 추가
    const minMaxTemp = await getKmaMinMaxTemperature(serviceKey, nx, ny, useDataGoKr);
    if (minMaxTemp) {
      currentWeather.minTemp = minMaxTemp.minTemp;
      currentWeather.maxTemp = minMaxTemp.maxTemp;
    }

    return currentWeather;
  } catch (error) {
    console.error('KMA 데이터 파싱 중 오류:', error);
    return null;
  }
}

// KMA 초단기실황 API 호출 (기온, PTY 및 추가 정보)
async function tryKmaNcstCall(
  serviceKey: string,
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string,
  verbose: boolean = false,
  useDataGoKr: boolean = false
): Promise<{ 
  temperature: number; 
  pty: string | null;
  humidity?: number;
  windSpeed?: number;
  windDirection?: number;
  precipitation?: number;
} | null> {
  try {
    // 공공데이터포털 또는 기상청 API 허브 선택
    const baseUrl = useDataGoKr
      ? 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'
      : 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst';
    
    const url = new URL(baseUrl);

    // 공공데이터포털은 serviceKey, 기상청 API 허브는 authKey 사용
    const keyParam = useDataGoKr ? 'serviceKey' : 'authKey';
    url.searchParams.set(keyParam, serviceKey);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '60');
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('base_date', baseDate);
    url.searchParams.set('base_time', baseTime);
    url.searchParams.set('nx', String(nx));
    url.searchParams.set('ny', String(ny));

    // 디버깅용: 첫 번째 시도만 상세 로그 출력
    if (verbose) {
      console.log('[KMA API] 요청 파라미터:', {
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
        hasServiceKey: !!serviceKey,
      });
    }

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });

    if (!res.ok) {
      if (verbose) {
        console.error('KMA API 호출 실패:', res.status, res.statusText);
        const errorText = await res.text().catch(() => '');
        console.error('KMA API 응답 본문:', errorText);
      }
      return null;
    }

    const json = await res.json();

    if (json?.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      // NO_DATA는 정상적인 경우일 수 있으므로 첫 번째 시도에서만 로그 출력
      if (verbose || json.response.header.resultCode !== '03') {
        console.error(
          'KMA API 응답 오류:',
          json.response.header.resultCode,
          json.response.header.resultMsg
        );
        if (verbose) {
          console.error('KMA API 전체 응답:', JSON.stringify(json, null, 2));
        }
      }
      return null;
    }
    const items: any[] =
      json?.response?.body?.items?.item && Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : [];

    if (!items.length) {
      return null;
    }

    // T1H: 기온, PTY: 강수형태, REH: 습도, WSD: 풍속, VEC: 풍향, RN1: 강수량
    let temperature: number | null = null;
    let pty: string | null = null;
    let humidity: number | undefined = undefined;
    let windSpeed: number | undefined = undefined;
    let windDirection: number | undefined = undefined;
    let precipitation: number | undefined = undefined;

    for (const it of items) {
      const value = Number(it.obsrValue);
      if (it.category === 'T1H' && !Number.isNaN(value)) {
        temperature = value;
      } else if (it.category === 'PTY') {
        pty = String(it.obsrValue);
      } else if (it.category === 'REH' && !Number.isNaN(value)) {
        humidity = value;
      } else if (it.category === 'WSD' && !Number.isNaN(value)) {
        windSpeed = value;
      } else if (it.category === 'VEC' && !Number.isNaN(value)) {
        windDirection = value;
      } else if (it.category === 'RN1' && !Number.isNaN(value)) {
        precipitation = value;
      }
    }

    if (temperature === null) {
      return null;
    }

    return { 
      temperature, 
      pty,
      humidity,
      windSpeed,
      windDirection,
      precipitation,
    };
  } catch (error) {
    console.error('KMA 초단기실황 파싱 중 오류:', error);
    return null;
  }
}

// 체감온도 계산 함수 (Wind Chill Index)
function calculateFeelsLike(temperature: number, windSpeed: number): number {
  // 풍속이 m/s 단위이므로 km/h로 변환
  const windSpeedKmh = windSpeed * 3.6;
  
  // 체감온도 공식 (한국 기상청 기준)
  // 기온이 10℃ 이하이고 풍속이 1.5m/s 이상일 때만 적용
  if (temperature <= 10 && windSpeed >= 1.5) {
    // 체감온도 = 13.12 + 0.6215*T - 11.37*V^0.16 + 0.3965*T*V^0.16
    // T: 기온(℃), V: 풍속(km/h)
    const feelsLike = 13.12 + 0.6215 * temperature - 11.37 * Math.pow(windSpeedKmh, 0.16) + 0.3965 * temperature * Math.pow(windSpeedKmh, 0.16);
    return Math.round(feelsLike * 10) / 10;
  }
  
  // 기온이 높을 때는 습도와 풍속을 고려한 체감온도
  // 간단한 공식: 체감온도 = 기온 + (습도 영향) - (풍속 냉각 효과)
  // 여기서는 기온을 그대로 반환하거나, 풍속이 강할 때 약간 낮춤
  if (windSpeed > 5) {
    return Math.round((temperature - windSpeed * 0.3) * 10) / 10;
  }
  
  return Math.round(temperature * 10) / 10;
}

// KMA 초단기예보 API 호출 (SKY, PTY, POP)
async function tryKmaFcstCall(
  serviceKey: string,
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string,
  useDataGoKr: boolean = false
): Promise<{ sky: string | null; pty: string | null; pop?: number } | null> {
  try {
    // 공공데이터포털 또는 기상청 API 허브 선택
    const baseUrl = useDataGoKr
      ? 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst'
      : 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtFcst';
    
    const url = new URL(baseUrl);

    // 공공데이터포털은 serviceKey, 기상청 API 허브는 authKey 사용
    const keyParam = useDataGoKr ? 'serviceKey' : 'authKey';
    url.searchParams.set(keyParam, serviceKey);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '60');
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('base_date', baseDate);
    url.searchParams.set('base_time', baseTime);
    url.searchParams.set('nx', String(nx));
    url.searchParams.set('ny', String(ny));

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();

    if (json?.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      return null;
    }

    const items: any[] =
      json?.response?.body?.items?.item && Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : [];

    if (!items.length) {
      return null;
    }

    // SKY: 하늘상태, PTY: 강수형태, POP: 강수확률
    // 현재 시간에 가장 가까운 예보 시간(fcstTime)의 데이터 사용
    let sky: string | null = null;
    let pty: string | null = null;
    let pop: number | undefined = undefined;

    // 현재 시간 계산 (HHMM 형식)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute;

    // 가장 가까운 예보 시간 찾기 (6시간 이내)
    // 초단기예보는 6시간 예보이므로, 현재 시간에 가장 가까운 시간대 사용
    let closestTimeDiff = Infinity;
    const timeGroups = new Map<number, any[]>();
    
    // 시간대별로 그룹화
    for (const it of items) {
      const fcstTime = parseInt(it.fcstTime || '0', 10);
      const diff = Math.abs(fcstTime - currentTime);
      if (diff <= 600) { // 6시간 이내
        if (!timeGroups.has(fcstTime)) {
          timeGroups.set(fcstTime, []);
        }
        timeGroups.get(fcstTime)!.push(it);
        if (diff < closestTimeDiff) {
          closestTimeDiff = diff;
        }
      }
    }
    
    // 가장 가까운 시간대의 데이터 사용
    for (const [fcstTime, groupItems] of timeGroups) {
      if (Math.abs(parseInt(String(fcstTime)) - currentTime) === closestTimeDiff) {
        for (const it of groupItems) {
          if (it.category === 'SKY' && !sky) {
            sky = String(it.fcstValue);
          } else if (it.category === 'PTY' && !pty) {
            pty = String(it.fcstValue);
          } else if (it.category === 'POP') {
            const popValue = Number(it.fcstValue);
            if (!Number.isNaN(popValue)) {
              pop = popValue;
            }
          }
        }
        break;
      }
    }

    return { sky, pty, pop };
  } catch (error) {
    console.error('KMA 초단기예보 파싱 중 오류:', error);
    return null;
  }
}

// OpenWeatherMap 한국어 번역을 자연스러운 한국어로 변환
function translateWeatherDescription(description: string): string {
  const translations: Record<string, string> = {
    '튼구름': '구름 많음',
    '약한 비': '가벼운 비',
    '보통 비': '비',
    '강한 비': '폭우',
    '약한 눈': '가벼운 눈',
    '보통 눈': '눈',
    '강한 눈': '폭설',
    '약한 비와 눈': '가벼운 비/눈',
    '보통 비와 눈': '비/눈',
    '강한 비와 눈': '폭우/눈',
    '약한 소나기': '가벼운 소나기',
    '보통 소나기': '소나기',
    '강한 소나기': '폭우',
    '약한 소나기와 눈': '가벼운 소나기/눈',
    '보통 소나기와 눈': '소나기/눈',
    '강한 소나기와 눈': '폭우/눈',
    '약한 천둥번개': '가벼운 천둥번개',
    '보통 천둥번개': '천둥번개',
    '강한 천둥번개': '강한 천둥번개',
    '약한 천둥번개와 비': '가벼운 천둥번개/비',
    '보통 천둥번개와 비': '천둥번개/비',
    '강한 천둥번개와 비': '강한 천둥번개/비',
    '약한 천둥번개와 눈': '가벼운 천둥번개/눈',
    '보통 천둥번개와 눈': '천둥번개/눈',
    '강한 천둥번개와 눈': '강한 천둥번개/눈',
  };

  return translations[description] || description;
}

function formatKmaDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}${m}${day}`;
}

// KMA 단기예보 base_time 계산 (2시부터 3시간 간격)
function getKmaShortTermBaseTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 단기예보 base_time: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300 (2시부터 시작)
  let baseHour = 2;
  if (currentHour >= 2 && currentHour < 5) baseHour = 2;
  else if (currentHour >= 5 && currentHour < 8) baseHour = 5;
  else if (currentHour >= 8 && currentHour < 11) baseHour = 8;
  else if (currentHour >= 11 && currentHour < 14) baseHour = 11;
  else if (currentHour >= 14 && currentHour < 17) baseHour = 14;
  else if (currentHour >= 17 && currentHour < 20) baseHour = 17;
  else if (currentHour >= 20 && currentHour < 23) baseHour = 20;
  else {
    // 23시 이후나 2시 이전이면 전날 2300 사용
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      baseDate: formatKmaDate(yesterday),
      baseTime: '2300',
    };
  }

  return {
    baseDate: formatKmaDate(now),
    baseTime: `${baseHour.toString().padStart(2, '0')}00`,
  };
}

// KMA 단기예보에서 SKY, PTY, POP 정보 가져오기 (fallback용)
async function getKmaShortTermWeather(
  serviceKey: string,
  nx: number,
  ny: number,
  useDataGoKr: boolean = false
): Promise<{ sky: string | null; pty: string | null; pop?: number } | null> {
  try {
    const { baseDate, baseTime } = getKmaShortTermBaseTime();
    
    // 공공데이터포털 또는 기상청 API 허브 선택
    const baseUrl = useDataGoKr
      ? 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
      : 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst';
    
    const url = new URL(baseUrl);

    // 공공데이터포털은 serviceKey, 기상청 API 허브는 authKey 사용
    const keyParam = useDataGoKr ? 'serviceKey' : 'authKey';
    url.searchParams.set(keyParam, serviceKey);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('base_date', baseDate);
    url.searchParams.set('base_time', baseTime);
    url.searchParams.set('nx', String(nx));
    url.searchParams.set('ny', String(ny));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();

    if (json?.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      return null;
    }

    const items: any[] =
      json?.response?.body?.items?.item && Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : [];

    if (!items.length) {
      return null;
    }

    // 현재 시간에 가장 가까운 예보 시간 찾기
    const now = new Date();
    const currentHour = now.getHours();
    const currentTime = currentHour * 100;

    let sky: string | null = null;
    let pty: string | null = null;
    let pop: number | undefined = undefined;

    // 가장 가까운 예보 시간의 SKY, PTY, POP 찾기
    for (const it of items) {
      const fcstTime = parseInt(it.fcstTime || '0', 10);
      // 현재 시간과 가장 가까운 예보 시간 사용 (3시간 이내)
      if (Math.abs(fcstTime - currentTime) <= 300) {
        if (it.category === 'SKY' && !sky) {
          sky = String(it.fcstValue);
        } else if (it.category === 'PTY' && !pty) {
          pty = String(it.fcstValue);
        } else if (it.category === 'POP') {
          const popValue = Number(it.fcstValue);
          if (!Number.isNaN(popValue)) {
            pop = popValue;
          }
        }
      }
    }

    return { sky, pty, pop };
  } catch (error) {
    console.error('KMA 단기예보 SKY/PTY 조회 오류:', error);
    return null;
  }
}

// KMA 단기예보에서 오늘의 최저/최고 기온 가져오기
async function getKmaMinMaxTemperature(
  serviceKey: string,
  nx: number,
  ny: number,
  useDataGoKr: boolean = false
): Promise<{ minTemp: number; maxTemp: number } | null> {
  try {
    const { baseDate, baseTime } = getKmaShortTermBaseTime();
    return await tryKmaForecastCall(serviceKey, nx, ny, baseDate, baseTime, useDataGoKr);
  } catch (error) {
    console.error('KMA 단기예보 최저/최고 기온 조회 오류:', error);
    return null;
  }
}

// KMA 단기예보 API 호출
async function tryKmaForecastCall(
  serviceKey: string,
  nx: number,
  ny: number,
  baseDate: string,
  baseTime: string,
  useDataGoKr: boolean = false
): Promise<{ minTemp: number; maxTemp: number } | null> {
  try {
    // 공공데이터포털 또는 기상청 API 허브 선택
    const baseUrl = useDataGoKr
      ? 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
      : 'https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst';
    
    const url = new URL(baseUrl);

    // 공공데이터포털은 serviceKey, 기상청 API 허브는 authKey 사용
    const keyParam = useDataGoKr ? 'serviceKey' : 'authKey';
    url.searchParams.set(keyParam, serviceKey);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '1000');
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('base_date', baseDate);
    url.searchParams.set('base_time', baseTime);
    url.searchParams.set('nx', String(nx));
    url.searchParams.set('ny', String(ny));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } }); // 1시간 캐시

    if (!res.ok) {
      return null;
    }

    const json = await res.json();

    if (json?.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      return null;
    }

    const items: any[] =
      json?.response?.body?.items?.item && Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : [];

    if (!items.length) {
      return null;
    }

    // 오늘 날짜 (YYYYMMDD)
    const today = baseDate;
    let minTemp: number | null = null;
    let maxTemp: number | null = null;

    // TMN: 일 최저기온, TMX: 일 최고기온
    for (const item of items) {
      if (item.fcstDate === today) {
        if (item.category === 'TMN' && item.fcstTime === '0000') {
          const v = Number(item.fcstValue);
          if (!Number.isNaN(v)) minTemp = v;
        } else if (item.category === 'TMX' && item.fcstTime === '1200') {
          const v = Number(item.fcstValue);
          if (!Number.isNaN(v)) maxTemp = v;
        }
      }
    }

    if (minTemp !== null && maxTemp !== null) {
      return { minTemp, maxTemp };
    }

    return null;
  } catch (error) {
    console.error('KMA 단기예보 파싱 오류:', error);
    return null;
  }
}

function mapKmaWeatherToDescriptionAndIcon({
  sky,
  pty,
}: {
  sky: string | null;
  pty: string | null;
}): { description: string; icon: string | null } {
  // PTY(강수형태) 우선
  if (pty && pty !== '0') {
    switch (pty) {
      case '1':
        return { description: '비', icon: '10d' };
      case '2':
        return { description: '비/눈', icon: '13d' };
      case '3':
        return { description: '눈', icon: '13d' };
      case '4':
        return { description: '소나기', icon: '09d' };
      default:
        return { description: '강수', icon: '10d' };
    }
  }

  // SKY(하늘상태): 1 맑음, 3 구름많음, 4 흐림
  switch (sky) {
    case '1':
      return { description: '맑음', icon: '01d' };
    case '3':
      return { description: '구름 많음', icon: '03d' };
    case '4':
      return { description: '흐림', icon: '04d' };
    default:
      return { description: '날씨 정보 없음', icon: null };
  }
}

