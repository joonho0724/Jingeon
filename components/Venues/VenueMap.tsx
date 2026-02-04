'use client';

import { useEffect, useRef } from 'react';
import { VENUES } from '@/lib/venues';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function VenueMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // 카카오맵 API 키 확인
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    console.log('[VenueMap] API 키 확인:', apiKey ? `${apiKey.substring(0, 10)}...` : '없음');
    
    if (!apiKey) {
      console.error('[VenueMap] 카카오맵 API 키가 설정되지 않았습니다.');
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600">
            <div class="text-center p-4">
              <p class="font-medium mb-2">카카오맵 API 키가 설정되지 않았습니다.</p>
              <p class="text-sm">환경 변수 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요.</p>
            </div>
          </div>
        `;
      }
      return;
    }

    // 카카오맵 스크립트가 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('[VenueMap] 카카오맵 스크립트가 이미 로드되어 있음');
      initMap();
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existingScript) {
      console.log('[VenueMap] 카카오맵 스크립트가 이미 추가되어 있음, 로드 대기...');
      // 스크립트가 이미 있으면 로드 완료를 기다림
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          console.log('[VenueMap] 카카오맵 스크립트 로드 완료 (기존 스크립트)');
          initMap();
        }
      }, 100);
      
      // 10초 후에도 로드되지 않으면 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.kakao || !window.kakao.maps) {
          console.error('[VenueMap] 스크립트 로드 타임아웃');
          showError('카카오맵 스크립트 로드 시간이 초과되었습니다.');
        }
      }, 10000);
      
      return () => clearInterval(checkInterval);
    }

    // 카카오맵 스크립트 로드
    console.log('[VenueMap] 카카오맵 스크립트 로드 시작');
    const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    console.log('[VenueMap] 스크립트 URL:', scriptUrl.replace(apiKey, '***'));
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    // crossOrigin 속성 제거 - 카카오맵 SDK는 스크립트 태그로 로드되므로 불필요
    
    script.onload = () => {
      console.log('[VenueMap] 카카오맵 스크립트 로드 성공');
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('[VenueMap] 카카오맵 maps.load() 완료');
          initMap();
        });
      } else {
        console.error('[VenueMap] window.kakao.maps가 없습니다');
        showError('카카오맵 API를 초기화할 수 없습니다.');
      }
    };
    
    script.onerror = (error) => {
      console.error('[VenueMap] 카카오맵 스크립트 로드 실패:', error);
      console.error('[VenueMap] 스크립트 URL:', scriptUrl.replace(apiKey, '***'));
      console.error('[VenueMap] 가능한 원인:');
      console.error('  1. JavaScript 키가 잘못되었거나 REST API 키를 사용한 경우');
      console.error('  2. 플랫폼 설정에서 localhost:3000이 등록되지 않은 경우');
      console.error('  3. 카카오맵 서비스가 비활성화된 경우');
      console.error('  4. 네트워크 연결 문제');
      showError('카카오맵 API 연결을 확인해주세요. (콘솔에서 자세한 정보 확인)');
    };
    
    document.head.appendChild(script);

    return () => {
      // 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  const showError = (message: string) => {
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-600">
          <div class="text-center p-4">
            <p class="font-medium mb-2">지도를 불러올 수 없습니다.</p>
            <p class="text-sm">${message}</p>
            <p class="text-xs mt-2 text-gray-500">브라우저 콘솔을 확인해주세요.</p>
          </div>
        </div>
      `;
    }
  };

  const initMap = () => {
    console.log('[VenueMap] initMap() 시작');
    if (!mapContainerRef.current) {
      console.error('[VenueMap] mapContainerRef.current가 null입니다');
      return;
    }
    if (!window.kakao?.maps) {
      console.error('[VenueMap] window.kakao.maps가 없습니다');
      showError('카카오맵 API를 초기화할 수 없습니다.');
      return;
    }

    try {
      // 제주도 전체가 보이도록 중심 좌표 설정 (제주도 중심)
      const jejuCenter = new window.kakao.maps.LatLng(33.4, 126.5);

      // 모바일에서는 같은 level이라도 화면이 작아 "보이는 면적"이 줄어드므로
      // 초기 level을 한 단계 더 축소해서(숫자↑) 제주도 섬이 더 잘 보이게 함
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const initialLevel = isMobile ? 11 : 10;

      const options = {
        center: jejuCenter,
        level: initialLevel, // 지도 확대 레벨 (작을수록 확대)
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;
      console.log('[VenueMap] 지도 생성 완료 (제주도 전체 뷰)');

      // 모든 경기장에 마커 추가
      const bounds = new window.kakao.maps.LatLngBounds();

      VENUES.forEach((venue, index) => {
      const position = new window.kakao.maps.LatLng(venue.lat, venue.lng);
      bounds.extend(position);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map,
      });

      // 커스텀 마커 이미지 (선택사항)
      // const imageSrc = '/image/marker.png';
      // const imageSize = new window.kakao.maps.Size(24, 35);
      // const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
      // const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      // marker.setImage(markerImage);

      // 인포윈도우 생성 (길찾기 링크 포함)
      const encodedAddress = encodeURIComponent(venue.address);
      const navigationUrl = `https://map.kakao.com/link/search/${encodedAddress}`;
      
      // 경기장 이름 파싱 (괄호 부분 스타일링)
      const nameMatch = venue.name.match(/^\(([^)]+)\)(.+)$/);
      let venueNameHtml = venue.name;
      if (nameMatch) {
        const [, prefix, mainName] = nameMatch;
        venueNameHtml = `
          <span style="font-size: 11px; font-weight: normal; color: #3B82F6; background-color: #EFF6FF; padding: 2px 6px; border-radius: 3px; margin-right: 6px;">
            (${prefix})
          </span>
          <span style="font-weight: bold;">${mainName}</span>
        `;
      }
      
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 180px;">
            <div style="margin-bottom: 6px; font-size: 14px; color: #333; display: flex; align-items: center; flex-wrap: wrap;">${venueNameHtml}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${venue.address}</div>
            <a href="${navigationUrl}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-flex; align-items: center; padding: 6px 12px; background-color: #3182CE; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 500; transition: background-color 0.2s;"
               onmouseover="this.style.backgroundColor='#2C5AA0'"
               onmouseout="this.style.backgroundColor='#3182CE'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              길찾기
            </a>
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        markersRef.current.forEach((m) => {
          if (m.infowindow) {
            m.infowindow.close();
          }
        });
        infowindow.open(map, marker);
      });

        markersRef.current.push({ marker, infowindow });
      });

      // 제주도 전체가 보이도록 유지 (bounds는 사용하지 않고 초기 설정 유지)
      // 필요시 bounds에 여유를 주어 제주도 전체를 포함하도록 조정할 수 있음
      // map.setBounds(bounds); // 주석 처리 - 제주도 전체 뷰 유지
      console.log('[VenueMap] 마커 추가 완료:', VENUES.length, '개');
    } catch (error) {
      console.error('[VenueMap] 지도 초기화 중 오류:', error);
      showError('지도를 초기화하는 중 오류가 발생했습니다.');
    }
  };

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
