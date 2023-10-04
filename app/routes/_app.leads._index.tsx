import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LeadsTable } from "~/components/leads/leads-table";
import { PageHeader } from "~/components/page-header";

import { prisma } from "~/server/db.server";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => [{ title: "Leads • Cosmic Labs" }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return typedjson({ leads });
}

export default function LeadIndexPage() {
  const { leads } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Leads" />
      <LeadsTable leads={leads} />
    </>
  );
}
