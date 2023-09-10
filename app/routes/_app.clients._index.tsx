import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { prisma } from "~/db.server";
import { requireAdmin } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Clients • FBL" }];

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ clients });
}

export default function ClientIndexPage() {
  const { clients } = useLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Clients">
        <Button asChild>
          <Link to="/clients/new">New Client</Link>
        </Button>
      </PageHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            return (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>
                  {new Date(client.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button asChild variant="link">
                    <Link to={`/clients/${client.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
