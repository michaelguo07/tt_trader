'use client';

export function ContactSeller({ sellerEmail, listingTitle }: { sellerEmail: string | null; listingTitle: string }) {
  if (!sellerEmail) return null;
  const subject = encodeURIComponent(`Re: ${listingTitle} on TT Trader`);
  const mailto = `mailto:${sellerEmail}?subject=${subject}`;
  return (
    <a
      href={mailto}
      className="inline-block mt-2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 font-medium text-sm"
    >
      Contact seller
    </a>
  );
}
