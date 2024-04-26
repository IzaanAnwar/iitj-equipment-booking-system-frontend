import { getSession } from '@/actions/get-session';
import { UpdateProfile } from './update.profile';
import { Unauthorized } from '@/components/common/unauthorised';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getSession();

  if (!user) {
    redirect('/');
  }
  return (
    <main>
      <UpdateProfile user={user} />
    </main>
  );
}
