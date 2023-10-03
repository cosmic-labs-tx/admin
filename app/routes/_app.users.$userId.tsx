import { Role } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ValidatedForm, validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { z } from "zod";
import { ConfirmDestructiveModal } from "~/components/modals/confirm-destructive-modal";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { SubmitButton } from "~/components/ui/submit-button";
import { prisma } from "~/db.server";
import { notFound } from "~/responses";
import { getSession, requireUser } from "~/session.server";
import { jsonWithToast } from "~/toast.server";

const validator = withZod(
  z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    role: z.nativeEnum(Role),
    clientId: z.string().optional(),
    _action: z.enum(["delete", "update"]),
  }),
);

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUser(request, ["SUPER_ADMIN"]);
  invariant(params.userId, "userId not found");

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { client: true },
  });
  const clients = await prisma.client.findMany();
  if (!user) throw notFound({ message: "User not found" });

  return typedjson({ user, clients });
};

export const meta: MetaFunction = () => [{ title: "User • FBL" }];

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const session = await getSession(request);
  await requireUser(request, ["SUPER_ADMIN"]);
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);

  const { _action, ...rest } = result.data;

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });

  if (!user) throw notFound({ message: "User not found" });

  if (_action === "delete") {
    await prisma.user.delete({ where: { id: params.userId } });
    return redirect("/users");
  }

  const updatedUser = await prisma.user.update({
    where: { id: params.userId },
    data: rest,
  });

  return jsonWithToast(
    session,
    { user: updatedUser },
    { variant: "default", title: "User updated", description: "Great job." },
  );
};

export default function UserDetailsPage() {
  const { user, clients } = useTypedLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={`${user.firstName}${user.lastName ? " " + user.lastName : ""}`}
      >
        <ConfirmDestructiveModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          description="This action cannot be undone. This will permanently delete the
                  user and remove the data from the server."
        />
      </PageHeader>

      <ValidatedForm
        validator={validator}
        defaultValues={{
          firstName: user.firstName,
          email: user.email,
          lastName: user.lastName ?? "",
          clientId: user.clientId ?? "",
          role: user.role,
        }}
        method="post"
        className="max-w-md space-y-4"
      >
        <Input label="First name" id="firstName" name="firstName" required />
        <Input label="Last name" id="lastName" name="lastName" />
        <Input label="Email" id="email" name="email" />
        <Select
          name="role"
          label="Role"
          placeholder="Select a role"
          options={Object.entries(Role).map(([key, value]) => ({
            value: key,
            label: value,
          }))}
        />
        <Select
          name="clientId"
          label="Client"
          placeholder="Select a client"
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
        />
        <div className="flex items-center gap-2">
          <SubmitButton className="w-full" name="_action" value="update">
            Save User
          </SubmitButton>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </div>
      </ValidatedForm>
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
    return <div>User not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
