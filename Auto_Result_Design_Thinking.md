# 경기 결과 자동 수집 기능 - Design Thinking

## 📋 개요

joinkfa.com (KFA 통합경기정보시스템)에서 특정 대회의 경기 결과를 자동으로 수집하여 데이터베이스에 업데이트하는 기능을 구현합니다.

**목표**: 관리자가 수동으로 경기 결과를 입력하는 대신, joinkfa.com에서 자동으로 크롤링하여 한 번에 업데이트할 수 있도록 합니다.

**대상 대회**: 
- 2026 서귀포 칠십리 춘계 유소년 축구 페스티벌 (U11)
- 2026 서귀포 칠십리 춘계 유소년 축구 페스티벌 (U12)

---

## 1. 요구사항 분석

### 1.1 기능 요구사항

1. **대회 선택 자동화**
   - joinkfa.com 메인 페이지에서 "리그/대회" 영역 클릭
   - 필터 조건 자동 설정:
     - 연도: 2026년
     - 리그/대회: 대회 선택
     - 등급: 초등 선택
     - 시도: 제주 선택
   - 결과: U11, U12 대회 2건 자동 식별

2. **경기 결과 수집**
   - 각 대회의 경기 결과 페이지 접근
   - 경기 결과 데이터 추출 (팀명, 점수, 날짜, 시간 등)
   - 데이터 정규화 및 검증

3. **데이터베이스 업데이트**
   - 수집한 경기 결과를 기존 DB의 경기와 매칭
   - 점수 업데이트 (home_score, away_score)
   - 상태 변경 (status = '종료')
   - 매칭 실패 시 로그 기록 및 알림

4. **관리자 UI**
   - 크롤링 실행 버튼
   - 진행 상황 표시
   - 결과 요약 (수집된 경기 수, 업데이트된 경기 수, 실패한 경기 목록)

### 1.2 기술적 도전 과제

1. **SPA 구조 대응**
   - URL이 직접 확인 불가능한 구조
   - 동적 라우팅 및 JavaScript 기반 페이지 전환
   - Playwright 브라우저 자동화 필요

2. **필터 UI 자동화**
   - 셀렉트 박스, 라디오 버튼 등 UI 요소 식별
   - 필터 선택 후 조회 버튼 클릭
   - 결과 로딩 대기

3. **데이터 추출 방법**
   - 방법 A: Network API 응답 가로채기 (우선)
     - `getMatchList.do` 등 API 응답 수신
     - JSON 파싱하여 경기 결과 추출
   - 방법 B: DOM 직접 파싱 (백업)
     - 테이블에서 경기 결과 파싱
     - 점수 패턴 매칭

4. **데이터 매칭 로직**
   - 팀명 기반 유연한 매칭
   - 날짜/시간 기반 경기 매칭
   - 연령대/조 정보 확인

---

## 2. 기술 스택 및 아키텍처

### 2.1 핵심 기술

- **Playwright**: 브라우저 자동화 (이미 설치됨: `package.json`)
- **Next.js 14 (App Router)**: API 라우트 및 관리자 페이지
- **TypeScript**: 타입 안정성
- **Supabase (PostgreSQL)**: 데이터베이스 업데이트

### 2.2 파일 구조

```
JG_Manager/
├── app/
│   ├── admin/
│   │   └── crawl-results/
│   │       └── page.tsx              # 관리자 크롤링 UI
│   └── api/
│       └── crawl/
│           └── results/
│               └── route.ts          # 크롤링 API 엔드포인트
├── components/
│   └── Crawl/
│       └── CrawlResultsForm.tsx      # 크롤링 실행 폼 컴포넌트
└── lib/
    └── crawl/
        └── joinkfa.ts                # joinkfa 크롤링 로직
```

---

## 3. 구현 계획

### Phase 1: 페이지 구조 분석 및 테스트

**목표**: joinkfa.com의 실제 페이지 구조 파악

**작업 내용**:
1. Playwright로 joinkfa.com 메인 페이지 접속
2. "리그/대회" 영역 클릭 및 페이지 전환 확인
3. 필터 UI 요소 식별:
   - 연도 선택 셀렉트 박스
   - 리그/대회 선택 라디오 버튼 또는 셀렉트 박스
   - 등급 선택 셀렉트 박스
   - 시도 선택 셀렉트 박스
   - 조회/검색 버튼
4. Network 탭에서 API 호출 확인:
   - `getInitData1.do`: 초기 데이터 로드
   - `getMatchList.do`: 경기 목록 조회
   - API 요청/응답 구조 파악
5. 경기 결과 페이지 구조 확인:
   - 테이블 구조
   - 데이터 표시 형식
   - 페이지네이션 여부

**산출물**:
- 페이지 구조 분석 문서
- API 응답 샘플
- 필터 UI 요소 식별 정보

### Phase 2: 크롤링 로직 구현

**목표**: joinkfa.com에서 경기 결과를 자동으로 수집하는 로직 구현

**작업 내용**:
1. `lib/crawl/joinkfa.ts` 작성
   - Playwright 브라우저 실행
   - 메인 페이지 접속
   - "리그/대회" 영역 클릭
   - 필터 자동 선택:
     ```typescript
     // 필터 설정 예시
     await page.selectOption('#year-select', '2026');
     await page.click('input[value="대회"]'); // 리그/대회: 대회 선택
     await page.selectOption('#grade-select', '초등');
     await page.selectOption('#region-select', '제주');
     await page.click('#search-button');
     ```
   - 결과 로딩 대기
   - U11, U12 대회 2건 식별
   - 각 대회 클릭하여 경기 결과 페이지로 이동
   - 경기 결과 추출:
     - 방법 A: Network API 응답 가로채기
     - 방법 B: DOM 테이블 파싱
   - 데이터 정규화:
     - 팀명 정규화
     - 날짜/시간 파싱
     - 점수 파싱

**함수 구조**:
```typescript
// lib/crawl/joinkfa.ts
export interface CrawledMatch {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  ageGroup: 'U11' | 'U12';
  tournamentName: string;
}

export async function crawlJoinkfaResults(): Promise<{
  success: boolean;
  matches: CrawledMatch[];
  errors: string[];
}>
```

### Phase 3: API 라우트 구현

**목표**: 크롤링을 실행할 수 있는 API 엔드포인트 구현

**작업 내용**:
1. `app/api/crawl/results/route.ts` 작성
   - POST 메서드 처리
   - 관리자 인증 확인
   - 크롤링 실행
   - 결과 반환

**API 스펙**:
```typescript
// POST /api/crawl/results
// Request: {}
// Response: {
//   success: boolean;
//   totalMatches: number;
//   updatedMatches: number;
//   failedMatches: Array<{
//     match: CrawledMatch;
//     reason: string;
//   }>;
//   errors: string[];
// }
```

### Phase 4: 관리자 UI 구현

**목표**: 관리자가 크롤링을 실행하고 결과를 확인할 수 있는 UI 구현

**작업 내용**:
1. `app/admin/crawl-results/page.tsx` 작성
   - 관리자 인증 확인 (ProtectedRoute)
   - 크롤링 실행 폼
   - 진행 상황 표시
   - 결과 요약 표시

2. `components/Crawl/CrawlResultsForm.tsx` 작성
   - 크롤링 실행 버튼
   - 로딩 상태 표시
   - 결과 테이블 표시
   - 에러 메시지 표시

**UI 구성**:
- 크롤링 실행 버튼
- 진행 상황 인디케이터
- 결과 요약 카드:
  - 수집된 경기 수
  - 업데이트된 경기 수
  - 실패한 경기 수
- 실패한 경기 목록 테이블
- 에러 로그 표시

### Phase 5: 데이터 매칭 및 업데이트 로직

**목표**: 수집한 경기 결과를 DB의 기존 경기와 매칭하여 업데이트

**작업 내용**:
1. 팀명 매칭 로직 구현
   - 정확 일치: DB의 팀명과 크롤링한 팀명이 정확히 일치
   - 부분 일치: 포함 관계 확인 (예: "진건초" vs "진건초등학교")
   - 별칭 매핑: 별도 매핑 테이블 또는 설정 파일 사용

2. 경기 매칭 로직 구현
   - 팀명 매칭 결과 사용
   - 날짜 매칭: 경기 날짜가 일치하는지 확인
   - 시간 매칭: 시간이 유사한지 확인 (30분 이내 차이 허용)
   - 연령대 확인: age_group (U11/U12) 확인
   - 조 정보 확인: group_name 확인

3. Supabase 업데이트 로직
   - 매칭된 경기 찾기: matches 테이블에서 home_team_id, away_team_id, date, time으로 조회
   - 점수 업데이트: home_score, away_score
   - 상태 변경: status = '종료'
   - updated_at 갱신

4. 매칭 실패 처리
   - 로그 기록
   - 관리자에게 알림
   - 수동 확인 가능한 목록 제공

**매칭 전략**:
```typescript
// 우선순위 기반 매칭
1. 팀명 정확 일치 + 날짜 일치 + 시간 유사 (±30분)
2. 팀명 부분 일치 + 날짜 일치 + 시간 유사 (±30분)
3. 팀명 별칭 매핑 + 날짜 일치 + 시간 유사 (±30분)
```

---

## 4. 데이터 구조

### 4.1 크롤링 데이터 구조

```typescript
interface CrawledMatch {
  homeTeam: string;        // 홈팀명 (크롤링 원본)
  awayTeam: string;        // 원정팀명 (크롤링 원본)
  homeScore: number;       // 홈팀 점수
  awayScore: number;       // 원정팀 점수
  date: string;            // 날짜 (YYYY-MM-DD)
  time: string;            // 시간 (HH:mm)
  ageGroup: 'U11' | 'U12'; // 연령대
  tournamentName: string;   // 대회명
  round?: string;          // 리그 (1차/2차, 가능한 경우)
  group?: string;          // 조 (가능한 경우)
}
```

### 4.2 매칭 결과 구조

```typescript
interface MatchResult {
  crawledMatch: CrawledMatch;
  matchedMatchId?: string;  // 매칭된 경기 ID
  matchStatus: 'matched' | 'failed' | 'duplicate';
  reason?: string;          // 매칭 실패 이유
}
```

---

## 5. 에러 처리 및 예외 상황

### 5.1 크롤링 에러

1. **페이지 로딩 실패**
   - 타임아웃 처리 (30초)
   - 재시도 로직 (최대 3회)

2. **요소 찾기 실패**
   - 필터 UI 요소를 찾을 수 없을 때
   - 대기 시간 증가 후 재시도
   - 수동 확인 필요 알림

3. **네트워크 오류**
   - API 호출 실패
   - 재시도 로직
   - 에러 로그 기록

### 5.2 데이터 매칭 에러

1. **팀명 매칭 실패**
   - 팀명이 DB에 없을 때
   - 별칭 매핑 테이블 확인
   - 수동 매칭 필요 알림

2. **경기 매칭 실패**
   - 매칭 조건을 만족하는 경기가 없을 때
   - 날짜/시간 차이가 너무 클 때
   - 수동 확인 필요 알림

3. **중복 매칭**
   - 여러 경기가 매칭될 때
   - 더 엄격한 조건으로 재매칭
   - 수동 확인 필요 알림

### 5.3 데이터베이스 업데이트 에러

1. **RLS 정책 위반**
   - 관리자 권한 확인
   - 에러 로그 기록

2. **외래 키 제약 위반**
   - 팀 ID가 유효하지 않을 때
   - 데이터 무결성 확인

---

## 6. 사용자 시나리오

### 시나리오 1: 정상적인 크롤링 및 업데이트

1. 관리자가 `/admin/crawl-results` 페이지 접속
2. "경기 결과 수집 시작" 버튼 클릭
3. 시스템이 joinkfa.com에 접속하여 필터 자동 설정
4. U11, U12 대회 2건 식별
5. 각 대회의 경기 결과 수집
6. DB의 기존 경기와 매칭
7. 점수 및 상태 업데이트
8. 결과 요약 표시:
   - 수집된 경기: 50건
   - 업데이트된 경기: 48건
   - 실패한 경기: 2건 (팀명 매칭 실패)

### 시나리오 2: 매칭 실패 처리

1. 크롤링은 성공했으나 일부 경기 매칭 실패
2. 실패한 경기 목록 표시:
   - 크롤링한 팀명: "진건초등학교" vs "FC진건"
   - DB의 팀명: "진건초" vs "FC진건"
   - 실패 이유: "팀명 매칭 실패"
3. 관리자가 수동으로 확인 및 매칭

### 시나리오 3: 크롤링 실패

1. joinkfa.com 페이지 구조 변경으로 인한 크롤링 실패
2. 에러 메시지 표시:
   - "필터 UI 요소를 찾을 수 없습니다. 페이지 구조가 변경되었을 수 있습니다."
3. 관리자에게 알림 및 수동 확인 필요

---

## 7. 향후 개선 사항

### 7.1 기능 개선

1. **스케줄링 기능**
   - 정기적으로 자동 크롤링 실행 (예: 매일 오전 9시)
   - 크롤링 결과 알림 (이메일, 슬랙 등)

2. **다중 대회 지원**
   - 여러 대회를 한 번에 크롤링
   - 대회별 필터 설정 저장

3. **팀명 매핑 관리**
   - 관리자 페이지에서 팀명 별칭 매핑 관리
   - 자동 학습 기능 (매칭 성공한 팀명 쌍 저장)

4. **크롤링 히스토리**
   - 크롤링 실행 이력 저장
   - 이전 결과와 비교하여 변경 사항 표시

### 7.2 성능 개선

1. **병렬 처리**
   - 여러 대회를 동시에 크롤링
   - 경기 결과 추출 병렬화

2. **캐싱**
   - 크롤링 결과 캐싱
   - 변경된 경기만 업데이트

3. **증분 업데이트**
   - 전체 크롤링 대신 변경된 경기만 수집
   - 마지막 크롤링 시간 기록

---

## 8. 보안 및 윤리적 고려사항

### 8.1 크롤링 윤리

1. **robots.txt 준수**
   - joinkfa.com의 robots.txt 확인
   - 크롤링 정책 준수

2. **요청 빈도 제한**
   - 과도한 요청 방지
   - 적절한 대기 시간 설정

3. **사용자 에이전트 명시**
   - 정당한 크롤링임을 명시
   - 연락처 정보 포함

### 8.2 데이터 보안

1. **관리자 인증**
   - 크롤링 기능은 관리자만 접근 가능
   - RLS 정책으로 DB 업데이트 제한

2. **에러 로그 보안**
   - 민감한 정보 노출 방지
   - 로그 파일 보안 관리

---

## 9. 테스트 계획

### 9.1 단위 테스트

1. **크롤링 로직 테스트**
   - 필터 선택 로직
   - 데이터 추출 로직
   - 데이터 정규화 로직

2. **매칭 로직 테스트**
   - 팀명 매칭 테스트
   - 경기 매칭 테스트
   - 엣지 케이스 테스트

### 9.2 통합 테스트

1. **전체 플로우 테스트**
   - 크롤링 → 매칭 → 업데이트 전체 플로우
   - 실제 joinkfa.com 접속 테스트

2. **에러 처리 테스트**
   - 네트워크 오류 시나리오
   - 페이지 구조 변경 시나리오
   - 매칭 실패 시나리오

### 9.3 수동 테스트

1. **관리자 UI 테스트**
   - 크롤링 실행 버튼 동작 확인
   - 결과 표시 확인
   - 에러 메시지 확인

---

## 10. 구현 우선순위

### High Priority (필수) ✅ 완료

1. ✅ 페이지 구조 분석
2. ✅ 크롤링 로직 구현 (기본)
3. ✅ API 라우트 구현
4. ✅ 관리자 UI 구현 (기본)
5. ✅ 데이터 매칭 로직 (기본)

### Medium Priority (중요) ✅ 부분 완료

1. ✅ 에러 처리 강화 (기본 구현 완료)
2. ✅ 매칭 실패 처리 개선 (경기번호 우선 매칭, 실패 목록 제공)
3. ✅ 로깅 및 모니터링 (기본 구현 완료)

### Low Priority (선택) 🔄 향후 개선

1. ⚪ 스케줄링 기능
2. ⚪ 다중 대회 지원
3. ⚪ 팀명 매핑 관리 UI
4. ⚪ 크롤링 히스토리

---

## 11. 참고 자료

- [joinkfa.com 분석 문서](./docs/joinkfa-analysis.md)
- [기존 크롤링 기능 삭제 내역](./DESIGN_THINKING.md#v180-2026-01-31)
- [Playwright 공식 문서](https://playwright.dev/)

---

## 12. 문서 정보

**📅 문서 작성일**: 2026-01-31  
**🔄 최종 업데이트**: 2026-02-01  
**📝 현재 버전**: v1.1.0  
**✍️ 작성자**: AI Assistant (Claude Sonnet 4.5)  
**🛠️ 개발 도구**: Cursor IDE, Sequential Thinking

---

## 13. 변경 이력

### v1.1.0 (2026-02-01)
**작성일시**: 2026-02-01  
**🔄 주요 변경사항**:
- ✅ 경기 결과 자동 수집 기능 재구현 완료
  - joinkfa.com에서 경기 결과 자동 크롤링 기능 구현 완료
  - Playwright 기반 브라우저 자동화 및 Network API 응답 가로채기 방식 채택
  - 고정 대회 ID 기반 크롤링 (U11, U12)
  - 경기번호 우선 매칭 로직 구현 (경기번호 → 팀명+날짜+시간)
  - 크롤링 결과를 DB에 자동 업데이트
  - 관리자 UI (`/admin/crawl-results`) 구현 완료
- ✅ 핵심 구현 내용
  - **크롤링 로직** (`lib/crawl/joinkfa.ts`):
    - Playwright 브라우저 자동화
    - Network API 응답 가로채기 (`getMatchList.do`, `getInitData` 등)
    - 직접 URL 접근 방식 지원
    - 고정 대회 ID 사용으로 필터 UI 자동화 복잡도 감소
  - **API 직접 호출** (`lib/crawl/api.ts`):
    - `getTournamentList`: 대회 목록 조회
    - `getMatchResults`: 경기 결과 조회
    - `convertMatchResultToCrawledMatch`: API 응답을 크롤링 데이터 형식으로 변환
  - **매칭 로직** (`lib/crawl/match.ts`):
    - 경기번호 우선 매칭 (가장 정확)
    - 팀명+날짜+시간 기반 매칭 (경기번호 없을 때)
    - 경기번호 자동 업데이트 기능
    - 매칭 실패 원인 상세 기록
  - **API 라우트** (`app/api/crawl/results/route.ts`):
    - 관리자 인증 확인
    - 크롤링 실행 → 매칭 → DB 업데이트 전체 플로우
    - 통계 및 에러 정보 반환
  - **관리자 UI** (`app/admin/crawl-results/page.tsx`, `components/Crawl/CrawlResultsForm.tsx`):
    - 크롤링 실행 버튼
    - 진행 상황 표시
    - 결과 요약 (수집된 경기 수, 업데이트된 경기 수, 실패한 경기 수)
    - 실패한 경기 목록 테이블
    - 에러 로그 표시
- ✅ 주요 개선 사항
  - Network API 응답 가로채기 방식으로 DOM 파싱보다 안정적
  - 경기번호 기반 매칭으로 정확도 향상
  - 고정 대회 ID 사용으로 필터 UI 자동화 복잡도 감소
  - 경기번호 자동 업데이트로 DB 데이터 정합성 향상
  - 매칭 실패 경기 목록 제공으로 수동 확인 용이

**📝 기술적 결정 사항**:
- Playwright를 사용한 브라우저 자동화로 SPA 구조 대응
- Network API 응답 가로채기 방식으로 데이터 추출 (DOM 파싱보다 안정적)
- 경기번호를 우선 매칭 키로 사용하여 정확도 향상
- 고정 대회 ID 사용으로 필터 UI 자동화 복잡도 감소

### v1.0.0 (2026-01-31)
- 초기 기획 문서 작성
- Sequential Thinking 분석 결과 반영
- 구현 계획 수립
