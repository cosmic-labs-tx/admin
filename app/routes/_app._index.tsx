import { json, type LoaderArgs, type V2_MetaFunction } from "@remix-run/node";
import { PageHeader } from "~/components/page-header";
import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Dashboard • FBL" }];

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return json({});
}

export default function Index() {
  return (
    <>
      <PageHeader title="Dashboard" />
    </>
  );
}
