import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { prisma } from "~/db.server";

export const meta: V2_MetaFunction = () => [{ title: "Leads • FBL" }];

export const loader = async () => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return json({ leads });
};

export default function LeadIndexPage() {
  const { leads } = useLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Leads">
        <Button asChild>
          <Link to="/leads/new">New Lead</Link>
        </Button>
      </PageHeader>
      <Table>
        {/* <TableCaption>Leads. Ordered by most recently created.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            return (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>
                  {new Date(lead.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(lead.createdAt).toLocaleString()}
                </TableCell>
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
    </>
  );
}
