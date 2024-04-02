import { getSession } from '@/actions/get-session';
import { SupervisorList } from './supervisor-list';
import { Unauthorized } from '@/components/common/unauthorised';

export default async function SupervisorsPage() {
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
      <SupervisorList user={user} />
    </main>
  );
}
