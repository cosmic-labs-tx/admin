import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import { ValidatedForm, setFormDefaults, validationError } from "remix-validated-form";
import invariant from "tiny-invariant";
import { z } from "zod";
import { ConfirmDestructiveModal } from "~/components/modals/confirm-destructive-modal";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import { notFound } from "~/responses";
import { prisma } from "~/server/db.server";
import { requireUser } from "~/server/session.server";
import { stripe } from "~/server/stripe.server";
import { toast } from "~/server/toast.server";

const validator = withZod(
  z.object({
    name: z.string().min(1, { message: "Name is required" }),
    stripeCustomerId: z.string().startsWith("cus_").optional(),
    _action: z.enum(["delete", "update"]),
  }),
);

export const meta: MetaFunction = () => [{ title: "Client Edit • Cosmic Labs" }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUser(request, ["SUPER_ADMIN"]);
  invariant(params.clientId, "clientId not found");

  const client = await prisma.client.findUnique({ where: { id: params.clientId } });

  if (!client) throw notFound({ message: "Client not found" });

  return typedjson({ client, ...setFormDefaults("clientForm", { ...client }) });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  await requireUser(request, ["SUPER_ADMIN"]);
  const result = await validator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error);
  }

  const { _action, ...rest } = result.data;
  if (_action === "delete") {
    await prisma.client.delete({ where: { id: params.clientId } });
    return redirect("/clients");
  }

  const { data } = await stripe.customers.list();
  if (!data.find((customer) => customer.id === rest.stripeCustomerId)) {
    return validationError({ fieldErrors: { stripeCustomerId: "Stripe customer not found" } }, result.data, { status: 400 });
  }

  const updatedClient = await prisma.client.update({
    where: { id: params.clientId },
    data: rest,
  });

  return toast.json(request, { client: updatedClient }, { variant: "default", title: "Client updated", description: "Great job." });
};

export default function ClientEditPage() {
  const { client } = useTypedLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader title={client.name} description={client.id}>
        <ConfirmDestructiveModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          description="This action cannot be undone. This will permanently delete the
                  client and remove the data from the server."
        />
      </PageHeader>
      <ValidatedForm id="clientForm" validator={validator} method="post" className="space-y-4 sm:max-w-md">
        <Input label="Name" id="name" name="name" required />
        <Input label="Stripe Customer ID" id="stripeCustomerId" name="stripeCustomerId" required />
        <ButtonGroup>
          <SubmitButton className="w-full" name="_action" value="update">
            Save Client
          </SubmitButton>
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </ButtonGroup>
      </ValidatedForm>
    </>
  );
}
