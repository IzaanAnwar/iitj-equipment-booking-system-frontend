import { EquipmentForm } from '@/components/add-equiment/equipment-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default async function AddEquipment() {
  return (
    <div className="flex w-full items-center justify-center pt-8">
      <Card className="w-full space-y-4 p-4 shadow md:w-[60%] lg:w-[40%]">
        <CardTitle>Add an Equipment</CardTitle>
        <CardContent className="w-full">
          <EquipmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
