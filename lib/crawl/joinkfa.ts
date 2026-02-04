import { chromium, Browser, Page } from 'playwright';
import { getMatchResults, convertMatchResultToCrawledMatch, getTournamentList } from './api';

export interface CrawledMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  ageGroup: 'U11' | 'U12';
  tournamentName: string;
  round?: string; // 1차/2차 (가능한 경우)
  group?: string; // 조 (가능한 경우)
  matchNumber?: number; // 경기번호 (MATCH_NUMBER)
}

export interface CrawlResult {
  success: boolean;
  matches: CrawledMatch[];
  errors: string[];
  totalMatches: number;
}

/**
 * joinkfa.com에서 경기 결과를 크롤링합니다.
 * 필터 조건: 2026년, 대회 선택, 초등, 제주
 * 대상: U11, U12 "2026 서귀포 칠십리 춘계 유소년 축구 페스티벌"
 * 
 * @param options 크롤링 옵션
 * @param options.tournamentIds 직접 접근할 대회 ID 배열 (예: ['10DB649680F3F92530980C3CC746B339'])
 * @param options.directUrls 직접 접근할 URL 배열 (예: ['https://www.joinkfa.com/service/portal/matchPortal.jsp?mgctype=S&idx=...'])
 */
export async function crawlJoinkfaResults(options?: { 
  headless?: boolean; 
  debug?: boolean; 
  analysisResult?: any;
  tournamentIds?: string[];
  directUrls?: string[];
}): Promise<CrawlResult> {
  const errors: string[] = [];
  const matches: CrawledMatch[] = [];
  let browser: Browser | null = null;
  const headless = options?.headless !== false; // 기본값: true
  const debug = options?.debug === true;
  const analysisResult = options?.analysisResult;
  const tournamentIds = options?.tournamentIds;
  const directUrls = options?.directUrls;

  try {
    // Playwright 브라우저 실행
    browser = await chromium.launch({
      headless,
      timeout: 60000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // Network 요청 가로채기 (API 응답 수집)
    const apiResponses: any[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      // 더 많은 API 엔드포인트 감지
      if (
        url.includes('getMatchList.do') || 
        url.includes('getInitData') ||
        url.includes('getMatch') ||
        url.includes('matchList') ||
        url.includes('matchData') ||
        url.includes('matchResult')
      ) {
        try {
          const json = await response.json();
          apiResponses.push({ url, data: json });
          if (debug) {
            console.log(`[크롤링] API 응답 수집: ${url}`);
          }
        } catch (e) {
          // JSON이 아닌 경우 무시
        }
      }
    });

    // 직접 URL 접근 방식 (우선 시도)
    if (directUrls && directUrls.length > 0) {
      console.log(`[크롤링] 직접 URL 접근 방식 사용: ${directUrls.length}개 URL`);
      for (const url of directUrls) {
        try {
          console.log(`[크롤링] 직접 URL 접근: ${url}`);
          await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 60000,
          });
          await page.waitForTimeout(3000);
          
          // 경기 결과 추출 시도
          const extractedMatches = await extractMatchesFromPage(page, apiResponses);
          matches.push(...extractedMatches);
          
          console.log(`[크롤링] ${url}에서 ${extractedMatches.length}개 경기 수집`);
        } catch (e: any) {
          const errorMsg = `직접 URL 접근 실패 (${url}): ${e.message}`;
          console.error(`[크롤링] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
      if (matches.length > 0) {
        return {
          success: true,
          matches,
          errors,
          totalMatches: matches.length,
        };
      }
    }

    // tournamentId를 사용한 API 직접 호출 방식 (우선 시도)
    if (tournamentIds && tournamentIds.length > 0) {
      console.log(`[크롤링] API 직접 호출 방식 사용: ${tournamentIds.length}개 대회 ID`);
      
      // 먼저 대회 정보 조회 (연령대 확인용)
      let tournamentInfoMap: Map<string, { title: string; ageGroup: 'U11' | 'U12'; startDate: string }> = new Map();
      
      try {
        // 대회 목록 조회를 통해 연령대 정보 확인
        const tournamentListPayload = {
          v_CURPAGENUM: "1",
          v_ROWCOUNTPERPAGE: "100",
          v_ORDERBY: "",
          v_YEAR: "2026",
          v_STYLE: "MATCH",
          v_MGC_IDX: "51", // 초등
          v_AREACODE: "CJ", // 제주
          v_SIGUNGU_CODE: "",
          v_ITEM_CD: "S",
          v_TITLE: "",
          v_TEAMID: "",
          v_USER_ID: ""
        };
        
        const tournaments = await getTournamentList(tournamentListPayload);
        for (const tournament of tournaments) {
          if (tournament.ageGroup !== 'unknown') {
            tournamentInfoMap.set(tournament.idx, {
              title: tournament.title,
              ageGroup: tournament.ageGroup,
              startDate: tournament.startDate,
            });
          }
        }
      } catch (e: any) {
        console.warn(`[크롤링] 대회 정보 조회 실패 (무시하고 진행): ${e.message}`);
      }
      
      // 각 대회 ID에 대해 경기 결과 API 직접 호출
      for (const tournamentId of tournamentIds) {
        try {
          console.log(`[크롤링] API 호출: getMatchSingleList.do (대회 ID: ${tournamentId})`);
          
          // 대회 정보 확인
          const tournamentInfo = tournamentInfoMap.get(tournamentId);
          const ageGroup = tournamentInfo?.ageGroup || 'U11'; // 기본값 U11
          const tournamentName = tournamentInfo?.title || '';
          
          // 대회 시작일에서 년-월 추출 (예: "2026-02-06" -> "2026-02")
          let yearMonth: string | undefined = undefined;
          if (tournamentInfo?.startDate) {
            const startDate = tournamentInfo.startDate;
            if (startDate && startDate.length >= 7) {
              yearMonth = startDate.slice(0, 7); // "YYYY-MM-DD" -> "YYYY-MM"
            }
          }
          
          // 경기 결과 API 호출
          const matchResults = await getMatchResults(tournamentId, undefined, yearMonth);
          
          console.log(`[크롤링] ${tournamentId}에서 ${matchResults.length}개 경기 결과 수집`);
          
          // MatchResult를 CrawledMatch로 변환
          for (const matchResult of matchResults) {
            const crawledMatch = convertMatchResultToCrawledMatch(
              matchResult,
              tournamentName || matchResult.TITLE || '',
              ageGroup
            );
            matches.push(crawledMatch);
          }
          
        } catch (e: any) {
          const errorMsg = `API 호출 실패 (대회 ID: ${tournamentId}): ${e.message}`;
          console.error(`[크롤링] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
      // API 호출로 경기 결과를 수집했다면 반환
      if (matches.length > 0) {
        return {
          success: true,
          matches,
          errors,
          totalMatches: matches.length,
        };
      }
      
      // API 호출이 실패했거나 결과가 없으면 기존 방식으로 폴백
      console.log(`[크롤링] API 호출 결과가 없어 Playwright 방식으로 폴백`);
    }

    // 1. 메인 페이지 접속 (fallback)
    console.log('[크롤링] 메인 페이지 접속 방식 사용 (fallback)...');
    await page.goto('https://www.joinkfa.com/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    // 디버깅: 페이지 제목 및 URL 확인
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`[크롤링] 페이지 제목: ${pageTitle}`);
    console.log(`[크롤링] 현재 URL: ${pageUrl}`);

    // 2. "리그/대회" 영역 클릭
    // 분석 결과가 있으면 우선 사용, 없으면 기본 선택자 사용
    let leagueSelectors: string[] = [];
    
    if (analysisResult?.mainPage?.possibleLeagueSelectors?.length > 0) {
      // 분석 결과에서 찾은 선택자 우선 사용
      leagueSelectors = analysisResult.mainPage.possibleLeagueSelectors;
      console.log(`[크롤링] 분석 결과에서 ${leagueSelectors.length}개 선택자 사용`);
    } else {
      // 기본 선택자들
      leagueSelectors = [
        // 텍스트 기반
        'text=리그/대회',
        'text=/리그.*대회/',
        'text=리그',
        'text=대회',
        'a:has-text("리그/대회")',
        'a:has-text("리그")',
        'a:has-text("대회")',
        // 링크 기반
        'a[href*="league"]',
        'a[href*="tournament"]',
        'a[href*="match"]',
        'a[href*="game"]',
        // 클래스/ID 기반
        '.league-link',
        '#league-link',
        '[class*="league"]',
        '[class*="tournament"]',
        '[id*="league"]',
        '[id*="tournament"]',
        // 버튼/메뉴 기반
        'button:has-text("리그")',
        'button:has-text("대회")',
        '.menu-item:has-text("리그")',
        '.nav-item:has-text("리그")',
        // 이미지 alt 텍스트
        'img[alt*="리그"]',
        'img[alt*="대회"]',
      ];
    }

    let leagueClicked = false;
    let clickedSelector = '';

    // 먼저 모든 링크를 확인하여 디버깅
    try {
      const allLinks = await page.locator('a').all();
      console.log(`[크롤링] 페이지의 링크 수: ${allLinks.length}`);
      
      // 링크 텍스트 확인 (처음 20개만)
      for (let i = 0; i < Math.min(20, allLinks.length); i++) {
        try {
          const linkText = await allLinks[i].textContent();
          const linkHref = await allLinks[i].getAttribute('href');
          if (linkText && (linkText.includes('리그') || linkText.includes('대회'))) {
            console.log(`[크롤링] 발견된 링크: "${linkText.trim()}" -> ${linkHref}`);
          }
        } catch (e) {
          // 무시
        }
      }
    } catch (e) {
      console.log('[크롤링] 링크 확인 중 오류:', e);
    }

    // 각 선택자 시도
    for (const selector of leagueSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          for (const element of elements) {
            try {
              const isVisible = await element.isVisible({ timeout: 1000 });
              if (isVisible) {
                const text = await element.textContent();
                const href = await element.getAttribute('href');
                console.log(`[크롤링] 요소 발견: "${selector}" - 텍스트: "${text?.trim()}", href: "${href}"`);
                
                await element.click();
                await page.waitForTimeout(3000); // 페이지 전환 대기
                
                // URL 변경 확인
                const newUrl = page.url();
                if (newUrl !== pageUrl) {
                  leagueClicked = true;
                  clickedSelector = selector;
                  console.log(`[크롤링] "${selector}" 클릭 성공, 새 URL: ${newUrl}`);
                  break;
                } else {
                  console.log(`[크롤링] "${selector}" 클릭했지만 URL이 변경되지 않음`);
                }
              }
            } catch (e) {
              // 다음 요소 시도
            }
          }
          if (leagueClicked) break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 직접 URL로 접근 시도 (리그/대회 페이지가 알려진 URL이 있는 경우)
    if (!leagueClicked) {
      console.log('[크롤링] 직접 URL 접근 시도...');
      const possibleUrls = [
        'https://www.joinkfa.com/portal/mat/',
        'https://www.joinkfa.com/match/',
        'https://www.joinkfa.com/league/',
        'https://www.joinkfa.com/tournament/',
      ];

      for (const url of possibleUrls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);
          const currentUrl = page.url();
          if (currentUrl.includes('mat') || currentUrl.includes('match') || currentUrl.includes('league')) {
            leagueClicked = true;
            console.log(`[크롤링] 직접 URL 접근 성공: ${currentUrl}`);
            break;
          }
        } catch (e) {
          // 다음 URL 시도
        }
      }
    }

    if (!leagueClicked) {
      // 페이지 HTML 일부를 로깅하여 디버깅
      const bodyText = await page.locator('body').textContent();
      const bodyPreview = bodyText?.substring(0, 1000) || '';
      console.log(`[크롤링] 페이지 본문 미리보기: ${bodyPreview.substring(0, 500)}...`);
      
      // 디버그 모드일 경우 스크린샷 저장
      if (debug) {
        try {
          await page.screenshot({ path: 'crawl-debug-main.png', fullPage: true });
          console.log('[크롤링] 디버그 스크린샷 저장: crawl-debug-main.png');
        } catch (e) {
          console.log('[크롤링] 스크린샷 저장 실패:', e);
        }
      }
      
      // 더 자세한 에러 정보 제공
      const errorDetails = [
        '리그/대회 영역을 찾을 수 없습니다.',
        `페이지 URL: ${pageUrl}`,
        `페이지 제목: ${pageTitle}`,
        '시도한 선택자 수: ' + leagueSelectors.length,
      ].join('\n');
      
      throw new Error(errorDetails);
    }

    // 3. 필터 설정
    console.log('[크롤링] 필터 설정 중...');
    await page.waitForTimeout(3000);
    
    // 현재 페이지 URL 확인
    const filterPageUrl = page.url();
    console.log(`[크롤링] 필터 페이지 URL: ${filterPageUrl}`);

    // 연도: 2026 선택
    const yearSelectors = [
      'select[name*="year"]',
      'select[id*="year"]',
      'select:has(option:has-text("2026"))',
      '#year',
      '[name="year"]',
    ];

    for (const selector of yearSelectors) {
      try {
        const select = page.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          await select.selectOption({ label: '2026' });
          console.log('[크롤링] 연도: 2026 선택 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 리그/대회: "대회" 선택
    const leagueTypeSelectors = [
      'input[value="대회"]',
      'input[type="radio"][value*="대회"]',
      'label:has-text("대회")',
      'select:has(option:has-text("대회"))',
    ];

    for (const selector of leagueTypeSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          if (await element.getAttribute('type') === 'radio') {
            await element.click();
          } else {
            await element.selectOption({ label: '대회' });
          }
          console.log('[크롤링] 리그/대회: 대회 선택 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 등급: "초등" 선택
    const gradeSelectors = [
      'select[name*="grade"]',
      'select[id*="grade"]',
      'select:has(option:has-text("초등"))',
      '#grade',
      '[name="grade"]',
    ];

    for (const selector of gradeSelectors) {
      try {
        const select = page.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          await select.selectOption({ label: '초등' });
          console.log('[크롤링] 등급: 초등 선택 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 시도: "제주" 선택
    const regionSelectors = [
      'select[name*="region"]',
      'select[name*="sido"]',
      'select[id*="region"]',
      'select:has(option:has-text("제주"))',
      '#region',
      '#sido',
      '[name="region"]',
      '[name="sido"]',
    ];

    for (const selector of regionSelectors) {
      try {
        const select = page.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          await select.selectOption({ label: '제주' });
          console.log('[크롤링] 시도: 제주 선택 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 4. 조회/검색 버튼 클릭
    const searchSelectors = [
      'button:has-text("조회")',
      'button:has-text("검색")',
      'input[type="submit"]',
      'button[type="submit"]',
      '#search-btn',
      '.search-btn',
    ];

    let searchClicked = false;
    for (const selector of searchSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          await page.waitForTimeout(3000); // 결과 로딩 대기
          searchClicked = true;
          console.log('[크롤링] 조회 버튼 클릭 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    if (!searchClicked) {
      console.warn('[크롤링] 조회 버튼을 찾을 수 없습니다. 자동으로 진행합니다.');
    }

    // 5. 결과 목록에서 U11, U12 대회 식별
    console.log('[크롤링] 대회 목록 확인 중...');
    await page.waitForTimeout(3000);

    // 대회 목록 추출 (여러 가능한 구조 시도)
    const tournamentSelectors = [
      'table tbody tr',
      '.tournament-list tr',
      '.match-list tr',
      '[class*="tournament"] tr',
      'a:has-text("서귀포 칠십리")',
    ];

    let tournaments: any[] = [];
    for (const selector of tournamentSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          tournaments = elements;
          console.log(`[크롤링] 대회 목록 발견: ${elements.length}개`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // U11, U12 대회 찾기
    const targetTournaments: { name: string; element: any; ageGroup: 'U11' | 'U12' }[] = [];

    for (const tournament of tournaments) {
      try {
        const text = await tournament.textContent();
        if (text && text.includes('서귀포 칠십리') && text.includes('2026')) {
          if (text.includes('U11') || text.includes('u11')) {
            targetTournaments.push({
              name: text.trim(),
              element: tournament,
              ageGroup: 'U11',
            });
          } else if (text.includes('U12') || text.includes('u12')) {
            targetTournaments.push({
              name: text.trim(),
              element: tournament,
              ageGroup: 'U12',
            });
          }
        }
      } catch (e) {
        // 무시
      }
    }

    if (targetTournaments.length === 0) {
      // API 응답에서 대회 찾기 시도
      console.log('[크롤링] API 응답에서 대회 찾기 시도...');
      for (const response of apiResponses) {
        if (response.data && Array.isArray(response.data)) {
          for (const item of response.data) {
            const name = item.name || item.tournamentName || item.title || '';
            if (name.includes('서귀포 칠십리') && name.includes('2026')) {
              if (name.includes('U11') || name.includes('u11')) {
                targetTournaments.push({
                  name,
                  element: null,
                  ageGroup: 'U11',
                });
              } else if (name.includes('U12') || name.includes('u12')) {
                targetTournaments.push({
                  name,
                  element: null,
                  ageGroup: 'U12',
                });
              }
            }
          }
        }
      }
    }

    console.log(`[크롤링] 대상 대회 발견: ${targetTournaments.length}개`);

    // 6. 각 대회의 경기 결과 수집
    for (const tournament of targetTournaments) {
      try {
        console.log(`[크롤링] ${tournament.ageGroup} 대회 경기 결과 수집 중...`);

        // 대회 클릭 (요소가 있는 경우)
        if (tournament.element) {
          await tournament.element.click();
          await page.waitForTimeout(3000);
        }

        // 경기 결과 추출
        const tournamentMatches = await extractMatchResults(page, tournament.ageGroup, tournament.name);
        matches.push(...tournamentMatches);

        console.log(`[크롤링] ${tournament.ageGroup} 대회: ${tournamentMatches.length}개 경기 수집 완료`);
      } catch (e: any) {
        const errorMsg = `${tournament.ageGroup} 대회 크롤링 실패: ${e.message}`;
        console.error(`[크롤링] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // API 응답에서도 경기 결과 추출 시도
    if (matches.length === 0 && apiResponses.length > 0) {
      console.log('[크롤링] API 응답에서 경기 결과 추출 시도...');
      for (const response of apiResponses) {
        if (response.data && Array.isArray(response.data)) {
          for (const item of response.data) {
            try {
              const match = parseMatchFromAPI(item);
              if (match) {
                matches.push(match);
              }
            } catch (e) {
              // 무시
            }
          }
        }
      }
    }

    return {
      success: errors.length === 0 || matches.length > 0,
      matches,
      errors,
      totalMatches: matches.length,
    };
  } catch (error: any) {
    const errorMsg = `크롤링 중 오류 발생: ${error.message}`;
    console.error(`[크롤링] ${errorMsg}`);
    errors.push(errorMsg);
    return {
      success: false,
      matches,
      errors,
      totalMatches: matches.length,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 페이지와 API 응답에서 경기 결과를 추출합니다 (통합 함수).
 */
async function extractMatchesFromPage(
  page: Page,
  apiResponses: any[]
): Promise<CrawledMatch[]> {
  const matches: CrawledMatch[] = [];
  
  // 1. API 응답에서 먼저 추출 시도
  for (const response of apiResponses) {
    if (response.data) {
      // 배열인 경우
      if (Array.isArray(response.data)) {
        for (const item of response.data) {
          const match = parseMatchFromAPI(item);
          if (match) {
            matches.push(match);
          }
        }
      }
      // 객체인 경우 (단일 경기 또는 경기 목록 포함)
      else if (response.data.matches || response.data.matchList || response.data.data) {
        const matchList = response.data.matches || response.data.matchList || response.data.data;
        if (Array.isArray(matchList)) {
          for (const item of matchList) {
            const match = parseMatchFromAPI(item);
            if (match) {
              matches.push(match);
            }
          }
        }
      }
      // 단일 경기 객체인 경우
      else {
        const match = parseMatchFromAPI(response.data);
        if (match) {
          matches.push(match);
        }
      }
    }
  }
  
  // 2. DOM에서 추출 시도 (API 응답이 없는 경우)
  if (matches.length === 0) {
    const pageText = await page.locator('body').textContent().catch(() => '');
    if (pageText && pageText.includes('서귀포 칠십리')) {
      // 연령대 판단
      const ageGroup: 'U11' | 'U12' = pageText.includes('U12') || pageText.includes('u12') ? 'U12' : 'U11';
      const tournamentName = '2026 서귀포 칠십리 춘계 유소년 축구 페스티벌';
      const domMatches = await extractMatchResults(page, ageGroup, tournamentName);
      matches.push(...domMatches);
    }
  }
  
  return matches;
}

/**
 * 페이지에서 경기 결과를 추출합니다.
 */
async function extractMatchResults(
  page: Page,
  ageGroup: 'U11' | 'U12',
  tournamentName: string
): Promise<CrawledMatch[]> {
  const matches: CrawledMatch[] = [];

  // 테이블에서 경기 결과 추출
  const tableSelectors = [
    'table tbody tr',
    '.match-table tr',
    '.result-table tr',
    '[class*="match"] tr',
  ];

  for (const selector of tableSelectors) {
    try {
      const rows = await page.locator(selector).all();
      if (rows.length > 0) {
        for (const row of rows) {
          try {
            const text = await row.textContent();
            if (!text) continue;

            // 점수 패턴 찾기 (예: "2:1", "2 - 1", "2-1")
            const scorePattern = /(\d+)[\s:\-]+(\d+)/;
            const scoreMatch = text.match(scorePattern);
            if (!scoreMatch) continue;

            const homeScore = parseInt(scoreMatch[1]);
            const awayScore = parseInt(scoreMatch[2]);

            // 팀명 추출 (점수 앞뒤 텍스트)
            const parts = text.split(scorePattern);
            const homeTeam = parts[0]?.trim() || '';
            const awayTeam = parts[2]?.trim() || '';

            if (homeTeam && awayTeam) {
              // 날짜/시간 추출 시도
              const dateMatch = text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
              const timeMatch = text.match(/(\d{1,2}):(\d{2})/);

              const date = dateMatch
                ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
                : new Date().toISOString().split('T')[0];

              const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '00:00';

              matches.push({
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                date,
                time,
                ageGroup,
                tournamentName,
              });
            }
          } catch (e) {
            // 행 파싱 실패 시 무시
          }
        }

        if (matches.length > 0) {
          break; // 성공적으로 추출했으면 종료
        }
      }
    } catch (e) {
      // 다음 선택자 시도
    }
  }

  return matches;
}

/**
 * API 응답에서 경기 결과를 파싱합니다.
 */
function parseMatchFromAPI(item: any): CrawledMatch | null {
  try {
    // 팀명 추출 (더 많은 변형 지원)
    // KFA API는 보통 한글 필드명을 사용할 수 있으므로 추가 확인
    const homeTeam = 
      item.homeTeam || 
      item.home_team || 
      item.homeTeamName || 
      item.HOME_TEAM ||
      item.HOME_TEAM_NM ||
      item.homeTeamNm ||
      item.homeTeamName ||
      item.team1Name ||
      item.team1 ||
      item['홈팀'] ||
      item['홈팀명'] ||
      item['HOME_TEAM_NM'] ||
      item['homeTeamNm'] ||
      '';

    const awayTeam = 
      item.awayTeam || 
      item.away_team || 
      item.awayTeamName || 
      item.AWAY_TEAM ||
      item.AWAY_TEAM_NM ||
      item.awayTeamNm ||
      item.awayTeamName ||
      item.team2Name ||
      item.team2 ||
      item['원정팀'] ||
      item['원정팀명'] ||
      item['AWAY_TEAM_NM'] ||
      item['awayTeamNm'] ||
      '';

    if (!homeTeam || !awayTeam) return null;

    // 점수 추출 (더 많은 변형 지원)
    const homeScore = parseInt(
      item.homeScore || 
      item.home_score || 
      item.homeScoreValue || 
      item.HOME_SCORE ||
      item.HOME_SCORE_VAL ||
      item.team1Score ||
      item.score1 ||
      item['홈점수'] ||
      item['HOME_SCORE'] ||
      item['homeScore'] ||
      '0'
    );
    
    const awayScore = parseInt(
      item.awayScore || 
      item.away_score || 
      item.awayScoreValue || 
      item.AWAY_SCORE ||
      item.AWAY_SCORE_VAL ||
      item.team2Score ||
      item.score2 ||
      item['원정점수'] ||
      item['AWAY_SCORE'] ||
      item['awayScore'] ||
      '0'
    );

    // 점수가 둘 다 0이면 경기가 종료되지 않은 것으로 간주 (하지만 일단 포함)
    // if (homeScore === 0 && awayScore === 0) return null;

    // 날짜/시간 파싱 (더 많은 변형 지원)
    const dateStr = 
      item.date || 
      item.matchDate || 
      item.gameDate || 
      item.MATCH_DATE ||
      item.GAME_DATE ||
      item.matchDt ||
      item.gameDt ||
      '';
    
    const timeStr = 
      item.time || 
      item.matchTime || 
      item.gameTime || 
      item.MATCH_TIME ||
      item.GAME_TIME ||
      item.matchTm ||
      item.gameTm ||
      '';

    let date = new Date().toISOString().split('T')[0];
    if (dateStr) {
      // 다양한 날짜 형식 지원
      const dateMatch = dateStr.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
      if (dateMatch) {
        date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
      } else {
        // YYYYMMDD 형식
        const dateMatch2 = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
        if (dateMatch2) {
          date = `${dateMatch2[1]}-${dateMatch2[2]}-${dateMatch2[3]}`;
        }
      }
    }

    let time = '00:00';
    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
      } else {
        // HHMM 형식
        const timeMatch2 = timeStr.match(/(\d{2})(\d{2})/);
        if (timeMatch2) {
          time = `${timeMatch2[1]}:${timeMatch2[2]}`;
        }
      }
    }

    // 연령대 추출 (더 많은 변형 지원)
    const tournamentName = 
      item.tournamentName || 
      item.name || 
      item.title || 
      item.TOURNAMENT_NAME ||
      item.tournamentNm ||
      '';
    
    let ageGroup: 'U11' | 'U12' = 'U11';
    const ageGroupStr = 
      item.ageGroup || 
      item.age_group || 
      item.AGE_GROUP ||
      tournamentName;
    
    if (ageGroupStr && (ageGroupStr.includes('U12') || ageGroupStr.includes('u12') || ageGroupStr.includes('12'))) {
      ageGroup = 'U12';
    } else if (ageGroupStr && (ageGroupStr.includes('U11') || ageGroupStr.includes('u11') || ageGroupStr.includes('11'))) {
      ageGroup = 'U11';
    }

    // 리그/조 정보 추출
    const round = 
      item.round || 
      item.ROUND || 
      item.roundName || 
      item.ROUND_NM ||
      '';
    
    const group = 
      item.group || 
      item.GROUP || 
      item.groupName || 
      item.GROUP_NM ||
      item.groupName ||
      '';

    return {
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      date,
      time,
      ageGroup,
      tournamentName: tournamentName || '2026 서귀포 칠십리 춘계 유소년 축구 페스티벌',
      round: round || undefined,
      group: group || undefined,
    };
  } catch (e) {
    return null;
  }
}
