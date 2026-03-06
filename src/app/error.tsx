'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <h1 className="text-xl font-bold text-stone-900 mb-4">Something went wrong</h1>
      <p className="text-stone-600 mb-6">
        A server error occurred. This often happens when the database tables haven&apos;t been created yet.
      </p>
      <div className="bg-stone-100 rounded-lg p-4 text-left text-sm text-stone-700 mb-6">
        <p className="font-medium mb-2">If you just deployed:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open your project folder in the terminal.</li>
          <li>Put your production database URL in <code className="bg-white px-1 rounded">.env</code> as <code className="bg-white px-1 rounded">DATABASE_URL</code>.</li>
          <li>Run: <code className="bg-white px-2 py-1 rounded block mt-2">npx prisma db push</code></li>
          <li>Refresh this page or click Retry below.</li>
        </ol>
      </div>
      <button
        onClick={reset}
        className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium"
      >
        Retry
      </button>
    </div>
  );
}
