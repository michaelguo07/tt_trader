'use client';

import { useRouter } from 'next/navigation';

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={markRead}
      className="text-stone-500 hover:text-stone-700 text-sm"
    >
      Mark read
    </button>
  );
}
