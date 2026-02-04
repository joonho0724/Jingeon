import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    }>
      <LoginFormWrapper />
    </Suspense>
  );
}
