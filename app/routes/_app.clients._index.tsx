import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ClientsTable } from "~/components/clients/clients-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Clients • FBL" }];

export async function loader({ request }: LoaderArgs) {
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
