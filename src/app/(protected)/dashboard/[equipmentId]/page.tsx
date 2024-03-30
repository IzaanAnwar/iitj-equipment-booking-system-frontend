import { getSession } from '@/actions/get-session';
import { BookEquipment } from './equipment-booking';

export default async function BookEquipmentPage({ params }: { params: { equipmentId: string } }) {
  const user = await getSession();
  return (
    <main className="h-full w-full">
      <BookEquipment equipmentId={params.equipmentId} user={user} />
    </main>
  );
}
