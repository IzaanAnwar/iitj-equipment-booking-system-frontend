import { LoginCard } from '@/components/login';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="h-[100vh] w-full space-y-8 bg-[#0568c1]">
      <Header />
      <div className="flex    items-center justify-center px-2 md:px-16 lg:px-32">
        <LoginCard />
      </div>
    </main>
  );
}

async function Header() {
  return (
    <div className="flex items-center justify-center gap-12 pt-12 text-white">
      <Image src={'/logo1.gif'} alt="crdsi logo" width={100} height={100} />
      <div className="flex items-center justify-center gap-2 text-4xl font-semibold">
        <h3 className="font-bold">CRDSI</h3>
        <p>Equipment Booking System</p>
      </div>
    </div>
  );
}
