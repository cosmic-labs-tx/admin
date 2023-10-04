import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { PageHeader } from "~/components/page-header";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => [{ title: "Dashboard • Cosmic Labs" }];

export async function loader({ request }: LoaderFunctionArgs) {
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
