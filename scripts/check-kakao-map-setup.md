# 카카오맵 JavaScript 키 설정 확인

## 현재 문제
브라우저에서 카카오맵 스크립트 로드 실패

## 확인 사항

### 1. JavaScript 키 확인
1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **앱 키** 메뉴 클릭
4. **JavaScript 키** 확인
   - `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`와 일치하는지 확인
   - REST API 키가 아닌 **JavaScript 키**여야 합니다

### 2. 플랫폼 설정 확인
1. 카카오 개발자 콘솔에서 **플랫폼** 메뉴 클릭
2. **Web 플랫폼** 등록 확인
   - 사이트 도메인: `http://localhost:3000` 추가되어 있는지 확인
   - 또는 `http://localhost:*` 와일드카드로 등록

### 3. 제품 설정 확인
1. **제품 설정** 메뉴 클릭
2. **카카오맵** 서비스가 **활성화**되어 있는지 확인

### 4. 환경 변수 확인
`.env.local` 파일에 다음이 있는지 확인:
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_javascript_key_here
```

**중요**: 
- REST API 키가 아닌 **JavaScript 키**를 사용해야 합니다
- `NEXT_PUBLIC_` 접두사가 있어야 브라우저에서 접근 가능합니다

## 테스트 방법
1. 브라우저 콘솔(F12) 열기
2. `/venues` 페이지 접속
3. 콘솔에 `[VenueMap]`으로 시작하는 로그 확인
4. 에러 메시지 확인

## 일반적인 에러

### "Invalid app key"
- JavaScript 키가 잘못되었거나 REST API 키를 사용한 경우

### "App(map) disabled"
- 카카오맵 서비스가 비활성화된 경우

### "Platform not registered"
- 플랫폼 설정에서 도메인이 등록되지 않은 경우
