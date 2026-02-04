'use client';

import { useState } from 'react';
import type { DailyForecast } from '@/lib/weather';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WeeklyForecastCardProps {
  forecasts: DailyForecast[];
}

export default function WeeklyForecastCard({ forecasts }: WeeklyForecastCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day.toString().padStart(2, '0')}.`;
  };

  const getWeatherIcon = (icon: string | null) => {
    if (!icon) return null;
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">주간예보</h3>
          <span className="text-xs text-gray-500">최저 최고 기준</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {forecasts.map((forecast, index) => (
          <div
            key={forecast.date}
            className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0"
          >
            {/* 날짜 및 온도 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {forecast.dayName} {formatDate(forecast.date)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-blue-600 font-medium">{forecast.minTemp}°</span>
                <span className="text-sm text-red-600 font-medium">{forecast.maxTemp}°</span>
              </div>
            </div>

            {/* 오전/오후 날씨 */}
            <div className="flex items-center gap-3">
              {/* 오전 */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">오전</span>
                {forecast.morning.icon ? (
                  <img
                    src={getWeatherIcon(forecast.morning.icon)!}
                    alt={forecast.morning.description}
                    className="w-6 h-6"
                    style={{
                      filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.4)) drop-shadow(0 0 0.5px white)',
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                )}
                <span className="text-xs text-gray-700 font-medium">
                  {forecast.morning.pop}%
                </span>
              </div>

              {/* 오후 */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">오후</span>
                {forecast.afternoon.icon ? (
                  <img
                    src={getWeatherIcon(forecast.afternoon.icon)!}
                    alt={forecast.afternoon.description}
                    className="w-6 h-6"
                    style={{
                      filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.4)) drop-shadow(0 0 0.5px white)',
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                )}
                <span className="text-xs text-gray-700 font-medium">
                  {forecast.afternoon.pop}%
                </span>
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      )}
    </div>
  );
}
