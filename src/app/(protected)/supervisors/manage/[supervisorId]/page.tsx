import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { StudentGrid } from './student-grid';

export default async function SupervisorsPage({ params }: { params: { supervisorId: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <div className="max-w-[60%]">
          <Unauthorized />
        </div>
      </div>
    );
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <StudentGrid supervisorId={params.supervisorId} user={user} />
    </main>
  );
}