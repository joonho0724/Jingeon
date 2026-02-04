import VenueMap from '@/components/Venues/VenueMap';
import VenueList from '@/components/Venues/VenueList';

export const metadata = {
  title: '경기장 정보 | Festival',
  description: '대회 경기장 위치 및 정보',
};

export default function VenuesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">경기장 정보</h1>
      
      <div className="mb-6">
        <p className="text-gray-600">
          대회가 진행되는 경기장의 위치를 확인하실 수 있습니다.
        </p>
      </div>

      {/* 지도 (모바일/데스크톱 모두 위에 표시) */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[500px] md:h-[600px]">
            <VenueMap />
          </div>
        </div>
      </div>

      {/* 경기장 목록 (모바일/데스크톱 모두 지도 아래 표시) */}
      <div className="mb-8">
        <VenueList />
      </div>
    </div>
  );
}
