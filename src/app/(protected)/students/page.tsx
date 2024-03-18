import { getSession } from '@/actions/get-session';
import { StudentsList } from '@/components/students/students-list';
import { redirect } from 'next/navigation';

export default async function Students() {
  const user = await getSession();
  if (!user || !user.userId) {
    redirect('/');
  }
  return (
    <div className="px-2 py-8 md:px-16 lg:px-32">
      <h3 className="text-2xl font-bold">Students</h3>
      <section className="pt-8">
        <StudentsList user={user} />
      </section>
    </div>
  );
}
