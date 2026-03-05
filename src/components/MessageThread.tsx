'use client';

import { useState, useEffect, useRef } from 'react';

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string | null;
};

export function MessageThread({
  threadId,
  receiverId,
  initialMessages,
  currentUserId,
}: {
  threadId: string;
  receiverId: string;
  initialMessages: Message[];
  currentUserId?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFromMe = (m: Message) => m.senderId === currentUserId;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, receiverId, body: body.trim() }),
    });
    setSending(false);
    if (res.ok) {
      const m = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          body: m.body,
          createdAt: m.createdAt,
          senderId: m.senderId,
          senderName: null,
        },
      ]);
      setBody('');
    }
  }

  return (
    <div className="flex flex-col border border-stone-200 rounded-lg overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${isFromMe(m) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                isFromMe(m) ? 'bg-primary-500 text-white' : 'bg-stone-100 text-stone-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
              <p className={`text-xs mt-1 ${isFromMe(m) ? 'text-primary-100' : 'text-stone-500'}`}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-stone-200 p-2 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-sm"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
