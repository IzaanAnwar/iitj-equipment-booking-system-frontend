import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { MyReportList } from './my-bookings-table';
import { redirect } from 'next/navigation';

export default async function MyBookingsPage() {
  const user = await getSession();

  if (!user) {
    redirect('/');
  }
  if (!user.userId) {
    return <Unauthorized />;
  }
  return (
    <main className="px-2 py-12 md:px-20 lg:px-20">
      <MyReportList id={user.userId} />
    </main>
  );
}
