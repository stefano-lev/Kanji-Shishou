import { Outlet } from 'react-router-dom';

import NavBar from '@components/home/NavBar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#090908] text-zinc-100">
      <NavBar />

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
