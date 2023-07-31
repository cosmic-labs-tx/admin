import type { V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  return (
    <main>
      <h1 className="text-center text-5xl font-extrabold">
        Friendly Bear Labs - Admin Center
      </h1>
    </main>
  );
}
