import { getSession } from '@/actions/get-session';
import { EquipmentList } from '@/components/dashboard/eqipment-list';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }
  return (
    <div className="px-2 py-8 md:px-16 lg:px-32">
      <h3 className="text-2xl font-bold">Equipments</h3>
      <section className="pt-8">
        <EquipmentList user={user} />
      </section>
    </div>
  );
}
