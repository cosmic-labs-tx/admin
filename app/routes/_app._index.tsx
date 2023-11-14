import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { redirect } from "remix-typedjson";
import { requireUserId } from "~/server/session.server";

export const meta: MetaFunction = () => [{ title: "Dashboard • Cosmic Labs" }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return redirect("/leads");
}
