import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { StudentsList } from '@/components/students/students-list';
import { redirect } from 'next/navigation';

export default async function Students() {
  const user = await getSession();
  if (!user || !user.userId) {
    redirect('/');
  }
  if (user.role === 'admin' || user.role === 'user') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full md:w-1/2">
          <Unauthorized />
        </div>
      </div>
    );
  }
  return (
    <div className="px-2 py-8 md:px-10 lg:px-20">
      <h3 className="text-2xl font-bold">Students</h3>
      <section className="pt-12">
        <StudentsList user={user} />
      </section>
    </div>
  );
}
