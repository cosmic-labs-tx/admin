import type { LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { ChargesTable } from "~/components/clients/charges-table";
import { LeadsTable } from "~/components/leads/leads-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { UsersList } from "~/components/users/users-list";
import { notFound } from "~/responses";
import { prisma } from "~/server/db.server";
import { requireUser } from "~/server/session.server";
import { stripe } from "~/server/stripe.server";

export const meta: MetaFunction = () => [{ title: "Client • Cosmic Labs" }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUser(request, ["SUPER_ADMIN"]);
  invariant(params.clientId, "clientId not found");

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    include: { leads: true, users: true },
  });

  if (!client) throw notFound({ message: "Client not found" });

  const stripeCharges = client?.stripeCustomerId ? await stripe.charges.list({ customer: client.stripeCustomerId }) : null;

  return typedjson({ client, stripeCharges });
};

export default function ClientDetailsPage() {
  const { client, stripeCharges } = useTypedLoaderData<typeof loader>();

  return (
    <>
      <PageHeader title={client.name} description={client.id}>
        <Button variant="outline" asChild className="ml-auto">
          <Link to={`/clients/${client.id}/edit`}>Edit</Link>
        </Button>
      </PageHeader>

      <Separator className="my-12" />

      <div className="space-y-12">
        {client.users.length > 0 && <UsersList users={client.users} />}
        {stripeCharges && stripeCharges.data.length > 0 && <ChargesTable {...stripeCharges} />}
        {client.leads.length > 0 && <LeadsTable leads={client.leads} showTitle />}
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <p className="font-medium text-destructive">An unexpected error occurred: {error.message}</p>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Client not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
