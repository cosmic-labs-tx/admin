import type { V2_MetaFunction } from "@remix-run/node";
import { PageHeader } from "~/components/page-header";

export const meta: V2_MetaFunction = () => [{ title: "Dashboard • FBL" }];

export default function Index() {
  return (
    <>
      <PageHeader title="Dashboard" />
    </>
  );
}
