import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CrawlResultsForm from '@/components/Crawl/CrawlResultsForm';
import Link from 'next/link';

export default function CrawlResultsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">경기 결과 자동 수집</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md bg-white"
          >
            관리자 홈으로
          </Link>
        </div>

        <CrawlResultsForm />
      </div>
    </ProtectedRoute>
  );
}
