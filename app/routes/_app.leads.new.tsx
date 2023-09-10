import { Attribution } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { SubmitButton } from "~/components/ui/submit-button";
import { prisma } from "~/db.server";

import { requireAdmin } from "~/session.server";

const validator = withZod(
  z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
    phone: z.string(),
    company: z.string().min(1, { message: "Company is required" }),
    budget: z.string().min(1, { message: "Budget is required" }),
    clientId: z.string().min(1, { message: "Client is required" }),
    attribution: z.nativeEnum(Attribution),
    attributionNote: z.string(),
  }),
);

export const meta: V2_MetaFunction = () => [{ title: "New Lead • FBL" }];

export const action = async ({ request }: ActionArgs) => {
  await requireAdmin(request);

  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);

  const lead = await prisma.lead.create({ data: result.data });
  return redirect(`/leads/${lead.id}`);
};

export default function NewLeadPage() {
  return (
    <>
      <PageHeader title="New Lead" />
      <ValidatedForm
        validator={validator}
        className="max-w-lg space-y-4"
        method="post"
      >
        <Input label="Name" id="name" name="name" type="text" required />
        <Input label="Email" id="email" name="email" type="email" required />
        <Input label="Phone" id="phone" name="phone" type="text" />
        <Input
          label="Company"
          id="company"
          name="company"
          type="text"
          required
        />
        <Input label="Budget" id="budget" name="budget" type="text" required />
        <Select
          name="attribution"
          label="Attribution"
          placeholder="Select an option"
          options={Object.entries(Attribution).map(([key, value]) => ({
            value: key,
            label: value,
          }))}
        />

        <Input
          label="Attribution Note"
          id="attributionNote"
          name="attributionNote"
          type="text"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubmitButton>Create Lead</SubmitButton>
          <Button variant="outline" type="reset">
            Reset
          </Button>
        </div>
      </ValidatedForm>
    </>
  );
}
