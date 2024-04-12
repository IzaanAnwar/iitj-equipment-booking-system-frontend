import { getSession } from '@/actions/get-session';
import { BookingsPage } from '@/components/dashboard/bookings';
import { EquipmentList } from '@/components/dashboard/equipment-list';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }
  return (
    <div className="px-2 py-12 md:px-10 lg:px-20">
      <h3 className="text-2xl font-bold">Equipments</h3>
      <section className="pt-8">{user.role === 'admin' ? <EquipmentList user={user} /> : <BookingsPage />}</section>
    </div>
  );
}
