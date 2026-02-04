# 카카오맵 API 키 확인 방법

## 문제 상황
현재 사용 중인 키가 **JavaScript 키**인데, 서버 스크립트에서는 **REST API 키**가 필요합니다.

## 해결 방법

### 1. 카카오 개발자 콘솔에서 REST API 키 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 내 애플리케이션 선택
3. **앱 키** 메뉴 클릭
4. 다음 키들을 확인:
   - **JavaScript 키**: 웹 브라우저에서 지도 표시용 (현재 `.env.local`에 설정된 키)
   - **REST API 키**: 서버에서 API 호출용 (스크립트 실행에 필요)

### 2. REST API 키를 `.env.local`에 추가

```env
# 기존 (JavaScript 키 - 브라우저용)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=b69cb6c578f469aeefe6477c94b7861e

# 추가 (REST API 키 - 서버 스크립트용)
KAKAO_REST_API_KEY=your_rest_api_key_here
```

### 3. 스크립트 수정

스크립트가 `KAKAO_REST_API_KEY`를 사용하도록 수정합니다.

## 참고

- **JavaScript 키**: 브라우저에서만 사용 가능 (CORS 제한)
- **REST API 키**: 서버에서 API 호출 가능
- 두 키는 서로 다른 용도이므로 둘 다 필요할 수 있습니다.
