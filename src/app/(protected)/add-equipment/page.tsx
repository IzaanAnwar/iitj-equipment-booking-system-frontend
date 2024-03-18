import { EquipmentForm } from '@/components/add-equiment/eqipment-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default async function AddEquipment() {
  return (
    <div className="flex items-center justify-center pt-8 ">
      <Card className="space-y-4 p-4 shadow">
        <CardTitle>Add an Equipment</CardTitle>
        <CardContent>
          <EquipmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
