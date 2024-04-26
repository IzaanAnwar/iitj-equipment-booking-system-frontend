import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { AddInformation } from './add-info';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();
  console.log({ sessionUses: session });
  if (!session?.userId) {
    redirect('/');
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <AddInformation />
    </main>
  );
}
