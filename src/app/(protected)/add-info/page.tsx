import { getSession } from '@/actions/get-session';
import { Unauthorized } from '@/components/common/unauthorised';
import { AddInformation } from './add-info';

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) {
    return (
      <div className="flex h-[90vh] w-full items-center justify-center">
        <div className="w-1/2]">
          <Unauthorized />;
        </div>
      </div>
    );
  }
  return (
    <main className="px-2 py-12 md:px-10 lg:px-20">
      <AddInformation />
    </main>
  );
}
