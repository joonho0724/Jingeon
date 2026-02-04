/**
 * 카카오맵 API 키 테스트 및 다양한 검색 방법 시도
 */

require('dotenv').config({ path: '.env.local' });

// REST API 키 우선 사용, 없으면 JavaScript 키 사용
const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

if (!KAKAO_API_KEY) {
  console.error('❌ 카카오맵 API 키가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 다음 중 하나를 추가해주세요:');
  console.error('   - KAKAO_REST_API_KEY=your_rest_api_key (권장)');
  console.error('   - 또는 NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_javascript_key');
  process.exit(1);
}

const isRestApiKey = !!process.env.KAKAO_REST_API_KEY;
console.log(`🔑 사용 중인 키 타입: ${isRestApiKey ? 'REST API 키 ✅' : 'JavaScript 키 (제한적)'}`);

console.log('🔑 API 키 확인:');
console.log(`   키 앞 10자리: ${KAKAO_API_KEY.substring(0, 10)}...`);
console.log(`   키 길이: ${KAKAO_API_KEY.length} (정상: 32자)\n`);

// 테스트 쿼리들
const testQueries = [
  { type: '주소 검색', query: '제주특별자치도 서귀포시 서홍동 477-1' },
  { type: '키워드 검색', query: '걸매축구장' },
  { type: '키워드 검색', query: '서귀포 걸매' },
  { type: '키워드 검색', query: '서귀포축구공원' },
  { type: '키워드 검색', query: '공천포전지훈련센터' },
];

async function testAddressSearch(query) {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=5`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    const status = response.status;
    const data = await response.json();

    if (status === 401) {
      console.error('❌ 인증 실패: API 키가 유효하지 않습니다.');
      return null;
    }

    if (status === 403) {
      console.error('❌ 권한 없음: API 키에 해당 서비스 권한이 없습니다.');
      return null;
    }

    return { status, data };
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return null;
  }
}

async function testKeywordSearch(query) {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    const status = response.status;
    const data = await response.json();

    return { status, data };
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('📍 카카오맵 API 테스트 시작...\n');

  // 1. 간단한 키워드로 API 연결 테스트
  console.log('1️⃣  API 연결 테스트 (서귀포 검색)...');
  const testResult = await testKeywordSearch('서귀포');
  if (testResult) {
    if (testResult.status === 200) {
      console.log('✅ API 연결 성공!');
      if (testResult.data.documents && testResult.data.documents.length > 0) {
        console.log(`   검색 결과: ${testResult.data.documents.length}개`);
      }
    } else {
      console.log(`⚠️  HTTP 상태 코드: ${testResult.status}`);
      if (testResult.data && testResult.data.message) {
        console.log(`   메시지: ${testResult.data.message}`);
      }
    }
  }
  console.log('');

  // 2. 각 경기장 검색 시도
  console.log('2️⃣  경기장 검색 시도...\n');

  for (const testQuery of testQueries) {
    console.log(`검색: ${testQuery.type} - "${testQuery.query}"`);
    
    let result;
    if (testQuery.type === '주소 검색') {
      result = await testAddressSearch(testQuery.query);
    } else {
      result = await testKeywordSearch(testQuery.query);
    }

    if (result) {
      if (result.status === 200) {
        if (result.data.documents && result.data.documents.length > 0) {
          const first = result.data.documents[0];
          console.log(`   ✅ 검색 성공!`);
          console.log(`   장소명: ${first.place_name || first.address_name || 'N/A'}`);
          console.log(`   주소: ${first.address_name || first.road_address_name || 'N/A'}`);
          if (first.y && first.x) {
            console.log(`   위도: ${first.y}`);
            console.log(`   경도: ${first.x}`);
          }
        } else {
          console.log(`   ⚠️  검색 결과 없음`);
        }
      } else {
        console.log(`   ❌ HTTP ${result.status}`);
        if (result.data && result.data.message) {
          console.log(`   메시지: ${result.data.message}`);
        }
      }
    }
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('✨ 테스트 완료!');
  console.log('\n💡 참고:');
  console.log('   - API 키가 JavaScript 키인지 확인해주세요 (REST API 키 아님)');
  console.log('   - 카카오 개발자 콘솔에서 "로컬" 서비스가 활성화되어 있는지 확인해주세요');
  console.log('   - 플랫폼 설정에서 웹 도메인이 등록되어 있는지 확인해주세요');
}

main().catch(console.error);
