'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AgeGroupTabsProps {
  currentAgeGroup: 'U11' | 'U12';
}

export default function AgeGroupTabs({ currentAgeGroup }: AgeGroupTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (ageGroup: 'U11' | 'U12') => {
    const params = new URLSearchParams(searchParams?.toString());
    if (ageGroup === 'U11') {
      params.delete('ageGroup');
    } else {
      params.set('ageGroup', ageGroup);
    }
    router.push(`/standings?${params.toString()}`);
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => handleTabChange('U11')}
          className={`${
            currentAgeGroup === 'U11'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          U11
        </button>
        <button
          onClick={() => handleTabChange('U12')}
          className={`${
            currentAgeGroup === 'U12'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          U12
        </button>
      </nav>
    </div>
  );
}
