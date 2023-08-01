import { Outlet } from "@remix-run/react";
import { SideNav } from "~/components/side-nav";

export default function AppLayout() {
  return (
    <div className="flex h-full">
      <SideNav />
      <main className="h-full w-full p-10">
        <Outlet />
      </main>
    </div>
  );
}
