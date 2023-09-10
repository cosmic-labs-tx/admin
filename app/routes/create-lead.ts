import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Response, json } from "@remix-run/node";
import { cors } from "remix-utils";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { prisma } from "~/db.server";

const schema = zfd.formData({
  name: zfd.text(),
  email: zfd.text(z.string().email()),
  clientId: zfd.text(z.string().cuid()),
  phone: zfd.text(z.string().optional()),
  attribution: zfd.text(
    z.enum([
      "ORGANIC",
      "WORD_OF_MOUTH",
      "FACEBOOK",
      "INSTAGRAM",
      "TWITTER",
      "LINKEDIN",
      "GOOGLE",
      "REFERRAL",
      "OTHER",
    ])
  ),
  message: zfd.text(z.string().optional()),
  budget: zfd.text(z.string().optional()),
  company: zfd.text(z.string().optional()),
  attributionNotes: zfd.text(z.string().optional()),
});

export function loader({ request }: LoaderArgs) {
  return cors(request, new Response());
}

export async function action({ request }: ActionArgs) {
  try {
    const data = schema.parse(request.formData);

    await prisma.lead.create({ data });
    return cors(request, json({ message: "Lead created" }, { status: 201 }));
  } catch (e) {
    if (e instanceof Error) {
      return cors(request, json({ message: e.message }, { status: 400 }));
    }
  }
}
