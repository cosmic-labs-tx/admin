import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { prisma } from "~/db.server";

import { deleteNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.leadId, "leadId not found");

  const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
  if (!lead) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ lead });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.leadId, "leadId not found");

  await deleteNote({ id: params.leadId, userId });

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const { lead } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex gap-2">
        <Button asChild>
          <Link to={`/leads/${lead.id}/edit`}>Edit</Link>
        </Button>
        <Form method="post">
          <Button variant="destructive" type="submit">
            Delete
          </Button>
        </Form>
      </div>
      <h3 className="text-2xl font-bold">{lead.name}</h3>
      <p className="py-6">{lead.email}</p>
      <p className="py-6">{lead.phone}</p>
      <p className="py-6">{lead.budget}</p>
      <hr className="my-4" />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
