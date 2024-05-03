import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { AddInformation } from './add-info';
import { redirect } from 'next/navigation';
import { getInstructionsHistory } from '@/actions/utils';
import { InstructionsHistory } from './inst-history';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.userId) {
    redirect('/');
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <InstructionsHistory />
      <AddInformation />
    </main>
  );
}
