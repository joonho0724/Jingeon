/**
 * 카카오맵 JavaScript 키 테스트
 * 브라우저에서 사용하는 키가 올바른지 확인
 */

require('dotenv').config({ path: '.env.local' });

const JS_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
const REST_KEY = process.env.KAKAO_REST_API_KEY;

console.log('🔑 환경 변수 확인:');
console.log('');

if (JS_KEY) {
  console.log('✅ NEXT_PUBLIC_KAKAO_MAP_API_KEY:');
  console.log(`   키 앞 10자리: ${JS_KEY.substring(0, 10)}...`);
  console.log(`   키 길이: ${JS_KEY.length} (정상: 32자)`);
  console.log(`   키 전체: ${JS_KEY}`);
} else {
  console.log('❌ NEXT_PUBLIC_KAKAO_MAP_API_KEY: 설정되지 않음');
}

console.log('');

if (REST_KEY) {
  console.log('✅ KAKAO_REST_API_KEY:');
  console.log(`   키 앞 10자리: ${REST_KEY.substring(0, 10)}...`);
  console.log(`   키 길이: ${REST_KEY.length} (정상: 32자)`);
} else {
  console.log('ℹ️  KAKAO_REST_API_KEY: 설정되지 않음 (서버 스크립트용)');
}

console.log('');
console.log('📋 확인 사항:');
console.log('');

if (JS_KEY) {
  if (JS_KEY.length === 32) {
    console.log('✅ JavaScript 키 길이: 정상');
  } else {
    console.log('⚠️  JavaScript 키 길이: 비정상 (32자가 아님)');
  }
  
  // REST API 키와 같은지 확인
  if (REST_KEY && JS_KEY === REST_KEY) {
    console.log('⚠️  경고: JavaScript 키와 REST API 키가 동일합니다!');
    console.log('   JavaScript 키와 REST API 키는 서로 다릅니다.');
    console.log('   카카오 개발자 콘솔에서 각각 확인해주세요.');
  } else if (REST_KEY) {
    console.log('✅ JavaScript 키와 REST API 키가 다릅니다 (정상)');
  }
} else {
  console.log('❌ JavaScript 키가 설정되지 않았습니다.');
  console.log('   브라우저에서 카카오맵을 사용할 수 없습니다.');
}

console.log('');
console.log('💡 다음 단계:');
console.log('   1. 카카오 개발자 콘솔 > 플랫폼 > Web 플랫폼');
console.log('      → http://localhost:3000 등록 확인');
console.log('   2. 카카오 개발자 콘솔 > 앱 키');
console.log('      → JavaScript 키가 NEXT_PUBLIC_KAKAO_MAP_API_KEY와 일치하는지 확인');
console.log('   3. 브라우저에서 /venues 페이지 접속');
console.log('   4. F12 > Network 탭에서 sdk.js 요청 확인');
