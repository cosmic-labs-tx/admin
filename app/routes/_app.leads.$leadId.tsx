import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { ConfirmDestructiveModal } from "~/components/modals/confirm-destructive-modal";
import { PageHeader } from "~/components/page-header";
import { DetailItem, DetailsList } from "~/components/ui/details";
import { notFound, unauthorized } from "~/responses";
import { prisma } from "~/server/db.server";
import { deleteLead } from "~/server/lead.server";
import { requireUser } from "~/server/session.server";
import { toast } from "~/server/toast.server";

export const meta: MetaFunction = () => [{ title: "Lead • Cosmic Labs" }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  invariant(params.leadId, "leadId param not found");

  const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
  if (!lead) {
    throw notFound({ message: "Lead not found" });
  }

  if (lead.clientId !== user.id && user.role !== "SUPER_ADMIN") {
    throw unauthorized({ message: "Unauthorized" });
  }

  return typedjson({ lead });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await requireUser(request);
  invariant(params.leadId, "leadId param not found");

  const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
  if (!lead) {
    throw notFound({ message: "Lead not found" });
  }

  if (lead.clientId !== user.id && user.role !== "SUPER_ADMIN") {
    throw unauthorized({ message: "Unauthorized" });
  }

  await deleteLead({ id: params.leadId });
  return toast.redirect(request, "/leads", { variant: "default", title: "Lead deleted", description: "Hope you meant to do that." });
};

export default function LeadDetailsPage() {
  const { lead } = useTypedLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);

  const details = {
    name: lead.name,
    email: lead.email,
    created: new Date(lead.createdAt).toLocaleString(),
    message: lead.message,
  };

  return (
    <>
      <div className="flex justify-between">
        <PageHeader title="Web Lead">
          <ConfirmDestructiveModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            description="This action cannot be undone. This will permanently delete
            your lead and remove the data from our servers."
          />
        </PageHeader>
      </div>

      <div className="mb-4">
        <h2>Form Data</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">If you don't see data from a field, it means the user didn't fill it in.</p>
      </div>
      <DetailsList list={details}>
        {lead.additionalFields &&
          Object.entries(lead.additionalFields).map(([label, value]) => {
            if (!label || !value) return null;
            return <DetailItem key={label} label={label} value={value} />;
          })}
      </DetailsList>

      {lead.meta && (
        <>
          <div className="mb-6 mt-12">
            <h3 className="text-base font-semibold leading-7 text-secondary-foreground">Meta Information</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Automatically gathered from the user's device at the time they submitted.</p>
          </div>
          <DetailsList list={lead.meta as Record<string, unknown>} />
        </>
      )}
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
    return <div>Lead not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
