import type { Prisma } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { normalizeEnum } from "~/utils";

export function UsersTable({ users }: { users: Array<Prisma.UserGetPayload<{ include: { client: true } }>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Client</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          return (
            <TableRow key={user.id}>
              <TableCell>
                {user.firstName}
                {user.lastName ? ` ${user.lastName}` : ""}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className={cn(user.role === "CLIENT_ADMIN" && "text-accent-foreground")}>{normalizeEnum(user.role)}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <Link to={`/clients/${user.clientId}`}>{user.client?.name}</Link>
                </Button>
              </TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <Link to={`/users/${user.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
