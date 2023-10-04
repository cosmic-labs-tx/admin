import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ClientsTable } from "~/components/clients/clients-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { prisma } from "~/server/db.server";
import { requireUser } from "~/server/session.server";

export const meta: MetaFunction = () => [{ title: "Clients • FBL" }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["SUPER_ADMIN"]);
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  return typedjson({ clients });
}

export default function ClientIndexPage() {
  const { clients } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Clients">
        <Button asChild>
          <Link to="/clients/new">New Client</Link>
        </Button>
      </PageHeader>
      <ClientsTable clients={clients} />
    </>
  );
}
