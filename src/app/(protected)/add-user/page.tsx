import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { UserForm } from './user-form';

export default async function AddEquipment() {
  return (
    <div className="flex w-full items-center justify-center pt-12">
      <Card className="w-full space-y-4 p-4 md:w-[60%] lg:w-[40%]">
        <CardTitle>Add a supervisor</CardTitle>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  );
}
