import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { ConfirmDestructiveModal } from "~/components/modals/confirm-destructive-modal";
import { PageHeader } from "~/components/page-header";
import { prisma } from "~/db.server";
import { cn } from "~/lib/utils";
import { deleteLead } from "~/models/lead.server";
import { requireUser } from "~/session.server";
import { normalizeEnum } from "~/utils";

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await requireUser(request);
  console.log("user", user);
  invariant(params.leadId, "leadId not found");

  const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
  if (!lead) {
    throw new Response("Not Found", { status: 404 });
  }

  if (lead.clientId !== user.id && user.role !== "ADMIN") {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ lead });
};

export const action = async ({ params, request }: ActionArgs) => {
  const user = await requireUser(request);
  invariant(params.leadId, "leadId not found");

  const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
  if (!lead) {
    throw new Response("Not Found", { status: 404 });
  }

  if (lead.clientId !== user.id && user.role !== "ADMIN") {
    throw new Response("Unauthorized", { status: 401 });
  }

  await deleteLead({ id: params.leadId });
  return redirect("/leads");
};

export default function NoteDetailsPage() {
  const { lead } = useLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);

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

      <div className="mb-6">
        <h3 className="text-base font-semibold leading-7">Form Information</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          If you don't see data from a field, it means the user didn't fill it
          in.
        </p>
      </div>
      <dl className="divide-y divide-muted">
        <DetailItem label="Name" value={lead.name} />
        <DetailItem label="Email" value={lead.email} />
        <DetailItem
          label="Created"
          value={new Date(lead.createdAt).toLocaleString()}
        />
        <DetailItem label="Message" value={lead.message} />
        {lead.phone && <DetailItem label="Phone" value={lead.phone} />}
        {lead.budget && <DetailItem label="Budget" value={lead.budget} />}
        {lead.company && <DetailItem label="Company" value={lead.company} />}
        {lead.attribution && (
          <DetailItem
            label="Attribution"
            value={normalizeEnum(lead.attribution)}
          />
        )}
        {lead.attributionNote && (
          <DetailItem label="Attribution Note" value={lead.attributionNote} />
        )}
      </dl>

      {lead.meta && (
        <>
          <div className="mb-6 mt-12">
            <h3 className="text-base font-semibold leading-7 text-secondary-foreground">
              Meta Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Automatically athered from the user's device at the time they
              submitted.
            </p>
          </div>
          <dl className="divide-y divide-muted">
            {Object.entries(lead.meta).map(([key, value]) => (
              <DetailItem key={key} label={key} value={String(value)} />
            ))}
          </dl>
        </>
      )}
    </>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="sm:gap4 px-4 py-4 sm:grid sm:grid-cols-3 sm:px-0">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm sm:col-span-2 sm:mt-0",
          value ? "" : "text-muted-foreground"
        )}
      >
        {value ?? "N/A"}
      </dd>
    </div>
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
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
