# 유소년 축구팀 대회 관리 시스템 - Sequential Thinking

## 1. 요구사항 분석

### 1.1 팀 정보
- **U12**: 1차 리그 기준 다수 팀 참가 (조별 4팀)
- **U11**: 1차 리그 기준 다수 팀 참가 (조별 4팀)
- 실제 참가 팀은 대진표에 따라 동적으로 관리
- 1차 리그: U11/U12 각각 16개 조 (1조~16조)

### 1.2 대회 일정
- **대회 기간**: 2026년 2월 6일(금) ~ 2월 12일(목)
- **1차 리그**: 2026년 2월 6일(금) ~ 8일(일)
- **2차 리그**: 2026년 2월 10일(화) ~ 12일(목) (예정)
- 각 조에 4개 팀씩 배정
- **경기 시간**:
  - U12: 전·후반 각 25분
  - U11: 전·후반 각 20분
- **경기장**: 걸매A-1구장(A), 걸매A-2구장(B), 걸매B-1구장(C), 효돈A-1구장(D), 효돈A-2구장(E), 효돈B-1구장(F), 공천포A-1구장(G), 공천포A-2구장(H)

### 1.3 기능 요구사항
1. 전체 경기 현황 대시보드
2. 팀별 현황 대시보드 (팀 상세 페이지)
3. 경기 일정 등록 기능 (관리자 전용, 단일/일괄)
4. 경기 결과 입력/확인 (관리자 전용)
5. 경기 종료 후 유튜브 영상 링크 입력 및 재생 (관리자 전용)
6. 조별 순위 확인
   - 승리: 3점
   - 무승부: 1점
   - 패배: 0점
   - 동점 시: 대회규정 제 13조 적용
7. 관리자 인증 시스템 (로그인/로그아웃)
8. PC/모바일 반응형 디자인

## 2. 데이터 모델 설계

### 2.1 핵심 엔티티
```
Team (팀)
- id
- name (팀명)
- ageGroup (U11/U12)
- group (조)

Match (경기)
- id
- ageGroup (U11/U12)
- date (날짜)
- time (시간)
- round (1차/2차)
- group (조)
- matchNo (경기번호)
- pitchCode (경기장 코드: A, B, C, ...)
- homeTeam (홈팀)
- awayTeam (원정팀)
- homeTeamNo (조 내 홈팀 번호: 1~4 등, 선택)
- awayTeamNo (조 내 원정팀 번호: 1~4 등, 선택)
- homeScore (홈팀 점수)
- awayScore (원정팀 점수)
- status (예정/진행중/종료)
- youtubeLink (유튜브 영상 링크, 경기 종료 후 입력 가능)

GroupStanding (조별 순위)
- group (조)
- team (팀)
- played (경기수)
- won (승)
- drawn (무)
- lost (패)
- goalsFor (득점)
- goalsAgainst (실점)
- goalDifference (득실차)
- points (승점)
- fairPlayPoints (페어플레이점수 - 벌점 누계, 낮을수록 좋음)
```

### 2.2 대회규정 제 13조 (1차 리그 순위 결정방식)
본 대회는 2차 리그 대진표 구성을 위해 1차 리그 조별 순위를 결정하며, 방법은 아래와 같다:

**순위 결정 기준 (우선순위 순서):**
1. **승점** (승 3점, 무 1점, 패 0점)
2. **페어플레이점수** (벌점 누계가 낮은 팀이 상위 순위)
3. **추첨** (대회 주최측에서 진행)

**페어플레이점수 산정 방식 (회당 기준):**
- **선수 벌점:**
  - 경고 당 1점
  - 경고 누적(2회) 퇴장: 3점
  - 직접 퇴장: 3점
  - 경고 1회 후 직접퇴장: 4점

- **지도자 및 임원 벌점:**
  - 경고 당 2점
  - 경고 누적(2회) 퇴장: 4점
  - 직접 퇴장: 4점
  - 경고 1회 후 직접퇴장: 6점

- **기타:**
  - 페어플레이 점수는 선수 및 지도자, 임원 개인별로 각각 적용
  - 공정소위원회에 의해 결정된 팀 경고: 6점
  - 공정소위원회 결정 사항에 따라 경고 1점, 출전정지 1경기당 2점

**참고:** 
- 2차 리그는 1차 리그 순위에 따라 조 편성 (1위팀 4팀/2위팀 4팀/3위팀 4팀/4위팀 4팀)
- 1차 리그에서 발생한 경고는 2차 리그에 연계 적용하지 않으나, 퇴장 및 징계는 2차 리그에 연계 적용

## 3. 페이지 구조 설계

### 3.1 라우팅 구조 (구현 완료)
```
/ (홈 - 대시보드로 리다이렉트)
├── /dashboard (전체 경기 현황 대시보드)
├── /login (관리자 로그인)
├── /teams
│   ├── /teams (팀 목록 - U11/U12 구분)
│   └── /teams/:teamId (팀별 상세 페이지)
├── /matches
│   ├── /matches (경기 목록 - 1차/2차 리그 구분)
│   └── /matches/:matchId (경기 상세 페이지)
├── /standings (조별 순위)
│   ├── U11/U12 탭으로 연령대 전환
│   └── 1차/2차 리그 탭으로 리그 전환
├── /venues (경기장 정보 - 카카오맵 + 모바일 길찾기)
└── /admin (관리자 대시보드 - 관리자 전용)
    └── /admin/matches
        ├── /admin/matches (경기 관리 목록)
        ├── /admin/matches/new (경기 일정 등록 - 단일/일괄)
        └── /admin/matches/:matchId/edit (경기 결과 입력)
    └── /admin/settings (대회 기본정보: 경기장/팀 번호 설정)
```

### 3.2 컴포넌트 구조 (구현 완료)
```
components/
├── Layout/
│   ├── Header.tsx (메인 헤더, 로고, 네비게이션)
│   └── MobileNav.tsx (모바일 네비게이션)
├── Dashboard/
│   ├── MatchCard.tsx (경기 카드 컴포넌트)
│   └── (내 팀 고정 4팀 기반 대시보드 - 선택 UI 제거)
├── Venues/
│   ├── VenueMap.tsx (카카오맵 지도/마커/인포윈도우)
│   └── VenueList.tsx (경기장 목록 + 모바일 길찾기)
├── Match/
│   ├── MatchForm.tsx (단일 경기 입력 폼)
│   ├── BulkUploadForm.tsx (경기 일정 일괄 등록)
│   ├── MatchResultForm.tsx (경기 결과 입력)
│   ├── FairPlayForm.tsx (페어플레이 점수 입력)
│   ├── DeleteMatchButton.tsx (경기 삭제 버튼)
│   └── YouTubeEmbed.tsx (유튜브 영상 임베드)
├── Standings/
│   └── AgeGroupTabs.tsx (U11/U12 탭)
└── auth/
    ├── LoginForm.tsx (로그인 폼)
    ├── LogoutButton.tsx (로그아웃 버튼)
    └── ProtectedRoute.tsx (보호된 라우트)
```

## 4. 기술 스택 제안

### 4.1 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand 또는 React Context
- **Data Fetching**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod

### 4.2 백엔드/데이터 저장
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (관리자 인증)
- **API**: Supabase Client + Next.js API Routes
- **Security**: Row Level Security (RLS) - 관리자만 데이터 입력 가능
- **Real-time**: Supabase Realtime (선택사항)

### 4.3 반응형 디자인
- Mobile First 접근
- Tailwind CSS의 반응형 유틸리티 활용
- 브레이크포인트: sm(640px), md(768px), lg(1024px)

## 5. 주요 기능 플로우

### 5.1 대진표 입력 플로우 (구현 완료)
1. 관리자 로그인 (인증 확인)
2. 관리자 페이지 접근 (`/admin/matches/new`)
3. **단일 입력 방식:**
   - 리그 선택 (1차/2차)
   - 조 선택
   - 날짜/시간 입력
   - 경기장 선택
   - 홈팀/원정팀 선택
   - 저장
4. **일괄 업로드 방식:**
   - 양식 다운로드 (Excel 파일)
   - Excel 파일에 경기 정보 입력
   - 파일 업로드
   - 자동 검증 및 일괄 등록
5. 저장 (Supabase에 INSERT, RLS 정책으로 권한 확인)

### 5.2 경기 결과 입력 플로우 (구현 완료)
1. 관리자 로그인 확인
2. 경기 목록에서 경기 선택 (`/admin/matches/[matchId]/edit`)
3. 점수 입력 (홈팀/원정팀)
4. 경기 상태 변경 (예정/진행중/종료)
5. 경기장 정보 입력/수정
6. 페어플레이 점수 입력 (선수/지도자/임원별 벌점)
7. 경기 삭제 기능 (필요시)
8. 저장 (Supabase에 UPDATE, RLS 정책으로 권한 확인)
9. 자동으로 순위표 업데이트 (뷰 또는 함수로 계산)

### 5.4 유튜브 영상 링크 기능
1. 경기 상태가 "종료"일 때만 링크 입력 가능
2. 유튜브 URL 유효성 검증
3. 경기 카드/상세 페이지에서 링크 표시
4. 유튜브 임베드 또는 링크로 재생 가능

### 5.3 순위 계산 로직 (대회규정 제 13조)
1. **기본 승점 계산**
   - 승: 3점
   - 무: 1점
   - 패: 0점

2. **동점 시 순위 결정 (우선순위 순서)**
   - 1순위: 승점 (높은 순)
   - 2순위: 페어플레이점수 (벌점 누계가 낮은 순)
   - 3순위: 추첨 (대회 주최측에서 진행)

3. **페어플레이점수 계산**
   - 경기별 벌점 누적 계산
   - 선수/지도자/임원별 벌점 적용
   - 팀별 총 벌점 합계 (낮을수록 상위)

## 6. UI/UX 설계

### 6.1 전체 대시보드
- 오늘의 경기 (Today's Matches)
- 다음 경기 (Upcoming Matches)
- 최근 결과 (Recent Results)
  - 종료된 경기에 유튜브 링크가 있으면 재생 버튼 표시
- 조별 순위 요약 (Standings Summary)
- 팀별 빠른 링크

### 6.2 팀별 대시보드
- 팀 정보
- 경기 일정 (예정/종료)
  - 종료된 경기에 유튜브 링크 표시
- 팀 통계
  - 경기수, 승/무/패
  - 득점/실점
  - 승점
- 조 내 순위

### 6.3 모바일 최적화
- 햄버거 메뉴
- 카드 기반 레이아웃
- 터치 친화적 버튼 크기
- 스와이프 제스처 지원

## 7. 구현 현황

### 7.1 완료된 기능 (2026년 1월 기준)

#### Phase 1: 기본 구조 ✅
- [x] 프로젝트 초기 설정 (Next.js 14, TypeScript, Tailwind CSS)
- [x] 라우팅 구조 (App Router)
- [x] 기본 레이아웃 (Header, MobileNav)
- [x] 데이터 모델 정의 및 Supabase 마이그레이션

#### Phase 2: 핵심 기능 ✅
- [x] 전체 대시보드 (`/dashboard`)
  - 오늘의 경기
  - 다음 경기 (최근 5개)
  - **내 팀(고정 4팀)**: 진건초, FC진건, FC진건레드, FC진건블루 기준 요약
  - 빠른 링크 (경기 일정, 순위표, 팀 정보)
- [x] 팀별 대시보드 (`/teams`, `/teams/[teamId]`)
  - 팀 목록 (U11/U12 구분)
  - 팀 상세 정보
  - 팀 통계 (경기수, 승/무/패, 득점/실점, 승점)
- 예정된 경기 (상태가 "예정" 또는 "진행중"인 경기 모두 표시)
  - 종료된 경기 목록
- [x] 경기 일정 등록 (`/admin/matches/new`)
  - 단일 경기 입력 폼
  - **일괄 업로드 기능** (Excel 파일)
  - 양식 다운로드 기능 (팀 목록 + 경기장 목록 포함)
  - 경기번호/팀번호/경기장코드(pitch_code) 입력 지원
- [x] 경기 결과 입력 (`/admin/matches/[matchId]/edit`)
  - 점수 입력
  - 경기 상태 변경 (예정/진행중/종료)
  - 경기장 정보 입력
  - 페어플레이 점수 입력
  - 경기 삭제 기능

#### Phase 3: 순위 시스템 ✅
- [x] 기본 순위 계산
  - 승점 계산 (승 3점, 무 1점, 패 0점)
  - 득실차 계산
  - 경기수, 승/무/패 통계
- [x] 페어플레이 점수 시스템
  - 경기별 페어플레이 벌점 입력
  - 선수/지도자/임원별 벌점 구분
  - 벌점 유형별 점수 계산
  - 팀별 페어플레이 점수 누계
- [x] 조별 순위표 (`/standings`)
  - U11/U12 연령대 구분 (탭으로 전환)
  - 1차/2차 리그 구분 (탭으로 전환)
  - 조별 순위표 (그리드 레이아웃)
  - 상위 2팀 하이라이트
  - 페어플레이 점수 표시

#### Phase 4: UI/UX 개선 ✅
- [x] 반응형 디자인
  - PC/모바일 반응형 레이아웃
  - 모바일 네비게이션 (햄버거 메뉴)
  - 카드 기반 레이아웃
- [x] 인증 시스템
  - 관리자 로그인/로그아웃
  - 쿠키 기반 세션 관리
  - 보호된 라우트 (ProtectedRoute)
  - RLS (Row Level Security) 정책

#### Phase 5: 대회 기본정보/내 팀 중심 UX ✅
- [x] 대회 기본정보 관리 (`/admin/settings`)
  - 경기장 코드/이름(venues) 관리
  - 팀 번호(전체 팀 번호/조 내 팀 번호) 관리
- [x] 대시보드 내 팀(고정 4팀) UX
  - 선택 UI 제거, 대시보드에서 4팀 카드로 고정 제공

#### Phase 6: 경기장 정보(카카오맵) ✅
- [x] 경기장 정보 페이지 (`/venues`)
  - 카카오맵 지도 + 마커/인포윈도우
  - 경기장 목록 + 모바일 “길찾기” 버튼
  - 모바일/웹 초기 지도 축척(level) 분리 적용

#### Phase 7: 날씨 정보 및 UI/UX 개선 ✅ (2026-01-30)

#### Phase 8: 경기 결과 자동 수집 기능 정리 ✅ (2026-01-31)
- [x] 기존 경기 결과 자동 수집 기능 완전 삭제
  - 테스트/분석 도구 페이지 삭제 (크롤링 테스트, Network API 분석 도구 등)
  - 관련 컴포넌트 및 API 라우트 삭제
  - 관리자 페이지 링크 정리
- [x] 재구현을 위한 정리 완료
  - 새로운 구조로 재구현 준비 완료
- [x] 현재 날씨 카드 (`/dashboard`)
  - KMA(기상청) API + OpenWeatherMap 하이브리드 전략
  - 현재 기온 + 오늘 최저/최고 기온 표시
  - 실시간 날짜/시간 표시 (MM월 MM일 HH시 MM분)
  - 서버 시간 동기화 (`/api/time` 엔드포인트)
  - 날씨 아이콘 가독성 개선 (테두리 효과)
  - **상세 정보 추가** (v1.7.5):
    - 습도 (REH) - Droplets 아이콘
    - 풍속/풍향 (WSD, VEC) - Wind 아이콘, 풍향 회전 기능
    - 강수확률 (POP) - CloudRain 아이콘
    - 강수량 (RN1) - Gauge 아이콘
    - 체감온도 (계산 가능)
- [x] 주간 예보 카드 (`/dashboard`)
  - OpenWeatherMap 5일 예보 API 활용
  - 10일치 예보 (오늘, 내일, 요일)
  - 오전/오후 강수확률 및 날씨 아이콘
  - 최저/최고 온도 표시
  - 접기/펼치기 기능 (기본 숨김)
- [x] 날씨 번역 개선
  - OpenWeatherMap 한국어 번역을 자연스러운 표현으로 변환
  - 예: "튼구름" → "구름 많음"
- [x] KMA API Hub 전환 (v1.7.2)
  - 기상청 API 허브 (`apihub.kma.go.kr`) 우선 사용
  - `KMA_API_HUB_KEY` 환경 변수 지원
  - 공공데이터포털 fallback 지원
- [x] 1차/2차 리그 구분 강화
  - venues 테이블에 `round` 컬럼 추가 (1차/2차 구분)
  - 경기장 관리에서 1차/2차 리그별 설정 가능
  - 팀 번호 관리에서 1차/2차 리그별 설정 가능
- [x] 관리자 페이지 네비게이션 개선
  - 모든 관리자 서브 페이지에 "관리자 홈으로", "목록으로" 버튼 추가
  - 사용자 흐름 개선
- [x] 대시보드 UI 개선 (v1.7.5)
  - 섹션 제목 변경: "내 팀" → "팀 별 일정"
  - 날씨 정보 그리드 레이아웃 개선

### 7.2 실제 구현된 페이지 구조

```
/ (홈 - 대시보드로 리다이렉트)
├── /dashboard (전체 경기 현황 대시보드)
├── /login (관리자 로그인)
├── /teams
│   ├── /teams (팀 목록 - U11/U12 구분)
│   └── /teams/[teamId] (팀별 상세 페이지)
├── /matches
│   ├── /matches (경기 목록 - 1차/2차 리그 구분)
│   └── /matches/[matchId] (경기 상세 페이지)
├── /standings (조별 순위)
│   ├── U11/U12 탭으로 연령대 전환
│   └── 1차/2차 리그 탭으로 리그 전환
├── /venues (경기장 정보 - 카카오맵)
├── /api/time (서버 시간 동기화 API)
└── /admin (관리자 대시보드 - 관리자 전용)
    └── /admin/matches
        ├── /admin/matches (경기 관리 목록)
        ├── /admin/matches/new (경기 일정 등록)
        └── /admin/matches/[matchId]/edit (경기 결과 입력)
    └── /admin/settings (대회 기본정보)
```

### 7.3 실제 구현된 컴포넌트 구조

```
components/
├── Layout/
│   ├── Header.tsx (메인 헤더, 로고, 네비게이션)
│   └── MobileNav.tsx (모바일 네비게이션)
├── Dashboard/
│   ├── MatchCard.tsx (경기 카드 컴포넌트)
│   ├── WeeklyForecastCard.tsx (주간 예보 카드)
│   ├── CurrentDateTime.tsx (실시간 날짜/시간 표시 - 서버 시간 동기화)
│   └── (내 팀 고정 4팀 - 선택 UI 제거)
├── Venues/
│   ├── VenueMap.tsx (카카오맵 지도/마커)
│   └── VenueList.tsx (경기장 목록 + 길찾기)
├── Match/
│   ├── MatchForm.tsx (단일 경기 입력 폼)
│   ├── BulkUploadForm.tsx (대진표 일괄 업로드)
│   ├── MatchResultForm.tsx (경기 결과 입력)
│   ├── FairPlayForm.tsx (페어플레이 점수 입력)
│   ├── DeleteMatchButton.tsx (경기 삭제 버튼)
│   └── YouTubeEmbed.tsx (유튜브 영상 임베드)
├── Standings/
│   └── AgeGroupTabs.tsx (U11/U12 탭)
└── auth/
    ├── LoginForm.tsx (로그인 폼)
    ├── LogoutButton.tsx (로그아웃 버튼)
    └── ProtectedRoute.tsx (보호된 라우트)
```

### 7.4 데이터베이스 스키마 (구현 완료)

```sql
-- teams 테이블
- id, name, age_group (U11/U12), group_name, created_at
- registration_no (대회 전체 팀 번호, 선택)
- group_team_no (조 내 팀 번호 1~4, 선택)

-- matches 테이블
- id
- age_group (U11/U12)
- round (1차/2차), group_name, match_no
- date, time
- pitch_code (A~Z, venues.code)
- home_team_id, away_team_id, home_team_no, away_team_no
- home_score, away_score
- status (예정/진행중/종료)
- youtube_link
- created_at, updated_at

-- fair_play_points 테이블
- id, match_id, team_id
- player_id (선수 배번 또는 이름)
- staff_type (선수/지도자/임원)
- penalty_type (경고/경고누적퇴장/직접퇴장 등)
- points (벌점)
- description (설명)
- created_at

-- venues 테이블 (경기장 정보)
- id, code (A~H), name, round (1차/2차), created_at
```

### 7.5 주요 기능 상세

#### 경기 일정 일괄 등록 (Excel 업로드)
- Excel 파일 업로드 지원
- 양식 다운로드 기능 (팀 목록 + 경기장 목록 포함)
- 자동 검증 (필수 필드, 팀명 매칭, 날짜 형식)
- 일괄 등록 결과 피드백
- 경기번호(match_no), 경기장코드(pitch_code), 팀번호(홈/원정 팀번호) 입력 지원

#### 페어플레이 점수 시스템
- 경기별 벌점 입력
- 선수/지도자/임원 구분
- 벌점 유형별 자동 계산
- 조별 순위표에 페어플레이 점수 표시

#### 조별 순위 페이지
- U11/U12 연령대 탭으로 구분
- 1차/2차 리그 탭으로 구분
- 조별 순위표 그리드 레이아웃
- 상위 2팀 하이라이트 (녹색 배경)
- 페어플레이 점수 색상 구분 (0점: 녹색, 1~3점: 노란색, 4점 이상: 빨간색)

#### 팀 상세 페이지
- 팀 통계 카드 (경기수, 승점, 승/무/패, 득점/실점)
- 예정된 경기 (상태가 "예정" 또는 "진행중"인 경기 모두 표시, 날짜순 정렬)
- 종료된 경기 목록
- 팀명 클릭 시 팀 상세 페이지로 이동

### 7.6 향후 구현 예정 기능

- [ ] 유튜브 영상 링크 입력 및 재생 기능
- [ ] 실시간 업데이트 (Supabase Realtime)
- [ ] 데이터 시각화 (차트, 그래프)
- [ ] 경기 알림 기능
- [ ] 다중 대회 지원
- [ ] **경기 결과 자동 크롤링 기능** (재구현 예정)
  - 각 종 대회의 경기 결과를 웹페이지에서 크롤링하여 자동으로 업데이트
  - 1차/2차 리그 경기 결과 자동 수집 및 DB 업데이트
  - 관리자 페이지에서 크롤링 실행 및 결과 확인
  - 크롤링 대상 URL 설정 및 스케줄링 기능
  - **참고**: 이전 구현(v1.5.0)은 삭제되었으며, 새로운 구조로 재구현 예정

## 10. 버전 관리

### v1.8.0 (2026-01-31)
**작성일시**: 2026-01-31  
**주요 변경사항**:
- ✅ 경기 결과 자동 수집 기능 완전 삭제
  - 기존 구현(v1.5.0)의 모든 파일 및 기능 제거
  - 테스트/분석 도구 페이지 삭제
  - 관련 컴포넌트 및 API 라우트 삭제
  - 관리자 페이지 링크 정리
- ✅ 재구현을 위한 정리 완료
  - 새로운 구조로 재구현 준비 완료
- 🔄 향후 계획: 경기 결과 자동 수집 기능 재구현

### v1.7.1 (2026-01-30 19:45:00)
**작성일시**: 2026-01-30 19:45:00  
**주요 변경사항**:
- ✅ 서버 시간 동기화 기능 추가 (`/api/time` 엔드포인트)
- ✅ 클라이언트 시간과 서버 시간 오프셋 계산 및 동기화
- ✅ 네트워크 지연 시간 보정 로직 추가
- ✅ 1분마다 서버 시간 재동기화, 1초마다 표시 업데이트

### v1.7.0 (2026-01-30 19:30:00)
**작성일시**: 2026-01-30 19:30:00  
**주요 변경사항**:
- ✅ 날씨 정보 기능 추가 (KMA + OpenWeatherMap 하이브리드)
- ✅ 주간 예보 카드 추가 (10일치 예보)
- ✅ 실시간 날짜/시간 표시 (현재 PC 시간 기준)
- ✅ 날씨 아이콘 가독성 개선 (테두리 효과)
- ✅ 날씨 번역 개선 (자연스러운 한국어)
- ✅ 1차/2차 리그 구분 강화 (venues, team numbers)
- ✅ 관리자 페이지 네비게이션 개선
- ✅ Supabase 디버그 로그 최적화

### v1.6.0 (2026-01-28 15:00:00)
**작성일시**: 2026-01-28 15:00:00  
**주요 변경사항**:
- ✅ 경기장 정보 페이지 (`/venues`) - 카카오맵 통합
- ✅ 대시보드 내 팀 고정 4팀 (선택 UI 제거)
- ✅ 대회 기본정보 관리 페이지 (`/admin/settings`)
- ✅ venues 테이블에 `round` 컬럼 추가 (1차/2차 구분)

### v1.5.0 (2026-01-27 14:00:00)
**작성일시**: 2026-01-27 14:00:00  
**주요 변경사항**:
- ✅ 페어플레이 점수 시스템 구축
- ✅ 조별 순위 계산 로직 (대회규정 제 13조 반영)
- ✅ 1차/2차 리그 구분 기능
- ✅ fair_play_points 테이블 및 입력 UI

### v1.4.0 (2026-01-26 16:00:00)
**작성일시**: 2026-01-26 16:00:00  
**주요 변경사항**:
- ✅ 경기 일정 일괄 등록 기능 (Excel 업로드)
- ✅ 경기번호, 팀번호, 경기장코드 입력 지원
- ✅ 일정 데이터 정합성 검증 및 정리

### v1.3.0 (2026-01-25 15:00:00)
**작성일시**: 2026-01-25 15:00:00  
**주요 변경사항**:
- ✅ 관리자 인증 시스템 구축
- ✅ RLS (Row Level Security) 정책 적용
- ✅ 보호된 라우트 (ProtectedRoute) 구현

### v1.2.0 (2026-01-24 14:00:00)
**작성일시**: 2026-01-24 14:00:00  
**주요 변경사항**:
- ✅ 조별 순위표 페이지 (`/standings`)
- ✅ U11/U12 연령대 구분
- ✅ 1차/2차 리그 구분

### v1.1.0 (2026-01-23 13:00:00)
**작성일시**: 2026-01-23 13:00:00  
**주요 변경사항**:
- ✅ 팀별 대시보드 (`/teams`, `/teams/[teamId]`)
- ✅ 경기 카드 컴포넌트
- ✅ 반응형 디자인 적용

### v1.0.0 (2026-01-22 10:00:00)
**작성일시**: 2026-01-22 10:00:00  
**주요 변경사항**:
- ✅ 프로젝트 초기 설정 (Next.js 14, TypeScript, Tailwind CSS)
- ✅ 기본 라우팅 구조 (App Router)
- ✅ Supabase 데이터베이스 스키마 설계 및 마이그레이션
- ✅ 기본 레이아웃 (Header, MobileNav)

## 8. 데이터 저장 전략

### Supabase (PostgreSQL) 사용
- **테이블 구조**:
  - `teams`: 팀 정보
  - `matches`: 경기 정보
  - `standings`: 조별 순위 (뷰 또는 계산된 테이블)
  - `admin_users`: 관리자 사용자 정보 (Supabase Auth와 연동)

### 인증 및 권한 관리
- **Supabase Auth**: 관리자 로그인/로그아웃
- **Row Level Security (RLS)**:
  - 모든 사용자: SELECT 권한 (조회만 가능)
  - 관리자만: INSERT, UPDATE, DELETE 권한
- **관리자 역할**: `is_admin` 플래그 또는 별도 역할 테이블

### 데이터베이스 스키마
```sql
-- 팀 테이블
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('U11', 'U12')),
  group_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경기 테이블
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME,
  round TEXT NOT NULL CHECK (round IN ('1차', '2차')),
  group_name TEXT NOT NULL,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_score INTEGER DEFAULT NULL,
  away_score INTEGER DEFAULT NULL,
  status TEXT NOT NULL DEFAULT '예정' CHECK (status IN ('예정', '진행중', '종료')),
  youtube_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 페어플레이 벌점 테이블 (경기별 팀별 벌점 기록)
CREATE TABLE fair_play_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id TEXT, -- 선수 배번 또는 이름
  staff_type TEXT CHECK (staff_type IN ('선수', '지도자', '임원')),
  penalty_type TEXT NOT NULL, -- '경고', '경고누적퇴장', '직접퇴장', '경고후직접퇴장', '공정위팀경고', '공정위경고', '공정위출전정지'
  points INTEGER NOT NULL, -- 벌점
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);

-- 관리자만 데이터 입력/수정/삭제 가능
CREATE POLICY "Only admins can insert matches" ON matches 
  FOR INSERT WITH CHECK (auth.jwt() ->> 'is_admin' = 'true');
CREATE POLICY "Only admins can update matches" ON matches 
  FOR UPDATE USING (auth.jwt() ->> 'is_admin' = 'true');
```

## 9. 고려사항

### 9.1 성능
- 경기 데이터 캐싱
- 순위 계산 최적화
- 이미지 최적화

### 9.2 접근성
- 키보드 네비게이션
- 스크린 리더 지원
- 색상 대비

### 9.3 확장성
- 다중 대회 지원
- 사용자 권한 관리 (Supabase Auth + RLS)
- 실시간 업데이트 (Supabase Realtime)
- 관리자 역할 세분화 (필요시)

---

## 11. 문서 정보

**📅 문서 작성일**: 2026-01-22 10:00:00  
**🔄 최종 업데이트**: 2026-01-31  
**📝 현재 버전**: v1.8.0  
**✍️ 작성자**: AI Assistant (Claude Sonnet 4.5)  
**🛠️ 개발 도구**: Cursor IDE
