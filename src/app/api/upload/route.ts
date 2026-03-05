import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid type. Use JPEG, PNG or WebP' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 });
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || '.jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, name);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));
  const url = `/uploads/${name}`;
  return NextResponse.json({ url });
}
