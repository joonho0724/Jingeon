# 카카오맵 플랫폼 설정 가이드

## 플랫폼 설정 종류

카카오 개발자 콘솔에는 여러 플랫폼 설정이 있습니다:

### 1. Web 플랫폼 (사이트 도메인)
- **위치**: 플랫폼 > Web 플랫폼
- **용도**: 일반적인 웹 애플리케이션용
- **설정**: 사이트 도메인에 `http://localhost:3000` 등록

### 2. JavaScript SDK 도메인
- **위치**: 플랫폼 > JavaScript SDK 도메인
- **용도**: 카카오 JavaScript SDK 사용 시 필요한 도메인 등록
- **설정**: `localhost:3000` 또는 `localhost:*` 등록

## 카카오맵 JavaScript API 사용 시 필요한 설정

카카오맵 JavaScript API를 사용하려면 **둘 다** 등록해야 할 수 있습니다:

1. **Web 플랫폼** (사이트 도메인)
   - `http://localhost:3000` 등록

2. **JavaScript SDK 도메인**
   - `localhost:3000` 또는 `localhost:*` 등록

## 확인 방법

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **플랫폼** 메뉴 클릭
4. 다음 항목들을 확인:

   **Web 플랫폼**:
   - 사이트 도메인에 `http://localhost:3000` 등록되어 있는지 확인

   **JavaScript SDK 도메인**:
   - `localhost:3000` 또는 `localhost:*` 등록되어 있는지 확인

## 권장 설정

개발 환경에서는:
- **Web 플랫폼**: `http://localhost:3000`
- **JavaScript SDK 도메인**: `localhost:3000` 또는 `localhost:*` (와일드카드)

둘 다 등록하는 것을 권장합니다.
