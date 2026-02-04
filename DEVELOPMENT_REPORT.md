# Festival (JG_Manager) 개발 보고서

## 📋 프로젝트 개요

유소년 축구 페스티벌 대회의 **경기 일정/결과/페어플레이 벌점**을 관리하고, **조별 순위**를 산출·공개하며, 사용자가 **내 팀 중심으로 대시보드**에서 빠르게 확인할 수 있는 웹 애플리케이션을 개발했습니다.

**📅 개발 기간**: 2026년 1월 (지속 개선)  
**💻 개발 환경**: Windows 10, Node.js, Next.js 14(App Router)  
**🗄️ 데이터베이스**: Supabase (PostgreSQL)  

---

## 🛠️ 기술 스택

### 핵심 기술
- **⚛️ Next.js 14 (App Router)**: 서버/클라이언트 컴포넌트 기반 웹앱 프레임워크
- **🟦 TypeScript**: 타입 기반 안정성 확보(DB 타입/컴포넌트 계약)
- **🎨 Tailwind CSS**: 반응형 UI/UX 구현
- **🗄️ Supabase (PostgreSQL + Auth + RLS)**: 데이터 저장/인증/권한 제어
- **📄 XLSX (xlsx 라이브러리)**: 엑셀 기반 일정 일괄 등록(업로드/템플릿 생성)

### 주요 라이브러리(개념)
- **Supabase JS / SSR 패키지**: 브라우저/서버 환경에서 세션 및 DB 접근
- **next/link / next/navigation**: 라우팅 및 query 기반 필터링(탭, 내 팀 선택 등)
- **lucide-react**: 아이콘(모바일 메뉴 등, 사용 중)

---

## 📚 라이브러리 상세 설명

### 1. ⚛️ Next.js (App Router)
**🎯 역할**: 서버 렌더링/라우팅/페이지 구성  
**💡 프로젝트에서의 사용**:
- `/dashboard`, `/matches`, `/standings`, `/teams`, `/admin` 등 App Router 기반 페이지 구현
- Server Component에서 Supabase 서버 클라이언트로 데이터 조회
- Client Component로 폼/업로드/내 팀 선택 등 인터랙션 구현

### 2. 🟦 TypeScript
**🎯 역할**: 타입 안정성 확보  
**💡 프로젝트에서의 사용**:
- `types/database.ts`에 `Team`, `Match`, `Standing`, `FairPlayPoint`, `Venue` 타입 정의
- 빌드/타입체크 단계에서 회귀 오류를 빠르게 차단

### 3. 🎨 Tailwind CSS
**🎯 역할**: UI 스타일링/반응형 구현  
**💡 프로젝트에서의 사용**:
- 카드 기반 경기 카드(`MatchCard`)
- 표 기반 순위표, 관리자 설정 테이블
- 모바일 네비게이션(햄버거 메뉴)

### 4. 🗄️ Supabase (PostgreSQL + Auth + RLS)
**🎯 역할**: DB/인증/권한 관리  
**💡 프로젝트에서의 사용**:
- Postgres 테이블(`teams`, `matches`, `fair_play_points`, `venues`)
- 관리자 로그인/로그아웃
- RLS 정책으로 “조회는 모두, 쓰기/삭제는 관리자만”
- SSR 환경에서 쿠키 기반 세션 동기화(`middleware.ts`, `lib/supabase/server.ts`)

### 6. 🌤️ 날씨 API (KMA + OpenWeatherMap)
**🎯 역할**: 현재 날씨 및 주간 예보 제공  
**💡 프로젝트에서의 사용**:
- KMA(기상청) API: 1순위 날씨 데이터 (새벽 시간대 제외)
- OpenWeatherMap API: 2순위 날씨 데이터 (KMA 실패 시 fallback)
- 현재 날씨 카드: 현재 기온 + 오늘 최저/최고 기온
- 주간 예보 카드: 10일치 예보 (오전/오후 강수확률, 최저/최고 온도)

### 5. 📄 xlsx
**🎯 역할**: 엑셀 업로드 파싱 및 템플릿 생성  
**💡 프로젝트에서의 사용**:
- 관리자 “경기 일정 일괄 등록”에서 엑셀 업로드 → rows 파싱 → matches insert
- 템플릿 다운로드 시 “팀 목록(U11/U12) + 경기장 목록” 시트 포함

### 7. 🗺️ Kakao Map API
**🎯 역할**: 경기장 위치 표시 및 길찾기  
**💡 프로젝트에서의 사용**:
- `/venues` 페이지에서 경기장 위치 지도 표시
- 모바일에서 길찾기 기능 제공

---

## 🔗 라이브러리 의존성 관계(개념)

```
Next.js (App Router)
├── Server Components
│   └── lib/supabase/server.ts (createServerClient, cookies)
│       └── Supabase (PostgreSQL)
├── Client Components
│   └── lib/supabase/client.ts (createBrowserClient)
│       └── Supabase (Auth/DB)
├── Tailwind CSS (UI)
└── xlsx (관리자 엑셀 업로드/템플릿)
```

### 각 라이브러리 핵심 역할 요약

| 라이브러리/기술 | 주요 역할 | 중요도 |
|---|---|---|
| Next.js | 라우팅/SSR/CSR 구성 | ⭐⭐⭐⭐⭐ |
| Supabase | DB/Auth/RLS | ⭐⭐⭐⭐⭐ |
| TypeScript | 타입 안정성/회귀 방지 | ⭐⭐⭐⭐⭐ |
| Tailwind CSS | UI/반응형 | ⭐⭐⭐⭐ |
| xlsx | 일괄 등록/템플릿 | ⭐⭐⭐⭐ |

---

## 📊 데이터 구조

### 🗄️ 데이터 모델(요약)

#### teams
- 팀의 기본 정보 + 팀 번호 체계
- **주요 컬럼**: `id`, `name`, `age_group`, `group_name`, `registration_no`, `group_team_no`

#### matches
- 리그/조/경기번호/경기장코드 기반 일정 + 팀 매핑 + 결과/상태
- **주요 컬럼**:  
  - 메타: `age_group`, `round`, `group_name`, `match_no`  
  - 일정: `date`, `time`  
  - 경기장: `pitch_code`(A~Z, venues.code)  
  - 팀: `home_team_id`, `away_team_id`, `home_team_no`, `away_team_no`  
  - 결과: `home_score`, `away_score`, `status`, `youtube_link`

#### fair_play_points
- 경기별 팀별 벌점 기록(선수/지도자/임원 구분)

#### venues
- 경기장 코드/이름 테이블
- **주요 컬럼**: `code`, `name`

---

## 🧱 Supabase 테이블(핵심)

### 1) `teams`
- 조회: 전체 공개
- 쓰기/수정/삭제: 관리자만
- 확장: `registration_no`(전체 번호), `group_team_no`(조 내 번호)

### 2) `matches`
- 조회: 전체 공개
- 쓰기/수정/삭제: 관리자만
- 확장: `age_group`, `match_no`, `pitch_code`, `home_team_no`, `away_team_no`
- `age_group`은 트리거로 home/away 팀의 연령대 일치 검증 및 자동 설정

### 3) `fair_play_points`
- 조회: 전체 공개
- 쓰기/수정/삭제: 관리자만

### 4) `venues`
- 조회: 전체 공개
- 쓰기/수정/삭제: 관리자만

---

## 🚀 개발 과정(요약)

### 1단계: 기본 페이지 구축
- `/dashboard`, `/matches`, `/standings`, `/teams` UI 구성
- 경기 카드/순위표/팀 상세 화면 구성

### 2단계: 관리자 기능 구축
- 관리자 로그인/권한 보호(`ProtectedRoute`)
- 경기 일정 등록(단일 입력 폼)
- 경기 결과 입력/수정, 경기 삭제

### 3단계: 페어플레이 시스템 구축
- 규정 기반 벌점 입력 UI/저장(`fair_play_points`)
- 순위 계산에 페어플레이 점수 반영(동점 처리 우선순위)

### 4단계: 일정 데이터 정합성 확보
- HTML 파싱 한계 → XLSX 기반 파싱으로 전환
- 중복/누락 경기 검증 및 정리(스크립트 기반)

### 5단계: 스키마 보완 및 운영 UX 개선
- `pitch_code`, `venues(code,name)` 도입
- 경기번호(`match_no`), 팀번호(`home_team_no/away_team_no`) 도입
- 팀 번호 관리(`registration_no`, `group_team_no`) 도입
- 관리자 “대회 기본정보” 페이지(`/admin/settings`) 추가

### 6단계: 메인 대시보드의 “내 팀 중심” 전환
- 내 팀 고정 4팀 (진건초, FC진건, FC진건레드, FC진건블루)
- 선택 UI 제거, 대시보드에서 4팀 카드로 고정 제공
- 1차/2차 리그 조 정보 표시 및 순위표 링크

### 7단계: 경기장 정보 및 날씨 기능 추가 (2026-01-30)
- 경기장 정보 페이지 (`/venues`) - 카카오맵 통합
- 현재 날씨 카드 (KMA + OpenWeatherMap 하이브리드)
- 주간 예보 카드 (10일치 예보)
- 실시간 날짜/시간 표시 (서버 시간 동기화)
- 날씨 아이콘 가독성 개선
- 날씨 번역 개선

### 8단계: 서버 시간 동기화 (2026-01-30 19:45:00)
- 서버 시간 API 엔드포인트 (`/api/time`) 추가
- 클라이언트-서버 시간 오프셋 계산 및 동기화
- 네트워크 지연 시간 보정
- PC 시간과 서버 시간 차이 해결

---

## ✨ 핵심 기능

### 1) 대시보드(메인)
- **현재 날씨**: 현재 기온 + 오늘 최저/최고 기온 + 실시간 날짜/시간 (서버 시간 동기화)
  - 습도, 풍속/풍향, 강수확률, 강수량, 체감온도 표시
  - 각 정보에 아이콘 추가 (Droplets, Wind, CloudRain, Gauge)
  - 풍향 아이콘 회전 기능
- **주간 예보**: 10일치 예보 (오전/오후 강수확률, 최저/최고 온도)
  - 접기/펼치기 기능 (기본 숨김)
- **팀 별 일정(고정 4팀)**: 진건초, FC진건, FC진건레드, FC진건블루
  - 1차/2차 리그 조 정보 및 순위표 링크
  - 오늘의 경기 / 다음 경기
- **서버 시간 동기화**: `/api/time` 엔드포인트를 통한 정확한 시간 표시

### 2) 경기 일정(`/matches`)
- U11/U12 탭
- 1차/2차 섹션 표시

### 3) 팀 정보(`/teams`, `/teams/[teamId]`)
- 팀 상세: 예정/진행중 경기 모두 표시, 종료 경기 별도 표시, 팀 통계

### 4) 순위표(`/standings`)
- U11/U12 탭 + 1차/2차 탭
- 페어플레이 점수 포함, 상위 팀 하이라이트

### 5) 관리자(`/admin`)
- 경기 일정 등록(단일/일괄)
- 경기 결과 입력/수정, 페어플레이 입력, 경기 삭제
- 대회 기본정보(`/admin/settings`): 경기장/팀 번호 관리 (1차/2차 리그 구분)
- 모든 관리자 서브 페이지에 네비게이션 버튼 추가

---

## 🔄 데이터 처리 및 분석(요약)

### 순위 계산 로직
- 종료 경기만 대상으로 팀별:
  - 경기수/승/무/패/득점/실점/득실차/승점 계산
- `fair_play_points` 합산으로 페어플레이 벌점 누계 계산
- 정렬 우선순위:
  1. 승점(높은 순)
  2. 페어플레이 벌점(낮은 순)
  3. 추첨(동순위 처리)

---

## 🎨 UI/UX 구현

### 반응형/모바일
- 헤더 + 모바일 네비게이션
- 카드 기반 경기 표시, 표 기반 순위표
- 경기장 정보 페이지에서 모바일 길찾기 기능

### 관리자 UX
- 엑셀 일괄 등록 + 템플릿 다운로드
- 기본정보(경기장/팀번호) 선행 세팅 → 일정 등록 시 선택형으로 사용

---

## 🐛 해결한 문제들(요약)

### 1) 관리자 로그인 후에도 관리자 페이지 접근 실패
- SSR 쿠키 세션 동기화 문제를 `middleware.ts` 및 서버 클라이언트 쿠키 처리 로직으로 안정화

### 2) RLS 정책으로 인해 특정 테이블 접근 불가
- `SECURITY DEFINER` 기반 `is_admin()` 함수를 도입하고 정책을 재정의하여 해결

### 3) 일정 데이터 중복/누락
- XLSX 파싱 로직 개선(한 셀에 2경기 존재 케이스 처리)
- 중복 제거 + 누락 삽입 스크립트로 정합성 복구

---

## 📁 파일 구조(요약)

```
JG_Manager/
├── app/
│   ├── dashboard/
│   ├── matches/
│   ├── standings/
│   ├── teams/
│   ├── rules/
│   ├── api/
│   │   └── time/               # 서버 시간 동기화 API
│   └── admin/
│       ├── matches/
│       └── settings/          # 대회 기본정보
├── components/
│   ├── Dashboard/             # MatchCard, WeeklyForecastCard, CurrentDateTime
│   ├── Match/                 # MatchForm, BulkUploadForm, FairPlayForm 등
│   ├── Admin/                 # VenueManager, TeamNumberManager
│   ├── Venues/                # VenueMap, VenueList
│   └── Layout/
├── lib/
│   ├── supabase/              # server/client/queries
│   ├── weather.ts             # KMA + OpenWeatherMap 날씨 API
│   ├── venues.ts               # 경기장 유틸리티
│   └── utils.ts
├── supabase/
│   └── migrations/
├── scripts/                   # 데이터 검증/정리/임포트 스크립트
├── DESIGN_THINKING.md
└── DEVELOPMENT_REPORT.md      # (본 문서)
```

---

## 🎯 향후 개선 사항

### 기능
- [ ] 경기 종료 시 **유튜브 링크 입력/재생 UX** 고도화
- [ ] 내 팀 설정을 계정 기반(서버 저장)으로 확장(user_preferences 등)
- [ ] 2차 리그 일정/조 편성 기능 확장
- [ ] **경기 결과 자동 크롤링 기능** (재구현 예정)
  - 각 종 대회의 경기 결과를 웹페이지에서 크롤링하여 자동으로 업데이트
  - 1차/2차 리그 경기 결과 자동 수집 및 DB 업데이트
  - 관리자 페이지에서 크롤링 실행 및 결과 확인
  - 크롤링 대상 URL 설정 및 스케줄링 기능
  - 경기 매칭 로직 (팀명, 날짜, 시간 기반)
  - 크롤링 결과 검증 및 오류 처리
  - **참고**: 이전 구현(v1.5.0)은 삭제되었으며, 새로운 구조로 재구현 예정

### 품질
- [ ] `react-hooks/exhaustive-deps` 경고 정리(`FairPlayForm`)
- [ ] 운영자용 검증 도구(경기번호/팀번호/경기장코드 누락 체크) UI 추가

---

## ✅ 결론

대회 운영에 필요한 **일정/결과/페어플레이/순위**를 안정적으로 관리할 수 있는 기반을 구축했고, 이제 대시보드를 **내 팀 중심의 메인 화면**으로 전환하여 사용자 경험을 강화했습니다.  
관리자에게는 "기본정보(경기장/팀번호) → 일정 등록(단일/일괄) → 결과/벌점 입력" 흐름을 제공하여 운영 효율을 높였습니다.

---

## 📋 문서 정보

**📅 문서 작성일**: 2026-01-28 15:00:00  
**🔄 최종 업데이트**: 2026-01-31  
**📝 현재 버전**: v1.8.0  
**✍️ 작성자**: AI Assistant (Claude Sonnet 4.5)  
**🛠️ 개발 도구**: Cursor IDE

## 📝 버전 관리

### v1.8.0 (2026-01-31)
**작성일시**: 2026-01-31  
**🔄 주요 변경사항**:
- ✅ 경기 결과 자동 수집 기능 완전 삭제
  - 기존 구현(v1.5.0)의 모든 파일 및 기능 제거
  - 삭제된 페이지:
    - `/admin/crawl-test` (크롤링 테스트)
    - `/admin/crawl-test-results` (경기 결과 크롤링 테스트 임시)
    - `/admin/network-analyzer` (Network API 분석 도구)
    - `/admin/crawl-results` (경기 결과 자동 수집)
  - 삭제된 컴포넌트:
    - `CrawlTestForm.tsx`
    - `CrawlTestResultsForm.tsx`
    - `NetworkAnalyzerForm.tsx`
    - `QuickAPITest.tsx`
    - `PageStructureAnalyzer.tsx`
    - `CrawlResultsForm.tsx`
    - `TournamentSelector.tsx`
  - 삭제된 API 라우트:
    - `/api/crawl/test`
    - `/api/crawl/test-results`
    - `/api/crawl/analyze-network`
    - `/api/crawl/analyze-page-structure`
    - `/api/crawl/results`
    - `/api/crawl/playwright-results`
    - `/api/crawl/fetch-tournaments`
  - 관리자 페이지 링크 정리
- ✅ 재구현을 위한 정리 완료
  - 새로운 구조로 재구현 준비 완료
  - 향후 계획: 경기 결과 자동 수집 기능 재구현

**📝 기술적 결정 사항**:
- 이전 구현(v1.5.0)에서 발견된 문제점들을 해결하기 위해 완전히 삭제하고 재구현하기로 결정
- 새로운 구조에서는 더 간단하고 효율적인 방식으로 구현 예정

### v1.7.5 (2026-01-30 11:30:00)
**작성일시**: 2026-01-30 11:30:00  
**✨ 주요 기능 추가**:
- 현재 날씨 카드에 상세 정보 추가
  - 습도 (REH) - Droplets 아이콘
  - 풍속/풍향 (WSD, VEC) - Wind 아이콘, 풍향 회전 기능
  - 강수확률 (POP) - CloudRain 아이콘
  - 강수량 (RN1) - Gauge 아이콘
  - 체감온도 (계산 가능)
- KMA API Hub 전환 지원
  - `KMA_API_HUB_KEY` 환경 변수 지원
  - 기상청 API 허브 (`apihub.kma.go.kr`) 우선 사용
  - 공공데이터포털 (`apis.data.go.kr`) fallback 지원

**🔧 개선 사항**:
- 강수확률 표시 문제 해결 (초단기예보 + 단기예보 fallback)
- 날씨 정보 레이아웃 개선 (그리드 레이아웃, 아이콘 추가)
- 대시보드 섹션 제목 변경: "내 팀" → "팀 별 일정"
- 풍향 아이콘 회전 기능 (CSS transform)
- 체감온도 계산 로직 개선 (Wind Chill Index)

### v1.7.4 (2026-01-30 20:00:00)
**작성일시**: 2026-01-30 20:00:00  
**✨ 주요 기능 추가**:
- 주간 예보 카드 접기/펼치기 기능
- 대시보드에서 주간 예보 기본 숨김 처리

**🔧 개선 사항**:
- 대시보드 UI 개선 (현재 날씨 중심)

### v1.7.3 (2026-01-30 19:50:00)
**작성일시**: 2026-01-30 19:50:00  
**✨ 주요 기능 추가**:
- KMA API 초단기예보 통합 (SKY, PTY)
- KMA API 단기예보 통합 (최저/최고 기온)

**🔧 개선 사항**:
- KMA API 활용도 향상
- 날씨 설명 정보 안정성 개선

### v1.7.2 (2026-01-30 19:48:00)
**작성일시**: 2026-01-30 19:48:00  
**✨ 주요 기능 추가**:
- 기상청 API 허브 (`apihub.kma.go.kr`) 전환
- `KMA_API_HUB_KEY` 환경 변수 지원

**🔧 개선 사항**:
- KMA API 엔드포인트 업데이트
- 인증 파라미터 변경 (`serviceKey` → `authKey`)

### v1.7.1 (2026-01-30 19:45:00)
**작성일시**: 2026-01-30 19:45:00  
**✨ 주요 기능 추가**:
- 서버 시간 동기화 기능 (`/api/time` 엔드포인트)
- 클라이언트-서버 시간 오프셋 계산 및 동기화
- 네트워크 지연 시간 보정 로직
- 1분마다 서버 시간 재동기화, 1초마다 표시 업데이트

**🔧 개선 사항**:
- PC 시간과 서버 시간 차이 해결
- 정확한 실시간 날짜/시간 표시

### v1.7.0 (2026-01-30 19:30:00)
**작성일시**: 2026-01-30 19:30:00  
**✨ 주요 기능 추가**:
- 날씨 정보 기능 (KMA + OpenWeatherMap 하이브리드)
- 주간 예보 카드 (10일치 예보)
- 실시간 날짜/시간 표시 (PC 시간 기준)
- 날씨 아이콘 가독성 개선
- 날씨 번역 개선

**🔧 개선 사항**:
- 1차/2차 리그 구분 강화 (venues, team numbers)
- 관리자 페이지 네비게이션 개선
- Supabase 디버그 로그 최적화

### v1.6.0 (2026-01-28 15:00:00)
**작성일시**: 2026-01-28 15:00:00  
**✨ 주요 기능 추가**:
- 경기장 정보 페이지 (`/venues`) - 카카오맵 통합
- 대시보드 내 팀 고정 4팀 (선택 UI 제거)
- 대회 기본정보 관리 페이지 (`/admin/settings`)

**🔧 개선 사항**:
- venues 테이블에 `round` 컬럼 추가 (1차/2차 구분)
- 모바일 길찾기 기능

### v1.5.0 (2026-01-27 14:00:00)
**작성일시**: 2026-01-27 14:00:00  
**✨ 주요 기능 추가**:
- 페어플레이 점수 시스템 구축
- 조별 순위 계산 로직 (대회규정 제 13조 반영)
- 1차/2차 리그 구분 기능

**🔧 개선 사항**:
- fair_play_points 테이블 및 입력 UI
- 순위표에 페어플레이 점수 표시

**📝 참고**:
- 이후 경기 결과 자동 수집 기능이 추가되었으나, v1.8.0에서 완전히 삭제되고 재구현 예정

### v1.4.0 (2026-01-26 16:00:00)
**작성일시**: 2026-01-26 16:00:00  
**✨ 주요 기능 추가**:
- 경기 일정 일괄 등록 기능 (Excel 업로드)
- 경기번호, 팀번호, 경기장코드 입력 지원

**🔧 개선 사항**:
- 일정 데이터 정합성 검증 및 정리
- 템플릿 다운로드 기능

### v1.3.0 (2026-01-25 15:00:00)
**작성일시**: 2026-01-25 15:00:00  
**✨ 주요 기능 추가**:
- 관리자 인증 시스템 구축
- RLS (Row Level Security) 정책 적용
- 보호된 라우트 (ProtectedRoute) 구현

**🔧 개선 사항**:
- SSR 쿠키 세션 동기화 안정화

### v1.2.0 (2026-01-24 14:00:00)
**작성일시**: 2026-01-24 14:00:00  
**✨ 주요 기능 추가**:
- 조별 순위표 페이지 (`/standings`)
- U11/U12 연령대 구분
- 1차/2차 리그 구분

**🔧 개선 사항**:
- 상위 2팀 하이라이트
- 페어플레이 점수 색상 구분

### v1.1.0 (2026-01-23 13:00:00)
**작성일시**: 2026-01-23 13:00:00  
**✨ 주요 기능 추가**:
- 팀별 대시보드 (`/teams`, `/teams/[teamId]`)
- 경기 카드 컴포넌트
- 반응형 디자인 적용

**🔧 개선 사항**:
- 모바일 네비게이션 (햄버거 메뉴)
- 카드 기반 레이아웃

### v1.0.0 (2026-01-22 10:00:00)
**작성일시**: 2026-01-22 10:00:00  
**✨ 주요 기능 추가**:
- 프로젝트 초기 설정 (Next.js 14, TypeScript, Tailwind CSS)
- 기본 라우팅 구조 (App Router)
- Supabase 데이터베이스 스키마 설계 및 마이그레이션
- 기본 레이아웃 (Header, MobileNav)
- 전체 대시보드 (`/dashboard`)
- 경기 일정 등록 (`/admin/matches/new`)
- 경기 결과 입력 (`/admin/matches/[matchId]/edit`)

