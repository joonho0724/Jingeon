import { NextResponse } from 'next/server';

export async function GET() {
  // 서버 시간 반환 (ISO 8601 형식)
  const serverTime = new Date().toISOString();
  
  return NextResponse.json({
    time: serverTime,
    timestamp: Date.now(),
  });
}
