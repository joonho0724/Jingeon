export interface Venue {
  name: string;
  address: string;
  lat: number; // 위도
  lng: number; // 경도
}

export const VENUES: Venue[] = [
  {
    name: '(걸매)걸매축구장',
    address: '제주특별자치도 서귀포시 서홍동 477-1',
    lat: 33.2504166318282,
    lng: 126.554601482525,
  },
  {
    name: '(효돈)서귀포축구공원',
    address: '제주특별자치도 서귀포시 효돈순환로 311-29',
    lat: 33.2583645569269,
    lng: 126.61036906105,
  },
  {
    name: '(공천포)공천포전훈센터 A구장',
    address: '제주특별자치도 서귀포시 남원읍 신례로 96',
    lat: 33.27683196104,
    lng: 126.640923230323,
  },
];
