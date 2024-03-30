import { SearchAndSelectEquipment } from './equipmen-search';

export default async function ReportsPage() {
  return (
    <main className="px-2 py-8 md:px-12 lg:px-24">
      Reports
      <SearchAndSelectEquipment />
    </main>
  );
}
