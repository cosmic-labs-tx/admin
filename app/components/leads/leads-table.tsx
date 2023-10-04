import type { Lead } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function LeadsTable({ leads, showTitle = false }: { leads: Array<Lead>; showTitle?: boolean }) {
  return (
    <div>
      <h2 className={showTitle ? "mb-2" : "sr-only"}>Leads</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Created</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            return (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell className="max-w-[200px] truncate">{lead.message}</TableCell>
                <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button asChild variant="link">
                    <Link to={`/leads/${lead.id}`}>View</Link>
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
