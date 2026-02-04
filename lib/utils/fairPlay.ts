// 페어플레이 점수 계산 유틸리티 (대회규정 제 13조)

export type StaffType = '선수' | '지도자' | '임원';
export type PenaltyType = '경고' | '경고누적퇴장' | '직접퇴장' | '경고후직접퇴장' | '공정위팀경고' | '공정위경고' | '공정위출전정지';

/**
 * 벌점 자동 계산 (대회규정 제 13조)
 * @param staffType 선수/지도자/임원
 * @param penaltyType 벌점 유형
 * @returns 벌점 (점수)
 */
export function calculatePenaltyPoints(
  staffType: StaffType,
  penaltyType: PenaltyType
): number {
  // 선수 벌점
  if (staffType === '선수') {
    switch (penaltyType) {
      case '경고':
        return 1;
      case '경고누적퇴장':
        return 3;
      case '직접퇴장':
        return 3;
      case '경고후직접퇴장':
        return 4;
      case '공정위팀경고':
        return 6;
      case '공정위경고':
        return 1;
      case '공정위출전정지':
        return 2; // 1경기당 2점
      default:
        return 0;
    }
  }
  
  // 지도자 및 임원 벌점
  if (staffType === '지도자' || staffType === '임원') {
    switch (penaltyType) {
      case '경고':
        return 2;
      case '경고누적퇴장':
        return 4;
      case '직접퇴장':
        return 4;
      case '경고후직접퇴장':
        return 6;
      case '공정위팀경고':
        return 6;
      case '공정위경고':
        return 1;
      case '공정위출전정지':
        return 2; // 1경기당 2점
      default:
        return 0;
    }
  }
  
  return 0;
}

/**
 * 벌점 유형 설명
 */
export const penaltyTypeDescriptions: Record<PenaltyType, string> = {
  '경고': '경고',
  '경고누적퇴장': '경고 누적(2회) 퇴장',
  '직접퇴장': '직접 퇴장',
  '경고후직접퇴장': '경고 1회 후 직접퇴장',
  '공정위팀경고': '공정소위원회 결정 팀 경고',
  '공정위경고': '공정소위원회 결정 경고',
  '공정위출전정지': '공정소위원회 결정 출전정지',
};
