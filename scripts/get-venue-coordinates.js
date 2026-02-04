/**
 * 카카오맵 API를 사용하여 주소를 좌표로 변환하는 스크립트
 * 
 * 사용 방법:
 * 1. .env.local에 NEXT_PUBLIC_KAKAO_MAP_API_KEY 설정
 * 2. node scripts/get-venue-coordinates.js 실행
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

const venues = [
  { name: '걸매축구장', address: '제주특별자치도 서귀포시 서홍동 477-1', keyword: '걸매축구장 서귀포' },
  { name: '(효돈)서귀포축구공원', address: '제주특별자치도 서귀포시 효돈순환로 311-29', keyword: '서귀포축구공원 효돈' },
  { name: '(공천포) 공천포전지훈련센터 A구장', address: '제주특별자치도 서귀포시 남원읍 신례로 96', keyword: '공천포전지훈련센터' },
];

async function getCoordinatesByAddress(address) {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      return {
        address: result.address_name || address,
        lat: parseFloat(result.y), // 위도
        lng: parseFloat(result.x), // 경도
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ 오류 발생 (${address}):`, error.message);
    return null;
  }
}

async function getCoordinatesByKeyword(keyword) {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    });

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      return {
        address: result.address_name || result.road_address_name || keyword,
        lat: parseFloat(result.y), // 위도
        lng: parseFloat(result.x), // 경도
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ 오류 발생 (${keyword}):`, error.message);
    return null;
  }
}

async function getCoordinates(venue) {
  // 먼저 주소로 검색 시도
  let result = await getCoordinatesByAddress(venue.address);
  
  // 주소 검색 실패 시 키워드로 검색
  if (!result) {
    result = await getCoordinatesByKeyword(venue.keyword);
  }
  
  return result;
}

async function main() {
  console.log('📍 카카오맵 API를 사용하여 주소 좌표 검색 중...\n');

  for (const venue of venues) {
    console.log(`검색 중: ${venue.name}`);
    console.log(`  주소: ${venue.address}`);
    const result = await getCoordinates(venue);
    
    if (result) {
      console.log(`✅ 결과:`);
      console.log(`   주소: ${result.address}`);
      console.log(`   위도(lat): ${result.lat}`);
      console.log(`   경도(lng): ${result.lng}`);
      console.log(`   코드 형식:`);
      console.log(`   {`);
      console.log(`     name: '${venue.name}',`);
      console.log(`     address: '${venue.address}',`);
      console.log(`     lat: ${result.lat},`);
      console.log(`     lng: ${result.lng},`);
      console.log(`   },`);
    } else {
      console.log(`⚠️  주소를 찾을 수 없습니다: ${venue.address}`);
      console.log(`   키워드 검색도 실패: ${venue.keyword}`);
    }
    console.log('');
    
    // API 호출 제한을 고려하여 약간의 딜레이
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('✨ 완료!');
}

main().catch(console.error);
