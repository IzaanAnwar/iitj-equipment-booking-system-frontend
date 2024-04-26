import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { UserForm } from './user-form';
import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { redirect } from 'next/navigation';

export default async function AddEquipment() {
  const user = await getSession();

  if (!user?.userId) {
    redirect('/');
  }
  if (user.role === 'user') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full md:w-1/2">
          <Unauthorized />
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full items-center justify-center pt-12">
      <Card className="w-full space-y-4 p-4 md:w-[60%] lg:w-[40%]">
        <CardTitle>Add a user</CardTitle>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
