# 카카오맵 스크립트 로드 실패 디버깅

## 현재 상황
- API 키는 인식됨 (`b69cb6c578...`)
- 스크립트 로드 시도 중
- 스크립트 로드 실패 (Event type: 'error')

## 확인 방법

### 1. Network 탭에서 확인
1. 브라우저 개발자 도구 열기 (F12)
2. **Network** 탭 클릭
3. `/venues` 페이지 새로고침
4. 필터에 `kakao` 입력
5. `sdk.js` 파일 찾기
6. 클릭하여 상세 정보 확인:
   - **Status**: HTTP 상태 코드 확인
   - **Headers**: 요청/응답 헤더 확인
   - **Preview/Response**: 응답 내용 확인

### 2. 일반적인 HTTP 상태 코드

#### 401 Unauthorized
- **원인**: JavaScript 키가 잘못되었거나 REST API 키를 사용한 경우
- **해결**: 카카오 개발자 콘솔에서 **JavaScript 키** 확인

#### 403 Forbidden
- **원인**: 플랫폼 설정에서 도메인이 등록되지 않은 경우
- **해결**: 카카오 개발자 콘솔 > 플랫폼 > Web 플랫폼에 `http://localhost:3000` 추가

#### 404 Not Found
- **원인**: 스크립트 URL이 잘못된 경우
- **해결**: 코드 확인

#### CORS 에러
- **원인**: 도메인 등록 문제
- **해결**: 플랫폼 설정 확인

### 3. 카카오 개발자 콘솔 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **플랫폼** 메뉴 클릭
4. **Web 플랫폼** 확인:
   - `http://localhost:3000` 등록되어 있는지 확인
   - 또는 `http://localhost:*` 와일드카드로 등록

5. **제품 설정** 메뉴 클릭
6. **카카오맵** 서비스가 **활성화**되어 있는지 확인

### 4. 환경 변수 확인

`.env.local` 파일 확인:
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=b69cb6c578f469aeefe6477c94b7861e
```

**중요**: 
- `NEXT_PUBLIC_` 접두사가 있어야 브라우저에서 접근 가능
- **JavaScript 키**를 사용해야 함 (REST API 키 아님)

## 다음 단계

Network 탭에서 확인한 HTTP 상태 코드나 에러 메시지를 알려주시면 정확한 해결 방법을 제시하겠습니다.
