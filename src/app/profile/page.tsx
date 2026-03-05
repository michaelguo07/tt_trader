import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      locationLabel: true,
      latitude: true,
      longitude: true,
      showApproximateOnly: true,
      isReseller: true,
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
