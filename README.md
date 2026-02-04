# 진건 축구팀 대회 관리 시스템

유소년 축구팀 대회 일정 및 결과 관리 웹 애플리케이션

## 기능

- 전체 경기 현황 대시보드
- 팀별 현황 대시보드
- 대진표 입력 (관리자 전용)
- 경기 결과 입력 (관리자 전용)
- 유튜브 영상 링크 관리
- 조별 순위 확인
- PC/모바일 반응형 디자인

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `.env.local` 파일 생성 및 환경 변수 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

3. Supabase SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행

### 3. 카카오맵 API 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com)에서 애플리케이션 생성
2. 플랫폼 설정에서 웹 플랫폼 등록 (도메인: `http://localhost:3000`)
3. JavaScript 키를 복사하여 `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`로 설정

### 4. 관리자 계정 설정

Supabase Dashboard > Authentication > Users에서 관리자 계정 생성 후, 해당 사용자의 `raw_user_meta_data`에 `is_admin: true` 추가

또는 Supabase SQL Editor에서:

```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'your-admin-email@example.com';
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── Layout/           # 레이아웃 컴포넌트
│   ├── Dashboard/       # 대시보드 컴포넌트
│   ├── Match/           # 경기 관련 컴포넌트
│   └── Team/            # 팀 관련 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── supabase/        # Supabase 클라이언트
│   └── utils/           # 유틸리티 함수
├── supabase/            # Supabase 관련 파일
│   └── migrations/      # 데이터베이스 마이그레이션
└── types/               # TypeScript 타입 정의
```

## 팀 정보

- **U12 (6학년)**: 진건초, FC진건
- **U11 (5학년)**: FC진건_블루, FC진건_레드

## 대회 일정

- **1차 리그**: 2026년 2월 6일 ~ 8일
- **2차 리그**: 2026년 2월 10일 ~ 12일

## 라이선스

MIT
