import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { notFound } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { z } from "zod";
import { LeadsTable } from "~/components/leads/LeadsTable";
import { ConfirmDestructiveModal } from "~/components/modals/confirm-destructive-modal";
import { PageHeader } from "~/components/page-header";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import { prisma } from "~/db.server";
import { requireAdmin } from "~/session.server";
import { normalizeEnum } from "~/utils";

const validator = withZod(
  z.object({
    name: z.string().min(1, { message: "Name is required" }),
    _action: z.enum(["delete", "update"]),
  }),
);

export const meta: V2_MetaFunction = () => [{ title: "Client • FBL" }];

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireAdmin(request);
  invariant(params.clientId, "clientId not found");

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    include: { leads: true, users: true },
  });

  if (!client) throw notFound({ message: "Client not found" });

  return typedjson({ client });
};

export const action = async ({ params, request }: ActionArgs) => {
  await requireAdmin(request);
  const result = await validator.validate(await request.formData());
  if (result.error) {
    return json(validationError(result.error), { status: 400 });
  }
  const { _action, name } = result.data;

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
  });

  if (!client) {
    throw notFound({ message: "Client not found" });
  }

  if (_action === "delete") {
    await prisma.client.delete({ where: { id: params.clientId } });
    return redirect("/clients");
  }

  const updatedClient = await prisma.client.update({
    where: { id: params.clientId },
    data: { name },
  });

  return json({ client: updatedClient });
};

export default function ClientDetailsPage() {
  const { client } = useTypedLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between">
        <PageHeader title={client.name}>
          <ConfirmDestructiveModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            description="This action cannot be undone. This will permanently delete the
                  client and remove the data from the server."
          />
        </PageHeader>
      </div>

      <ValidatedForm
        validator={validator}
        defaultValues={{ name: client.name }}
        method="post"
        className="max-w-md space-y-4"
      >
        <Input label="Name" id="name" name="name" required />
        <SubmitButton className="w-full" name="_action" value="update">
          Save
        </SubmitButton>
      </ValidatedForm>

      <div className="mt-12 space-y-12">
        <div>
          <h2>Users</h2>
          <ul className="divide-y divide-border max-w-md">
            {client.users.map((user) => (
              <li key={user.id}>
                <Link
                  to={`/users/${user.id}`}
                  className="relative flex items-center space-x-4 py-4"
                >
                  <div className="min-w-0 flex-auto">
                    <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                      <Link to={`/users/${user.id}`}>
                        <span>
                          {user.firstName}
                          {user.lastName ? ` ${user.lastName}` : ""}
                        </span>
                      </Link>
                    </h2>
                    <div className="mt-1 flex items-center gap-x-2.5 text-xs leading-5 text-muted-foreground">
                      <p className="truncate">{normalizeEnum(user.role)}</p>
                      <svg
                        viewBox="0 0 2 2"
                        className="h-0.5 w-0.5 flex-none fill-gray-300"
                      >
                        <circle cx={1} cy={1} r={1} />
                      </svg>
                      <p className="whitespace-nowrap">
                        Created {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <IconChevronRight
                    className="h-5 w-5 flex-none text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <h2 className="mb-4">Leads</h2>
        <LeadsTable leads={client.leads} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
      <p className="font-medium text-destructive">
        An unexpected error occurred: {error.message}
      </p>
    );
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Client not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
