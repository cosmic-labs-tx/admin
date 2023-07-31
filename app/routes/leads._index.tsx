import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { prisma } from "~/db.server";

export const loader = async () => {
  const leads = await prisma.lead.findMany();
  return json({ leads });
};

export default function LeadIndexPage() {
  const { leads } = useLoaderData<typeof loader>();
  return (
    <Table>
      <TableCaption>Leads. Ordered by most recently created.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => {
          return (
            <TableRow key={lead.id}>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{new Date(lead.updatedAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>...</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
