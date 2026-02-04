'use client';

import { useEffect, useState } from 'react';

export default function CurrentDateTime() {
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    let serverTimeOffset = 0; // 서버 시간과 클라이언트 시간의 차이 (밀리초)
    let isSynced = false;

    // 서버 시간 동기화
    const syncServerTime = async () => {
      try {
        const clientTimeBefore = Date.now();
        const response = await fetch('/api/time', { cache: 'no-store' });
        const clientTimeAfter = Date.now();
        const networkDelay = (clientTimeAfter - clientTimeBefore) / 2; // 네트워크 지연 시간의 절반

        if (response.ok) {
          const data = await response.json();
          const serverTime = new Date(data.time).getTime();
          const estimatedServerTime = serverTime + networkDelay;
          const clientTime = clientTimeAfter;
          
          // 서버 시간과 클라이언트 시간의 차이 계산
          serverTimeOffset = estimatedServerTime - clientTime;
          isSynced = true;
        }
      } catch (error) {
        console.error('서버 시간 동기화 실패:', error);
        // 동기화 실패 시 클라이언트 시간 사용
        isSynced = false;
      }
    };

    const updateDateTime = () => {
      let now: Date;
      
      if (isSynced) {
        // 서버 시간 기준으로 계산
        const syncedTime = Date.now() + serverTimeOffset;
        now = new Date(syncedTime);
      } else {
        // 동기화 전이면 클라이언트 시간 사용
        now = new Date();
      }

      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const formatted = `${month}월 ${day}일 ${hours.toString().padStart(2, '0')}시 ${minutes.toString().padStart(2, '0')}분`;
      setDateTime(formatted);
    };

    // 초기 서버 시간 동기화
    syncServerTime().then(() => {
      updateDateTime();
    });

    // 1분마다 서버 시간 재동기화 및 표시 업데이트
    const syncInterval = setInterval(() => {
      syncServerTime().then(() => {
        updateDateTime();
      });
    }, 60000); // 1분마다 재동기화

    // 1초마다 표시 업데이트 (초 단위는 표시하지 않지만 정확한 시간 유지)
    const updateInterval = setInterval(updateDateTime, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return <span className="text-xs font-normal text-gray-500">({dateTime})</span>;
}
