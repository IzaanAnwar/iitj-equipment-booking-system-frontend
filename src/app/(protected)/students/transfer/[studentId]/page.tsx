import { getSession } from '@/actions/get-session';
import { TransferStudentCard } from './transfer-card';
import { Unauthorized } from '@/components/common/unauthorised';
import { redirect } from 'next/navigation';

export default async function TransferStudent({ params }: { params: { studentId: string } }) {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }
  if (user.role !== 'supervisor') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-[60%]">
          <Unauthorized />
        </div>
      </div>
    );
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <TransferStudentCard user={user} studentId={params.studentId} />
    </main>
  );
}
