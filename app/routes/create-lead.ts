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
    "cf-turnstile-response": z.string(),
  }),
);

export function loader({ request }: LoaderArgs) {
  return cors(request, new Response());
}

export async function action({ request }: ActionArgs) {
  try {
    const form = Object.fromEntries(await request.formData());

    // Required fields
    const result = await validator.validate({
      ...form,
      meta: JSON.parse((form.meta as string) ?? "{}"),
    });

    if (result.error) {
      return cors(request, validationError(result.error));
    }

    const {
      clientId,
      name,
      email,
      message,
      meta,
      "cf-turnstile-response": token,
    } = result.data;

    // Cloudflare Turnstile
    try {
      console.log(token);
      const turnstileRequest = getTurnstileRequest(request, token);
      const turnstile = await fetch(turnstileRequest);
      const outcome = await turnstile.json();
      if (!outcome.success) {
        console.error(outcome);
        return cors(
          request,
          json({ message: `Cloudflare Turnstile failed` }, { status: 400 }),
        );
      }
    } catch (e) {
      console.error(e);
      return cors(
        request,
        json({ message: `Cloudflare Turnstile failed` }, { status: 400 }),
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return cors(
        request,
        json({ message: `Client not found` }, { status: 404 }),
      );
    }

    // Additional fields
    const additionalFields = Object.keys(form).reduce<Record<string, any>>(
      (acc, key) => {
        if (!result.data.hasOwnProperty(key)) {
          acc[key] = form[key];
        }
        return acc;
      },
      {},
    );

    const lead = await prisma.lead.create({
      data: {
        meta,
        name,
        email,
        message,
        clientId,
        additionalFields,
      },
    });
    return cors(
      request,
      json({ message: "Lead created", lead }, { status: 201 }),
    );
  } catch (e) {
    console.log(e);
    if (e instanceof Error) {
      return cors(request, json({ message: e.message }, { status: 400 }));
    }
    return cors(request, json({ message: "Unknown error" }, { status: 500 }));
  }
}

function getTurnstileRequest(request: Request, token: string) {
  const { CF_SECRET_KEY } = process.env;
  if (!CF_SECRET_KEY) {
    throw new Error("CF_SECRET_KEY is required");
  }

  const ip = request.headers.get("CF-Connecting-IP");
  const form = new FormData();
  form.append("secret", CF_SECRET_KEY);
  form.append("response", token);
  if (ip) {
    form.append("remoteip", ip);
  }
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  return new Request(url, {
    method: "POST",
    body: form,
  });
}
