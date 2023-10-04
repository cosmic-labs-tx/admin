import type { Client } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ClientsTable({ clients, showTitle = false }: { clients: Array<Client>; showTitle?: boolean }) {
  return (
    <div>
      <h2 className={showTitle ? "mb-2" : "sr-only"}>Clients</h2>
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
                <TableCell>{new Date(client.createdAt).toLocaleString()}</TableCell>
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
    </div>
  );
}
