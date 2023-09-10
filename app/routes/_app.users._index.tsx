import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { UsersTable } from "~/components/users/UsersTable";

import { prisma } from "~/db.server";
import { requireAdmin } from "~/session.server";

export const meta: V2_MetaFunction = () => [{ title: "Users • FBL" }];

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const users = await prisma.user.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return typedjson({ users });
}

export default function UserIndexPage() {
  const { users } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <PageHeader title="Users">
        <Button asChild>
          <Link to="/users/new">New User</Link>
        </Button>
      </PageHeader>
      <UsersTable users={users} />
    </>
  );
}
