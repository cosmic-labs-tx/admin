import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { SideNav } from "~/components/side-nav";
import { getUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  return json({ user: await getUser(request) });
};

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
