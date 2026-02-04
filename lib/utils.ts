import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 유튜브 URL에서 비디오 ID 추출
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// 유튜브 URL 유효성 검증
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

// 날짜 포맷팅
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// 시간 포맷팅
export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.substring(0, 5); // HH:MM 형식
}

// 경기 상태에 따른 색상 반환
export function getStatusColor(status: '예정' | '진행중' | '종료'): string {
  switch (status) {
    case '예정':
      return 'text-gray-600 bg-gray-100';
    case '진행중':
      return 'text-blue-600 bg-blue-100';
    case '종료':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// 경기장 코드에 따른 경기장 이름 반환 (fallback 용도)
// 실제 표시에서는 DB의 venues(code, name) 사용을 권장
export function getPitchName(pitchCode: string | null): string {
  if (!pitchCode) return '';

  const venueMap: Record<string, string> = {
    A: '걸매A-1구장',
    B: '걸매A-2구장',
    C: '걸매B-1구장',
    D: '효돈A-1구장',
    E: '효돈A-2구장',
    F: '효돈B-1구장',
    G: '공천포A-1구장',
    H: '공천포A-2구장',
  };

  return venueMap[pitchCode] || pitchCode;
}
