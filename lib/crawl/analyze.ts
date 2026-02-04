import { chromium, Browser, Page } from 'playwright';

/**
 * joinkfa.com 페이지 구조를 분석합니다.
 */
export async function analyzeJoinkfaPage(): Promise<{
  mainPage: {
    url: string;
    title: string;
    links: Array<{ text: string; href: string; selector: string }>;
    buttons: Array<{ text: string; selector: string }>;
    possibleLeagueSelectors: string[];
  };
  filterPage?: {
    url: string;
    title: string;
    selects: Array<{ name: string; id: string; options: string[] }>;
    inputs: Array<{ type: string; name: string; id: string; value: string }>;
    buttons: Array<{ text: string; type: string; selector: string }>;
  };
  tournaments?: Array<{
    name: string;
    ageGroup: 'U11' | 'U12' | 'unknown';
    url?: string;
    id?: string;
  }>;
}> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: false, // 브라우저를 보이게 하여 확인
      timeout: 60000,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    // 1. 메인 페이지 접속
    console.log('[분석] joinkfa.com 메인 페이지 접속 중...');
    
    // User-Agent 설정 (봇 차단 방지)
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    await page.goto('https://www.joinkfa.com/', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    // JavaScript 실행 완료 대기
    console.log('[분석] JavaScript 실행 대기 중...');
    
    // 여러 방법으로 페이지 로딩 확인
    try {
      // 방법 1: networkidle 대기
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('[분석] networkidle 완료');
    } catch (e) {
      console.log('[분석] networkidle 타임아웃, 계속 진행...');
    }
    
    // 방법 2: 특정 요소가 나타날 때까지 대기
    const possibleSelectors = [
      'body',
      'main',
      '#app',
      '.container',
      '[class*="main"]',
      '[id*="main"]',
    ];
    
    let elementFound = false;
    for (const selector of possibleSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`[분석] 요소 발견: ${selector}`);
        elementFound = true;
        break;
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (!elementFound) {
      console.log('[분석] 특정 요소를 찾지 못했습니다. 기본 대기 시간 사용...');
    }
    
    // 추가 대기 시간 (동적 콘텐츠 로딩)
    console.log('[분석] 동적 콘텐츠 로딩 대기 중... (10초)');
    await page.waitForTimeout(10000);
    
    // 페이지가 실제로 렌더링되었는지 확인
    const bodyVisible = await page.evaluate(() => {
      const body = document.body;
      if (!body) return false;
      
      // body에 실제 콘텐츠가 있는지 확인
      const hasContent = body.children.length > 0 || body.innerText.trim().length > 0;
      const isVisible = body.offsetWidth > 0 && body.offsetHeight > 0;
      
      return hasContent && isVisible;
    });
    
    console.log(`[분석] 페이지 렌더링 확인: ${bodyVisible ? '성공' : '실패'}`);
    
    if (!bodyVisible) {
      console.log('[분석] 페이지가 렌더링되지 않았습니다. 추가 대기...');
      await page.waitForTimeout(5000);
    }
    
    // 페이지가 완전히 로드될 때까지 대기
    try {
      await page.waitForSelector('body', { state: 'attached', timeout: 10000 });
      const bodyContent = await page.locator('body').textContent();
      console.log(`[분석] 페이지 본문 길이: ${bodyContent?.length || 0}자`);
      
      // 페이지 HTML 일부 확인
      const htmlContent = await page.content();
      console.log(`[분석] 페이지 HTML 길이: ${htmlContent.length}자`);
      
      // iframe 확인
      const iframes = await page.locator('iframe').all();
      console.log(`[분석] iframe 수: ${iframes.length}개`);
      if (iframes.length > 0) {
        for (let i = 0; i < iframes.length; i++) {
          try {
            const iframeSrc = await iframes[i].getAttribute('src');
            console.log(`[분석] iframe ${i + 1} src: ${iframeSrc}`);
          } catch (e) {
            // 무시
          }
        }
      }
      
      // Shadow DOM 확인 (간접적으로)
      const shadowHosts = await page.evaluate(() => {
        const hosts: string[] = [];
        document.querySelectorAll('*').forEach((el) => {
          if (el.shadowRoot) {
            hosts.push(el.tagName);
          }
        });
        return hosts;
      });
      if (shadowHosts.length > 0) {
        console.log(`[분석] Shadow DOM 호스트: ${shadowHosts.join(', ')}`);
      }
      
      // 스크린샷 저장 (디버깅용) - 페이지가 완전히 로드된 후
      try {
        // 추가 대기 후 스크린샷
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'analyze-debug.png', fullPage: true });
        console.log('[분석] 스크린샷 저장: analyze-debug.png');
        
        // 스크린샷이 제대로 찍혔는지 확인 (파일 크기 체크는 불가능하지만 로그로 확인)
        const screenshotInfo = await page.evaluate(() => {
          return {
            bodyHeight: document.body.scrollHeight,
            bodyWidth: document.body.scrollWidth,
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
          };
        });
        console.log(`[분석] 페이지 크기: ${screenshotInfo.bodyWidth}x${screenshotInfo.bodyHeight}`);
      } catch (e) {
        console.log('[분석] 스크린샷 저장 실패:', e);
      }
      
      // 페이지의 모든 텍스트 콘텐츠 확인
      const allText = await page.evaluate(() => {
        return document.body.innerText || document.body.textContent || '';
      });
      console.log(`[분석] 페이지 텍스트 길이: ${allText.length}자`);
      if (allText.length > 0) {
        const textPreview = allText.substring(0, 500);
        console.log(`[분석] 페이지 텍스트 미리보기: ${textPreview}...`);
        
        // "리그", "대회" 키워드가 있는지 확인
        if (allText.includes('리그') || allText.includes('대회')) {
          console.log('[분석] 페이지에 "리그" 또는 "대회" 텍스트 발견');
        }
      }
    } catch (e) {
      console.log('[분석] body 요소 확인 실패:', e);
    }

    const mainPage = {
      url: page.url(),
      title: await page.title(),
      links: [] as Array<{ text: string; href: string; selector: string }>,
      buttons: [] as Array<{ text: string; selector: string }>,
      possibleLeagueSelectors: [] as string[],
    };

    // 모든 링크 수집 (여러 방법 시도)
    console.log('[분석] 링크 수집 중...');
    
    // 방법 1: 일반적인 a 태그
    let allLinks = await page.locator('a').all();
    console.log(`[분석] 방법 1 - a 태그: ${allLinks.length}개`);
    
    // 방법 2: JavaScript로 동적 생성된 링크도 포함
    if (allLinks.length === 0) {
      console.log('[분석] JavaScript로 생성된 링크 확인 중...');
      await page.waitForTimeout(2000);
      allLinks = await page.locator('a').all();
      console.log(`[분석] 재시도 - a 태그: ${allLinks.length}개`);
    }
    
    // 방법 3: JavaScript로 직접 DOM 조회 (동적 생성된 요소 포함)
    console.log('[분석] JavaScript로 DOM 직접 조회 중...');
    
    // 더 긴 대기 시간 (동적 콘텐츠 로딩)
    await page.waitForTimeout(5000);
    
    const jsElements = await page.evaluate(() => {
      const elements: Array<{ tag: string; text: string; href: string; id: string; className: string; outerHTML: string }> = [];
      
      // 모든 가능한 선택자 시도
      const selectors = [
        'a',
        'button',
        'input[type="button"]',
        'input[type="submit"]',
        '[onclick]',
        '[role="button"]',
        '[class*="link"]',
        '[class*="btn"]',
        '[class*="menu"]',
        '[class*="nav"]',
        'div[onclick]',
        'span[onclick]',
        '[data-href]',
        '[data-url]',
      ];
      
      selectors.forEach((selector) => {
        try {
          document.querySelectorAll(selector).forEach((el) => {
            const text = el.textContent?.trim() || '';
            const href = (el as HTMLElement).getAttribute('href') || 
                        (el as HTMLElement).getAttribute('data-href') ||
                        (el as HTMLElement).getAttribute('data-url') || '';
            const id = el.id || '';
            const className = el.className?.toString() || '';
            const outerHTML = el.outerHTML.substring(0, 200); // 처음 200자만
            
            // 텍스트나 href가 있으면 추가
            if (text || href || id || className) {
              elements.push({ tag: el.tagName.toLowerCase(), text, href, id, className, outerHTML });
            }
          });
        } catch (e) {
          // 선택자 오류 무시
        }
      });
      
      return elements;
    });
    console.log(`[분석] JavaScript로 찾은 클릭 가능한 요소: ${jsElements.length}개`);
    
    // 발견된 요소 중 "리그" 또는 "대회"가 포함된 것만 로깅
    const relevantElements = jsElements.filter(e => 
      e.text.includes('리그') || 
      e.text.includes('대회') || 
      e.href.includes('league') || 
      e.href.includes('tournament') ||
      e.href.includes('match')
    );
    if (relevantElements.length > 0) {
      console.log(`[분석] 관련 요소 발견: ${relevantElements.length}개`);
      relevantElements.slice(0, 5).forEach((elem, idx) => {
        console.log(`[분석] 관련 요소 ${idx + 1}: ${elem.tag} - "${elem.text}" - ${elem.href}`);
      });
    }
    
    // JavaScript로 찾은 요소들을 링크 목록에 추가
    for (const elem of jsElements) {
      if (elem.href || elem.text) {
        // 실제 locator를 생성하여 추가
        try {
          let selector = '';
          if (elem.id) {
            selector = `#${elem.id}`;
          } else if (elem.className) {
            const firstClass = elem.className.split(' ')[0];
            if (firstClass) {
              selector = `.${firstClass}`;
            }
          }
          
          if (selector) {
            const locator = page.locator(selector).first();
            const count = await locator.count();
            if (count > 0 && !allLinks.some(l => l === locator)) {
              allLinks.push(locator);
            }
          }
          
          // 링크 정보도 직접 저장 (locator가 실패한 경우 대비)
          mainPage.links.push({
            text: elem.text,
            href: elem.href,
            selector: selector || `${elem.tag}:has-text("${elem.text.substring(0, 30)}")`,
          });
        } catch (e) {
          // locator 생성 실패해도 정보는 저장
          mainPage.links.push({
            text: elem.text,
            href: elem.href,
            selector: `${elem.tag}:has-text("${elem.text.substring(0, 30)}")`,
          });
        }
      }
    }
    
    console.log(`[분석] 최종 링크 수: ${allLinks.length}개 (JavaScript 포함: ${mainPage.links.length}개)`);
    for (const link of allLinks) {
      try {
        let text = '';
        let href = '';
        let selector = '';
        
        try {
          text = (await link.textContent())?.trim() || '';
        } catch (e) {
          // textContent가 함수가 아닌 경우
          if (typeof link === 'object' && 'text' in link) {
            text = (link as any).text || '';
          }
        }
        
        try {
          href = (await link.getAttribute('href')) || '';
        } catch (e) {
          if (typeof link === 'object' && 'href' in link) {
            href = (link as any).href || '';
          }
        }
        
        try {
          selector = await link.evaluate((el: any) => {
            const id = el.id ? `#${el.id}` : '';
            const classes = el.className ? `.${String(el.className).split(' ').join('.')}` : '';
            return `a${id}${classes}`;
          });
        } catch (e) {
          // evaluate가 실패하면 기본 선택자 생성
          if (typeof link === 'object' && 'id' in link) {
            const id = (link as any).id ? `#${(link as any).id}` : '';
            const className = (link as any).className ? `.${String((link as any).className).split(' ').join('.')}` : '';
            selector = `a${id}${className}`;
          } else {
            selector = `a:has-text("${text}")`;
          }
        }

        if (text || href) {
          mainPage.links.push({ text, href, selector });
          
          // 리그/대회 관련 링크 찾기 (더 유연한 검색)
          const textLower = text.toLowerCase();
          const hrefLower = href.toLowerCase();
          
          if (
            text.includes('리그') ||
            text.includes('대회') ||
            text.includes('경기') ||
            text.includes('league') ||
            text.includes('tournament') ||
            text.includes('match') ||
            textLower.includes('league') ||
            textLower.includes('tournament') ||
            textLower.includes('match') ||
            href.includes('league') ||
            href.includes('tournament') ||
            href.includes('match') ||
            href.includes('리그') ||
            href.includes('대회') ||
            href.includes('경기') ||
            selector.includes('league') ||
            selector.includes('tournament')
          ) {
            // 여러 형태의 선택자 추가
            if (text) {
              mainPage.possibleLeagueSelectors.push(`a:has-text("${text}")`);
              mainPage.possibleLeagueSelectors.push(`text="${text}"`);
            }
            if (href) {
              mainPage.possibleLeagueSelectors.push(`a[href="${href}"]`);
              mainPage.possibleLeagueSelectors.push(`a[href*="${href.split('/').pop()}"]`);
            }
            if (selector) {
              mainPage.possibleLeagueSelectors.push(selector);
            }
          }
        }
      } catch (e) {
        // 무시
      }
    }

    // 모든 버튼 수집
    console.log('[분석] 버튼 수집 중...');
    const allButtons = await page.locator('button, input[type="button"], input[type="submit"]').all();
    for (const button of allButtons) {
      try {
        const text = (await button.textContent())?.trim() || '';
        const selector = await button.evaluate((el) => {
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
          const tag = el.tagName.toLowerCase();
          return `${tag}${id}${classes}`;
        });

        if (text) {
          mainPage.buttons.push({ text, selector });
          
          if (text.includes('리그') || text.includes('대회') || text.includes('경기')) {
            mainPage.possibleLeagueSelectors.push(`button:has-text("${text}")`);
          }
        }
      } catch (e) {
        // 무시
      }
    }

    // 클릭 가능한 div/span 등도 확인
    console.log('[분석] 클릭 가능한 요소 수집 중...');
    const clickableElements = await page.locator('[onclick], [role="button"], .clickable, [class*="btn"], [class*="link"]').all();
    for (const element of clickableElements) {
      try {
        const text = (await element.textContent())?.trim() || '';
        if (text && (text.includes('리그') || text.includes('대회'))) {
          const selector = await element.evaluate((el) => {
            const id = el.id ? `#${el.id}` : '';
            const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
            const tag = el.tagName.toLowerCase();
            return `${tag}${id}${classes}`;
          });
          mainPage.possibleLeagueSelectors.push(`text="${text}"`);
        }
      } catch (e) {
        // 무시
      }
    }

    console.log(`[분석] 메인 페이지 분석 완료: ${mainPage.links.length}개 링크, ${mainPage.buttons.length}개 버튼`);
    console.log(`[분석] 가능한 리그/대회 선택자: ${mainPage.possibleLeagueSelectors.length}개`);
    
    // 발견된 링크 로깅 (디버깅용)
    if (mainPage.links.length > 0) {
      console.log('[분석] 발견된 링크 목록:');
      mainPage.links.forEach((link, idx) => {
        console.log(`  ${idx + 1}. "${link.text}" -> ${link.href} (${link.selector})`);
      });
    }
    
    // iframe 내부 링크 확인
    console.log('[분석] iframe 내부 링크 확인 중...');
    const iframes = await page.locator('iframe').all();
    for (let i = 0; i < iframes.length; i++) {
      try {
        const iframeSrc = await iframes[i].getAttribute('src');
        if (iframeSrc && iframeSrc.includes('mainPortal')) {
          console.log(`[분석] 메인 포털 iframe 발견: ${iframeSrc}`);
          
          // iframe 내부로 접근
          const iframeElement = await iframes[i].contentFrame();
          if (iframeElement) {
            console.log('[분석] iframe 내부 접근 성공');
            
            // iframe 내부의 링크 찾기
            const iframeLinks = await iframeElement.locator('a').all();
            console.log(`[분석] iframe 내부 링크: ${iframeLinks.length}개`);
            
            for (const iframeLink of iframeLinks) {
              try {
                const text = (await iframeLink.textContent())?.trim() || '';
                const href = (await iframeLink.getAttribute('href')) || '';
                
                if (text || href) {
                  const selector = await iframeLink.evaluate((el: any) => {
                    const id = el.id ? `#${el.id}` : '';
                    const classes = el.className ? `.${String(el.className).split(' ').join('.')}` : '';
                    return `a${id}${classes}`;
                  }).catch(() => `a:has-text("${text}")`);
                  
                  mainPage.links.push({ text, href, selector });
                  
                  // "리그/대회" 관련 링크 찾기 (정확 일치 우선)
                  const isExactMatch = text === '리그/대회' || text.trim() === '리그/대회';
                  const isRelated = (
                    text.includes('리그') ||
                    text.includes('대회') ||
                    text.includes('경기') ||
                    href.includes('league') ||
                    href.includes('tournament') ||
                    href.includes('match')
                  );
                  
                  if (isExactMatch || isRelated) {
                    // 정확 일치는 맨 앞에 추가
                    if (isExactMatch) {
                      mainPage.possibleLeagueSelectors.unshift(`iframe >> a:has-text("리그/대회")`);
                      if (href && href !== 'javascript:;' && href !== '#') {
                        mainPage.possibleLeagueSelectors.unshift(`iframe >> a[href="${href}"]`);
                      }
                      // onclick도 확인
                      try {
                        const onclick = await iframeLink.getAttribute('onclick').catch(() => null);
                        if (onclick) {
                          mainPage.possibleLeagueSelectors.unshift(`iframe >> a[onclick*="${onclick.substring(0, 30)}"]`);
                        }
                      } catch (e) {
                        // 무시
                      }
                    } else {
                      mainPage.possibleLeagueSelectors.push(`iframe >> a:has-text("${text}")`);
                      if (href && href !== 'javascript:;' && href !== '#') {
                        mainPage.possibleLeagueSelectors.push(`iframe >> a[href="${href}"]`);
                      }
                    }
                  }
                }
              } catch (e) {
                // 무시
              }
            }
            
            // iframe 내부의 버튼도 찾기
            const iframeButtons = await iframeElement.locator('button, [onclick], [role="button"]').all();
            console.log(`[분석] iframe 내부 버튼: ${iframeButtons.length}개`);
            
            for (const iframeButton of iframeButtons) {
              try {
                const text = (await iframeButton.textContent())?.trim() || '';
                if (text && (text.includes('리그') || text.includes('대회'))) {
                  const selector = await iframeButton.evaluate((el: any) => {
                    const id = el.id ? `#${el.id}` : '';
                    const classes = el.className ? `.${String(el.className).split(' ').join('.')}` : '';
                    return `${el.tagName.toLowerCase()}${id}${classes}`;
                  }).catch(() => `iframe >> text="${text}"`);
                  
                  mainPage.buttons.push({ text, selector });
                  mainPage.possibleLeagueSelectors.push(`iframe >> text="${text}"`);
                }
              } catch (e) {
                // 무시
              }
            }
          }
        }
      } catch (e) {
        console.log(`[분석] iframe ${i + 1} 처리 실패:`, e);
      }
    }
    
    // "리그/대회" 텍스트가 포함된 링크 직접 검색
    const leagueLinks = mainPage.links.filter(link => 
      link.text.includes('리그') || 
      link.text.includes('대회') ||
      link.text.includes('경기') ||
      link.href.includes('league') ||
      link.href.includes('tournament') ||
      link.href.includes('match')
    );
    
    if (leagueLinks.length > 0) {
      console.log(`[분석] "리그/대회" 관련 링크 발견: ${leagueLinks.length}개`);
      leagueLinks.forEach((link, idx) => {
        console.log(`  ${idx + 1}. "${link.text}" -> ${link.href}`);
        // 선택자 추가
        if (!mainPage.possibleLeagueSelectors.includes(`a:has-text("${link.text}")`)) {
          mainPage.possibleLeagueSelectors.push(`a:has-text("${link.text}")`);
        }
        if (link.href && !mainPage.possibleLeagueSelectors.includes(`a[href="${link.href}"]`)) {
          mainPage.possibleLeagueSelectors.push(`a[href="${link.href}"]`);
        }
      });
      console.log(`[분석] 업데이트된 선택자 수: ${mainPage.possibleLeagueSelectors.length}개`);
    } else {
      console.log('[분석] "리그/대회" 관련 링크를 찾지 못했습니다.');
      
      // iframe 내부 직접 URL 접근 시도
      console.log('[분석] iframe URL로 직접 접근 시도...');
      const mainPortalUrl = 'https://www.joinkfa.com/service/portal/mainPortal.jsp';
      try {
        await page.goto(mainPortalUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        console.log(`[분석] 직접 접근 성공: ${page.url()}`);
        
        // 다시 링크 수집
        const directLinks = await page.locator('a').all();
        console.log(`[분석] 직접 접근 후 링크: ${directLinks.length}개`);
        
        for (const link of directLinks) {
          try {
            const text = (await link.textContent())?.trim() || '';
            const href = (await link.getAttribute('href')) || '';
            const onclick = (await link.getAttribute('onclick')) || '';
            
            // "리그/대회" 정확히 일치하는 링크 찾기
            if (text === '리그/대회' || text.trim() === '리그/대회') {
              console.log(`[분석] "리그/대회" 정확 일치 링크 발견: "${text}" -> ${href}, onclick: ${onclick}`);
              
              mainPage.links.push({ text, href, selector: `a:has-text("${text}")` });
              mainPage.possibleLeagueSelectors.push(`a:has-text("리그/대회")`);
              
              // onclick이 있으면 실행 시도
              if (onclick) {
                mainPage.possibleLeagueSelectors.push(`a[onclick*="${onclick.substring(0, 20)}"]`);
              }
              
              // href가 javascript:;가 아닌 경우
              if (href && href !== 'javascript:;' && href !== '#') {
                mainPage.possibleLeagueSelectors.push(`a[href="${href}"]`);
              }
            } else if (text && (text.includes('리그') || text.includes('대회'))) {
              // 부분 일치도 저장하되 우선순위는 낮음
              mainPage.links.push({ text, href, selector: `a:has-text("${text}")` });
              if (text === '리그/대회' || text.includes('리그/대회')) {
                mainPage.possibleLeagueSelectors.push(`a:has-text("${text}")`);
              }
              console.log(`[분석] "리그/대회" 관련 링크 발견: "${text}" -> ${href}`);
            }
          } catch (e) {
            // 무시
          }
        }
        
        // "리그/대회" 정확 일치 링크가 없으면 onclick 이벤트로 찾기
        if (mainPage.possibleLeagueSelectors.length === 0) {
          console.log('[분석] onclick 이벤트로 "리그/대회" 찾기 시도...');
          const onclickElements = await page.evaluate(() => {
            const elements: Array<{ text: string; onclick: string; tag: string }> = [];
            document.querySelectorAll('[onclick]').forEach((el) => {
              const text = el.textContent?.trim() || '';
              const onclick = (el as HTMLElement).getAttribute('onclick') || '';
              if (text.includes('리그') && text.includes('대회')) {
                elements.push({ text, onclick, tag: el.tagName.toLowerCase() });
              }
            });
            return elements;
          });
          
          if (onclickElements.length > 0) {
            console.log(`[분석] onclick으로 "리그/대회" 요소 발견: ${onclickElements.length}개`);
            onclickElements.forEach((elem, idx) => {
              console.log(`  ${idx + 1}. "${elem.text}" - onclick: ${elem.onclick.substring(0, 50)}`);
              mainPage.possibleLeagueSelectors.push(`[onclick*="${elem.onclick.substring(0, 30)}"]`);
            });
          }
        }
      } catch (e) {
        console.log('[분석] 직접 접근 실패:', e);
      }
    }

    // 리그/대회 링크 클릭 시도
    let filterPage = undefined;
    
    // "리그/대회" 정확 일치 링크 우선 시도
    // 1순위: iframe 내부 "리그/대회" 정확 일치 링크
    // 2순위: iframe 내부 "리그/대회" 포함 링크
    // 3순위: 일반 "리그/대회" 링크
    const exactMatchInIframe = mainPage.links.filter(link => 
      link.text === '리그/대회' || link.text.trim() === '리그/대회'
    );
    const exactMatchSelectors = exactMatchInIframe.length > 0 
      ? mainPage.possibleLeagueSelectors.filter(s => s.includes('iframe') && (s.includes('리그/대회') || (s.includes('리그') && s.includes('대회'))))
      : mainPage.possibleLeagueSelectors.filter(s => s.includes('리그/대회') || (s.includes('리그') && s.includes('대회')));
    const otherSelectors = mainPage.possibleLeagueSelectors.filter(s => !exactMatchSelectors.includes(s));
    
    const selectorsToTry = [...exactMatchSelectors, ...otherSelectors].slice(0, 20);
    
    // 방법 1: iframe URL로 직접 접근 시도 (가장 안정적)
    console.log('[분석] iframe URL로 직접 접근 시도...');
    const mainPortalUrl = 'https://www.joinkfa.com/service/portal/mainPortal.jsp';
    try {
      await page.goto(mainPortalUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      console.log(`[분석] 직접 접근 성공: ${page.url()}`);
      
      // "리그/대회" 링크 찾기
      const directLinks = await page.locator('a').all();
      console.log(`[분석] 직접 접근 후 링크: ${directLinks.length}개`);
      
      let leagueLinkFound = false;
      for (const link of directLinks) {
        try {
          const text = (await link.textContent())?.trim() || '';
          const href = (await link.getAttribute('href')) || '';
          const onclick = (await link.getAttribute('onclick')) || '';
          
          // "리그/대회" 정확히 일치하는 링크 찾기
          if (text === '리그/대회' || text.trim() === '리그/대회' || text.includes('리그/대회')) {
            console.log(`[분석] "리그/대회" 링크 발견: "${text}" -> ${href}, onclick: ${onclick.substring(0, 50)}`);
            
            // 링크 클릭 시도
            try {
              if (onclick) {
                // onclick 실행
                await link.evaluate((el: any) => {
                  const onclickStr = el.getAttribute('onclick');
                  if (onclickStr) {
                    eval(onclickStr);
                  }
                });
              } else {
                await link.click();
              }
              
              await page.waitForTimeout(3000);
              const newUrl = page.url();
              console.log(`[분석] 페이지 이동 성공 (직접 접근): ${newUrl}`);
              
              if (newUrl !== mainPortalUrl && (newUrl.includes('match') || newUrl.includes('league') || newUrl.includes('portal'))) {
                leagueLinkFound = true;
                break;
              }
            } catch (e) {
              console.log(`[분석] 링크 클릭 실패:`, e);
            }
          }
        } catch (e) {
          // 무시
        }
      }
      
      if (leagueLinkFound) {
        // 필터 페이지 분석으로 진행
        filterPage = {
          url: page.url(),
          title: await page.title(),
          selects: [] as Array<{ name: string; id: string; options: string[] }>,
          inputs: [] as Array<{ type: string; name: string; id: string; value: string }>,
          buttons: [] as Array<{ text: string; type: string; selector: string }>,
        };
        
        await page.waitForTimeout(2000);
        
        // iframe 내부 확인
        const pageIframes = await page.locator('iframe').all();
        let actualPage = page;
        if (pageIframes.length > 0) {
          for (const iframe of pageIframes) {
            try {
              const iframeSrc = await iframe.getAttribute('src');
              if (iframeSrc && (
                iframeSrc.includes('match') || 
                iframeSrc.includes('league') || 
                iframeSrc.includes('tournament') ||
                iframeSrc.includes('portal') ||
                iframeSrc.includes('mainPortal') ||
                iframeSrc.includes('search') ||
                iframeSrc.includes('filter')
              )) {
                const iframeFrame = await iframe.contentFrame();
                if (iframeFrame) {
                  actualPage = iframeFrame as any;
                  console.log(`[분석] 필터 페이지 iframe 발견: ${iframeSrc}`);
                  break;
                }
              }
            } catch (e) {
              // 무시
            }
          }
        }
        
        // 필터 페이지 요소 수집
        const selects = await actualPage.locator('select').all();
        for (const select of selects) {
          try {
            const name = (await select.getAttribute('name')) || '';
            const id = (await select.getAttribute('id')) || '';
            const options = await select.locator('option').allTextContents();
            filterPage.selects.push({ name, id, options });
          } catch (e) {
            // 무시
          }
        }

        const inputs = await actualPage.locator('input').all();
        for (const input of inputs) {
          try {
            const type = (await input.getAttribute('type')) || 'text';
            const name = (await input.getAttribute('name')) || '';
            const id = (await input.getAttribute('id')) || '';
            const value = (await input.getAttribute('value')) || '';
            filterPage.inputs.push({ type, name, id, value });
          } catch (e) {
            // 무시
          }
        }

        const buttons = await actualPage.locator('button, input[type="button"], input[type="submit"]').all();
        for (const button of buttons) {
          try {
            const text = (await button.textContent())?.trim() || '';
            const type = (await button.getAttribute('type')) || 'button';
            const selector = await button.evaluate((el) => {
              const id = el.id ? `#${el.id}` : '';
              const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
              const tag = el.tagName.toLowerCase();
              return `${tag}${id}${classes}`;
            });
            filterPage.buttons.push({ text, type, selector });
          } catch (e) {
            // 무시
          }
        }

        console.log(`[분석] 필터 페이지 분석 완료: ${filterPage.selects.length}개 select, ${filterPage.inputs.length}개 input, ${filterPage.buttons.length}개 button`);
        
        // 필터 설정 및 대회 조회
        console.log('[분석] 필터 설정 및 대회 조회 시작...');
        const tournaments = await searchTournaments(actualPage);
        console.log(`[분석] 발견된 대회: ${tournaments.length}개`);
        
        return { mainPage, filterPage, tournaments };
      }
    } catch (e) {
      console.log('[분석] 직접 접근 실패:', e);
    }
    
    // 방법 2: iframe 내부 링크 클릭 시도 (기존 방식)
    for (const selector of selectorsToTry) {
      try {
        console.log(`[분석] "${selector}" 클릭 시도...`);
        
        let element: any = null;
        let actualPageForClick = page;
        
        // iframe 내부 링크인 경우 - 프레임을 매번 새로 가져오기
        if (selector.includes('iframe >>')) {
          // iframe 프레임을 다시 찾기 (detached 방지)
          let foundFrame: any = null;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (!foundFrame && retryCount < maxRetries) {
            try {
              const iframesForClick = await page.locator('iframe').all();
              
              for (const iframe of iframesForClick) {
                try {
                  const iframeSrc = await iframe.getAttribute('src');
                  if (iframeSrc && iframeSrc.includes('mainPortal')) {
                    const iframeFrame = await iframe.contentFrame();
                    if (iframeFrame) {
                      // 프레임이 유효한지 확인
                      try {
                        // Frame 타입으로 명시적 캐스팅
                        const frame = iframeFrame as any;
                        await frame.evaluate(() => document.body);
                        foundFrame = iframeFrame;
                        console.log(`[분석] iframe 프레임 찾기 성공 (시도 ${retryCount + 1}/${maxRetries})`);
                        break;
                      } catch (e) {
                        // 프레임이 detached된 경우
                        console.log(`[분석] iframe 프레임이 detached됨, 재시도...`);
                      }
                    }
                  }
                } catch (e) {
                  // 무시하고 다음 iframe 시도
                }
              }
              
              if (!foundFrame && retryCount < maxRetries - 1) {
                // 프레임을 찾지 못한 경우, 페이지를 다시 로드하거나 대기
                console.log(`[분석] iframe 프레임을 찾지 못함, 재시도 대기 중... (${retryCount + 1}/${maxRetries})`);
                await page.waitForTimeout(1000);
              }
              
              retryCount++;
            } catch (e) {
              console.log(`[분석] iframe 프레임 찾기 오류:`, e);
              retryCount++;
            }
          }
          
          if (!foundFrame) {
            console.log(`[분석] iframe 프레임을 찾을 수 없음 (최대 재시도 횟수 초과): ${selector}`);
            continue;
          }
          
          actualPageForClick = foundFrame;
          // "iframe >> " 제거
          const cleanSelector = selector.replace('iframe >> ', '');
          
          // 요소를 찾기 전에 프레임이 여전히 유효한지 확인
          try {
            await foundFrame.evaluate(() => document.body);
            element = actualPageForClick.locator(cleanSelector).first();
          } catch (e) {
            console.log(`[분석] iframe 프레임이 클릭 전에 detached됨: ${selector}`);
            continue;
          }
        } else {
          element = page.locator(selector).first();
        }
        
        if (!element) {
          continue;
        }
        
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        if (!isVisible) {
          console.log(`[분석] 요소가 보이지 않음: ${selector}`);
          continue;
        }
        
        // selector가 onclick인 경우
        if (selector.startsWith('[onclick')) {
          await element.click();
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          if (newUrl !== mainPage.url || newUrl.includes('match') || newUrl.includes('league')) {
            console.log(`[분석] 페이지 이동 성공 (onclick): ${newUrl}`);
            break;
          }
        } else {
          // href와 onclick 속성 확인
          const href = await element.getAttribute('href').catch(() => null);
          const onclick = await element.getAttribute('onclick').catch(() => null);
          
          if (href === 'javascript:;' || href === '#' || onclick) {
            // onclick 이벤트 직접 실행
            try {
              // iframe 내부인 경우, 프레임이 detached되지 않도록 주의
              if (actualPageForClick !== page) {
                // iframe 내부에서는 클릭만 시도 (onclick 실행은 위험)
                console.log(`[분석] iframe 내부 링크이므로 일반 클릭 시도`);
                await element.click();
              } else {
                // 메인 페이지에서는 onclick 실행 시도
                await element.evaluate((el: any) => {
                  if (el.onclick) {
                    el.onclick();
                  } else if (el.getAttribute('onclick')) {
                    const onclickStr = el.getAttribute('onclick');
                    if (onclickStr) {
                      // 함수 호출인 경우
                      if (onclickStr.includes('(') && onclickStr.includes(')')) {
                        eval(onclickStr);
                      } else {
                        // 함수명만 있는 경우
                        const funcName = onclickStr.trim();
                        if ((window as any)[funcName]) {
                          (window as any)[funcName]();
                        }
                      }
                    }
                  }
                });
                console.log(`[분석] onclick 이벤트 실행 완료`);
              }
            } catch (e) {
              console.log(`[분석] onclick 실행 실패, 일반 클릭 시도:`, e);
              try {
                await element.click();
              } catch (clickError) {
                console.log(`[분석] 클릭도 실패:`, clickError);
                // 프레임이 detached된 경우, 프레임을 다시 찾아서 시도
                const errorMessage = clickError instanceof Error ? clickError.message : String(clickError);
                if (actualPageForClick !== page && errorMessage?.includes('detached')) {
                  console.log(`[분석] 프레임 detached 감지, 프레임 재탐색 후 재시도...`);
                  // 다음 선택자로 넘어가기 (재시도는 위의 재시도 로직에서 처리)
                  continue;
                }
                throw clickError;
              }
            }
          } else {
            await element.click();
          }
          
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          if (newUrl !== mainPage.url || newUrl.includes('match') || newUrl.includes('league') || newUrl.includes('portal')) {
            console.log(`[분석] 페이지 이동 성공: ${newUrl}`);
            
            // 필터 페이지 분석
            filterPage = {
              url: newUrl,
              title: await page.title(),
              selects: [] as Array<{ name: string; id: string; options: string[] }>,
              inputs: [] as Array<{ type: string; name: string; id: string; value: string }>,
              buttons: [] as Array<{ text: string; type: string; selector: string }>,
            };
            
            // 필터 페이지가 맞는지 확인 (select 요소가 있어야 함)
            await page.waitForTimeout(2000);
            
            // iframe 내부도 확인 (더 광범위한 탐지)
            const pageIframes = await page.locator('iframe').all();
            let actualPage = page;
            if (pageIframes.length > 0) {
              for (const iframe of pageIframes) {
                try {
                  const iframeSrc = await iframe.getAttribute('src');
                  // match, league, tournament, portal, mainPortal 등 모두 확인
                  if (iframeSrc && (
                    iframeSrc.includes('match') || 
                    iframeSrc.includes('league') || 
                    iframeSrc.includes('tournament') ||
                    iframeSrc.includes('portal') ||
                    iframeSrc.includes('mainPortal') ||
                    iframeSrc.includes('search') ||
                    iframeSrc.includes('filter')
                  )) {
                    const iframeFrame = await iframe.contentFrame();
                    if (iframeFrame) {
                      actualPage = iframeFrame as any;
                      console.log(`[분석] 필터 페이지 iframe 발견: ${iframeSrc}`);
                      break;
                    }
                  }
                } catch (e) {
                  // 무시
                }
              }
            }
            
            // iframe을 찾지 못한 경우, mainPortal iframe 재확인
            if (actualPage === page) {
              // mainPortal iframe 내부에서 필터 페이지 확인
              try {
                const iframes = await page.locator('iframe').all();
                for (const iframe of iframes) {
                  const iframeSrc = await iframe.getAttribute('src');
                  if (iframeSrc && iframeSrc.includes('mainPortal')) {
                    const mainPortalFrame = await iframe.contentFrame();
                    if (mainPortalFrame) {
                      const iframeSelects = await mainPortalFrame.locator('select').count();
                      if (iframeSelects > 0) {
                        actualPage = mainPortalFrame as any;
                        console.log(`[분석] mainPortal iframe을 필터 페이지로 사용 (${iframeSelects}개 select 발견)`);
                        break;
                      }
                    }
                  }
                }
              } catch (e) {
                // 무시
              }
            }

            // 모든 select 요소 수집
            const selects = await actualPage.locator('select').all();
            for (const select of selects) {
              try {
                const name = (await select.getAttribute('name')) || '';
                const id = (await select.getAttribute('id')) || '';
                const options = await select.locator('option').allTextContents();
                filterPage.selects.push({ name, id, options });
              } catch (e) {
                // 무시
              }
            }

            // 모든 input 요소 수집
            const inputs = await actualPage.locator('input').all();
            for (const input of inputs) {
              try {
                const type = (await input.getAttribute('type')) || 'text';
                const name = (await input.getAttribute('name')) || '';
                const id = (await input.getAttribute('id')) || '';
                const value = (await input.getAttribute('value')) || '';
                filterPage.inputs.push({ type, name, id, value });
              } catch (e) {
                // 무시
              }
            }

            // 모든 버튼 수집
            const buttons = await actualPage.locator('button, input[type="button"], input[type="submit"]').all();
            for (const button of buttons) {
              try {
                const text = (await button.textContent())?.trim() || '';
                const type = (await button.getAttribute('type')) || 'button';
                const selector = await button.evaluate((el) => {
                  const id = el.id ? `#${el.id}` : '';
                  const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
                  const tag = el.tagName.toLowerCase();
                  return `${tag}${id}${classes}`;
                });
                filterPage.buttons.push({ text, type, selector });
              } catch (e) {
                // 무시
              }
            }

            console.log(`[분석] 필터 페이지 분석 완료: ${filterPage.selects.length}개 select, ${filterPage.inputs.length}개 input, ${filterPage.buttons.length}개 button`);
            
            // 필터 설정 및 대회 조회
            console.log('[분석] 필터 설정 및 대회 조회 시작...');
            const tournaments = await searchTournaments(actualPage);
            console.log(`[분석] 발견된 대회: ${tournaments.length}개`);
            
            return { mainPage, filterPage, tournaments };
          }
        }
      } catch (e) {
        // 다음 선택자 시도
        console.log(`[분석] 선택자 "${selector}" 실패:`, e);
      }
    }

    return { mainPage, filterPage };
  } catch (error: any) {
    console.error('[분석] 오류 발생:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 필터 페이지에서 대회를 조회합니다.
 * 필터 조건: 2026년, 대회 선택, 초등, 제주
 * 대상: U11, U12 "2026 서귀포 칠십리 춘계 유소년 축구 페스티벌"
 */
async function searchTournaments(page: Page | any): Promise<Array<{
  name: string;
  ageGroup: 'U11' | 'U12' | 'unknown';
  url?: string;
  id?: string;
}>> {
  const tournaments: Array<{
    name: string;
    ageGroup: 'U11' | 'U12' | 'unknown';
    url?: string;
    id?: string;
  }> = [];

  try {
    // 필터 페이지가 맞는지 확인
    console.log('[분석] 필터 페이지 확인 중...');
    await page.waitForTimeout(2000);
    
    // iframe 내부 확인 (더 광범위한 탐지)
    let actualPage = page;
    const pageIframes = await page.locator('iframe').all();
    if (pageIframes.length > 0) {
      for (const iframe of pageIframes) {
        try {
          const iframeSrc = await iframe.getAttribute('src');
          // match, league, tournament, portal, mainPortal 등 모두 확인
          if (iframeSrc && (
            iframeSrc.includes('match') || 
            iframeSrc.includes('league') || 
            iframeSrc.includes('tournament') ||
            iframeSrc.includes('portal') ||
            iframeSrc.includes('mainPortal') ||
            iframeSrc.includes('search') ||
            iframeSrc.includes('filter')
          )) {
            const iframeFrame = await iframe.contentFrame();
            if (iframeFrame) {
              actualPage = iframeFrame as any;
              console.log(`[분석] 필터 페이지 iframe 사용: ${iframeSrc}`);
              break;
            }
          }
        } catch (e) {
          // 무시
        }
      }
    }
    
    // iframe을 찾지 못한 경우, 모든 iframe에서 select 요소 확인
    if (actualPage === page && pageIframes.length > 0) {
      for (const iframe of pageIframes) {
        try {
          const iframeFrame = await iframe.contentFrame();
          if (iframeFrame) {
            const selectCount = await iframeFrame.locator('select').count();
            if (selectCount > 0) {
              actualPage = iframeFrame as any;
              const iframeSrc = await iframe.getAttribute('src');
              console.log(`[분석] select 요소 발견으로 iframe 사용: ${iframeSrc} (${selectCount}개 select)`);
              break;
            }
          }
        } catch (e) {
          // 무시
        }
      }
    }
    
    // 필터 설정
    console.log('[분석] 필터 설정 중...');
    await actualPage.waitForTimeout(2000);

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
        const select = actualPage.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          // 옵션 값으로 선택 시도
          // label과 value 모두 시도
          let selected = false;
          try {
            await select.selectOption({ label: '2026' });
            selected = true;
            console.log('[분석] 연도: 2026 선택 완료 (label)');
          } catch (e) {
            try {
              await select.selectOption({ value: '2026' });
              selected = true;
              console.log('[분석] 연도: 2026 선택 완료 (value)');
            } catch (e2) {
              try {
                await select.selectOption('2026');
                selected = true;
                console.log('[분석] 연도: 2026 선택 완료 (text)');
              } catch (e3) {
                // 무시
              }
            }
          }
          if (selected) {
            break;
          }
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
        const element = actualPage.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          if (await element.getAttribute('type') === 'radio') {
            await element.click();
          } else {
          // label과 value 모두 시도
          let selected = false;
          try {
            await element.selectOption({ label: '대회' });
            selected = true;
            console.log('[분석] 리그/대회: 대회 선택 완료 (label)');
          } catch (e) {
            try {
              await element.selectOption({ value: '대회' });
              selected = true;
              console.log('[분석] 리그/대회: 대회 선택 완료 (value)');
            } catch (e2) {
              try {
                await element.selectOption('대회');
                selected = true;
                console.log('[분석] 리그/대회: 대회 선택 완료 (text)');
              } catch (e3) {
                // 무시
              }
            }
          }
          if (selected) {
          }
            break;
          }
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
        const select = actualPage.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          // label과 value 모두 시도
          let selected = false;
          try {
            await select.selectOption({ label: '초등' });
            selected = true;
            console.log('[분석] 등급: 초등 선택 완료 (label)');
          } catch (e) {
            try {
              await select.selectOption({ value: '초등' });
              selected = true;
              console.log('[분석] 등급: 초등 선택 완료 (value)');
            } catch (e2) {
              try {
                await select.selectOption('초등');
                selected = true;
                console.log('[분석] 등급: 초등 선택 완료 (text)');
              } catch (e3) {
                // 무시
              }
            }
          }
          if (selected) {
            break;
          }
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
        const select = actualPage.locator(selector).first();
        if (await select.isVisible({ timeout: 2000 })) {
          // label과 value 모두 시도
          let selected = false;
          try {
            await select.selectOption({ label: '제주' });
            selected = true;
            console.log('[분석] 시도: 제주 선택 완료 (label)');
          } catch (e) {
            try {
              await select.selectOption({ value: '제주' });
              selected = true;
              console.log('[분석] 시도: 제주 선택 완료 (value)');
            } catch (e2) {
              try {
                await select.selectOption('제주');
                selected = true;
                console.log('[분석] 시도: 제주 선택 완료 (text)');
              } catch (e3) {
                // 무시
              }
            }
          }
          if (selected) {
            break;
          }
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    // 조회/검색 버튼 클릭 (더 많은 선택자 추가)
    const searchSelectors = [
      'button:has-text("조회")',
      'button:has-text("검색")',
      'button:has-text("검색하기")',
      'button:has-text("찾기")',
      'button:has-text("Search")',
      'input[type="submit"]',
      'input[type="button"]:has-text("조회")',
      'input[type="button"]:has-text("검색")',
      'button[type="submit"]',
      '#search-btn',
      '#searchBtn',
      '#btnSearch',
      '#btnSearch',
      '.search-btn',
      '.btn-search',
      '.btnSearch',
      'button[onclick*="search"]',
      'button[onclick*="조회"]',
      'button[onclick*="검색"]',
      'button[onclick*="Search"]',
      'a:has-text("조회")',
      'a:has-text("검색")',
      '[onclick*="search"]',
      '[onclick*="조회"]',
      '[onclick*="검색"]',
    ];

    let searchClicked = false;
    for (const selector of searchSelectors) {
      try {
        const button = actualPage.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          await actualPage.waitForTimeout(3000); // 결과 로딩 대기
          searchClicked = true;
          console.log('[분석] 조회 버튼 클릭 완료');
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }

    if (!searchClicked) {
      console.warn('[분석] 조회 버튼을 찾을 수 없습니다.');
    }

    // 대회 목록 추출
    console.log('[분석] 대회 목록 추출 중...');
    await actualPage.waitForTimeout(3000);

    // 방법 1: 테이블에서 추출 (더 많은 선택자 시도)
    const tableSelectors = [
      'table tbody tr',
      'table tr',
      '.tournament-list tr',
      '.match-list tr',
      '.list tr',
      '[class*="list"] tr',
      '[class*="table"] tr',
      'tbody tr',
      'tr[onclick]',
      'tr a',
    ];
    
    let tableRows: any[] = [];
    for (const selector of tableSelectors) {
      try {
        const rows = await actualPage.locator(selector).all();
        if (rows.length > 0) {
          tableRows = rows;
          console.log(`[분석] 테이블 행 수: ${tableRows.length}개 (선택자: ${selector})`);
          break;
        }
      } catch (e) {
        // 다음 선택자 시도
      }
    }
    
    if (tableRows.length === 0) {
      console.log('[분석] 테이블을 찾지 못했습니다. 다른 방법 시도...');
    }

    for (const row of tableRows) {
      try {
        const text = await row.textContent();
        if (text && text.includes('서귀포 칠십리') && text.includes('2026')) {
          let ageGroup: 'U11' | 'U12' | 'unknown' = 'unknown';
          if (text.includes('U11') || text.includes('u11')) {
            ageGroup = 'U11';
          } else if (text.includes('U12') || text.includes('u12')) {
            ageGroup = 'U12';
          }

          // 링크 찾기
          const link = row.locator('a').first();
          let url = '';
          let id = '';
          try {
            url = (await link.getAttribute('href')) || '';
            // URL에서 ID 추출 시도
            const idMatch = url.match(/idx=([^&]+)/);
            if (idMatch) {
              id = idMatch[1];
            }
          } catch (e) {
            // 무시
          }

          tournaments.push({
            name: text.trim(),
            ageGroup,
            url: url || undefined,
            id: id || undefined,
          });
        }
      } catch (e) {
        // 무시
      }
    }

    // 방법 2: JavaScript로 직접 추출
    if (tournaments.length === 0) {
      console.log('[분석] JavaScript로 대회 목록 추출 시도...');
      const jsTournaments = await actualPage.evaluate(() => {
        const results: Array<{ text: string; href: string }> = [];
        const elements = document.querySelectorAll('a, tr, div[class*="tournament"], div[class*="match"]');
        elements.forEach((el) => {
          const text = el.textContent?.trim() || '';
          if (text.includes('서귀포 칠십리') && text.includes('2026')) {
            const href = (el as HTMLElement).getAttribute('href') || '';
            results.push({ text, href });
          }
        });
        return results;
      });

      for (const jsTournament of jsTournaments) {
        let ageGroup: 'U11' | 'U12' | 'unknown' = 'unknown';
        if (jsTournament.text.includes('U11') || jsTournament.text.includes('u11')) {
          ageGroup = 'U11';
        } else if (jsTournament.text.includes('U12') || jsTournament.text.includes('u12')) {
          ageGroup = 'U12';
        }

        let id = '';
        if (jsTournament.href) {
          const idMatch = jsTournament.href.match(/idx=([^&]+)/);
          if (idMatch) {
            id = idMatch[1];
          }
        }

        tournaments.push({
          name: jsTournament.text,
          ageGroup,
          url: jsTournament.href || undefined,
          id: id || undefined,
        });
      }
    }

    // 중복 제거
    const uniqueTournaments = tournaments.filter((t, index, self) =>
      index === self.findIndex((tt) => tt.name === t.name && tt.ageGroup === t.ageGroup)
    );

    return uniqueTournaments;
  } catch (error: any) {
    console.error('[분석] 대회 조회 중 오류:', error);
    return tournaments;
  }
}
