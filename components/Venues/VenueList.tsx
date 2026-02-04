'use client';

import { VENUES } from '@/lib/venues';
import { MapPin, Navigation } from 'lucide-react';

export default function VenueList() {

  const handleNavigation = (venue: typeof VENUES[0]) => {
    // 카카오맵 길찾기 URL 생성 (모바일 앱 또는 웹)
    const encodedAddress = encodeURIComponent(venue.address);
    // 모바일에서는 카카오맵 앱이 있으면 앱으로, 없으면 웹으로 연결
    const url = `https://map.kakao.com/link/search/${encodedAddress}`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {VENUES.map((venue, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-2 flex-1">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {(() => {
                    // 괄호 안의 텍스트를 추출하여 다른 스타일로 표시
                    const match = venue.name.match(/^\(([^)]+)\)(.+)$/);
                    if (match) {
                      const [, prefix, mainName] = match;
                      return (
                        <>
                          <span className="text-xs font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded mr-1.5">
                            ({prefix})
                          </span>
                          <span>{mainName}</span>
                        </>
                      );
                    }
                    return <span>{venue.name}</span>;
                  })()}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{venue.address}</p>
              </div>
            </div>
          </div>
          
          {/* 길찾기 버튼 - 모바일에서는 항상 표시, 데스크톱에서는 호버 시 표시 */}
          <button
            onClick={() => handleNavigation(venue)}
            className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium md:hidden"
          >
            <Navigation className="w-4 h-4" />
            <span>길찾기</span>
          </button>
          
          {/* 데스크톱에서는 작은 링크로 표시 */}
          <a
            href={`https://map.kakao.com/link/search/${encodeURIComponent(venue.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
          >
            <Navigation className="w-4 h-4" />
            <span>길찾기</span>
          </a>
        </div>
      ))}
    </div>
  );
}
