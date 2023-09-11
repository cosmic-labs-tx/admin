import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Response, json } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { cors } from "remix-utils";
import { validationError } from "remix-validated-form";
import { z } from "zod";

import { prisma } from "~/db.server";

const validator = withZod(
  z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Email is required" }),
    clientId: z.string().cuid({ message: "Client ID is required" }),
    message: z.string().or(z.literal("")).optional(),
    meta: z.record(z.any()).optional(),
    additionalFields: z.record(z.any()).optional(),
  }),
);

export function loader({ request }: LoaderArgs) {
  return cors(request, new Response());
}

export async function action({ request }: ActionArgs) {
  try {
    const data = Object.fromEntries(await request.formData());
    const additionalFields = JSON.parse(
      typeof data.additionalFields === "string" ? data.additionalFields : "[]",
    );
    console.log({ ...data, additionalFields });

    const result = await validator.validate({ ...data, additionalFields });

    if (result.error) return validationError(result.error);

    const lead = await prisma.lead.create({ data: result.data });
    return cors(
      request,
      json({ message: "Lead created", lead }, { status: 201 }),
    );
  } catch (e) {
    if (e instanceof Error) {
      return cors(request, json({ message: e.message }, { status: 400 }));
    }
  }
}
