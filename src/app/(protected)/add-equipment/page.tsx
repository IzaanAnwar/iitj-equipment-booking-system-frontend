import { getSession } from '@/actions/get-session';
import { EquipmentForm } from '@/components/add-equiment/equipment-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function AddEquipment() {
  const session = await getSession();
  console.log({ sessionUses: session });
  if (!session?.userId) {
    redirect('/');
  }

  return (
    <div className="flex w-full items-center justify-center pt-8">
      <Card className="w-full space-y-4 p-4 shadow md:w-[70%] lg:w-[50%]">
        <CardTitle>Add an Equipment</CardTitle>
        <CardContent className="w-full">
          <EquipmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
