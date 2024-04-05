import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { MyReportList } from './my-bookings-table';

export default async function MyBookingsPage() {
  const user = await getSession();
  if (!user || !user.userId) {
    return <Unauthorized />;
  }
  return (
    <main className="px-2 py-12 md:px-20 lg:px-20">
      <MyReportList id={user.userId} />
    </main>
  );
}
