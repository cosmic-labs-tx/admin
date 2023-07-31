import { Outlet } from "@remix-run/react";

export default function LeadsPage() {
  return (
    <div className="flex h-full min-h-screen w-full flex-col">
      <main className="flex h-full w-full bg-white">
        <div className="w-full flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
