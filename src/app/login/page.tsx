import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-sm mx-auto py-12 animate-pulse">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
