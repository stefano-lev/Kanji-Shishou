import { Outlet } from 'react-router-dom';

import NavBar from '@components/home/NavBar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#090908] text-zinc-100">
      <NavBar />

      <main className="px-3 pb-10 pt-20 sm:px-5 lg:px-8 lg:pt-24">
        <div className="mx-auto w-full max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
