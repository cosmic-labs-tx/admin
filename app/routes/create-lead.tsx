import type { ActionArgs } from "@remix-run/node";
import { Response, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export function loader() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function action({ request }: ActionArgs) {
  const data = Object.fromEntries(await request.formData());
  invariant(typeof data.name === "string", "name required");
  invariant(typeof data.email === "string", "email required");
  invariant(typeof data.company === "string", "company required");
  invariant(typeof data.message === "string", "message required");
  invariant(typeof data.budget === "string", "budget required");

  // @ts-expect-error validate form
  await prisma.lead.create({ data });
  return json(
    { message: "Lead created" },
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
    }
  );
}
