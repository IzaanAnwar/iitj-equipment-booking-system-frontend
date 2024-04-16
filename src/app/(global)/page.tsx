import { LoginCard } from '@/components/login';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="h-[100vh] w-full space-y-8 bg-[#0568c1] text-base">
      <Header />
      <div className="flex    items-center justify-center px-2 md:px-16 lg:px-32">
        <LoginCard />
      </div>
    </main>
  );
}

async function Header() {
  return (
    <div className="flex w-full items-center justify-center gap-12  pt-12 text-white">
      <div className="hidden w-fit  md:block">
        <Image src={'/logo1.gif'} alt="crdsi logo" width={100} height={100} />
      </div>
      <div className="w-fit items-center justify-center gap-2 text-center text-xl font-semibold md:flex md:text-2xl lg:text-4xl">
        <h3 className="font-bold">CRDSI</h3>
        <p>Equipment Booking System</p>
      </div>
    </div>
  );
}
