import { getSession } from '@/actions/get-session';
import { UpdateProfile } from './update.profile';
import { Unauthorized } from '@/components/common/unauthorised';

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
    <main>
      <UpdateProfile user={user} />
    </main>
  );
}
