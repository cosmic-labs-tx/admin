import { Outlet } from "@remix-run/react";
import { SideNav } from "~/components/side-nav";

export default function AppLayout() {
  return (
    <div className="h-full bg-muted">
      <main className="mx-auto flex h-full w-full max-w-screen-2xl bg-background">
        <SideNav />
        <div className="w-full grow overflow-y-scroll p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
