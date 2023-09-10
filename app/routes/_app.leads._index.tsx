import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LeadsTable } from "~/components/leads/LeadsTable";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Leads • FBL" }];

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return typedjson({ leads });
}

export default function LeadIndexPage() {
  const { leads } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Leads">
        <Button asChild>
          <Link to="/leads/new">New Lead</Link>
        </Button>
      </PageHeader>
      <LeadsTable leads={leads} />
    </>
  );
}
