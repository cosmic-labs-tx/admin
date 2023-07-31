import { json, type ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export async function action({ request }: ActionArgs) {
  const data = Object.fromEntries(await request.formData());
  invariant(typeof data.email === "string", "email required");

  // @ts-expect-error validate form
  await prisma.lead.create({ data });
  return json({ message: "Lead created" }, { status: 201 });
}
