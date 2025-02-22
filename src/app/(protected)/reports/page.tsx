import { getSession } from '@/actions/get-session';
import { SearchAndSelectEquipment, SearchAndSelectStudent } from './category-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Unauthorized } from '@/components/common/unauthorised';
import { redirect } from 'next/navigation';
import { FinanceReportList } from './financial-reports';

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) {
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
    <main className="space-y-4 px-2 py-12 md:px-6 lg:px-12">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList>
          <TabsTrigger value="bookings">Bookings Report</TabsTrigger>
          <TabsTrigger value="finances">Financial Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          {user.role === 'admin' ? <SearchAndSelectEquipment user={user} /> : <SearchAndSelectStudent user={user} />}
        </TabsContent>
        <TabsContent value="finances">
          <FinanceReportList user={user} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
