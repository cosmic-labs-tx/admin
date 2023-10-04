import type { Session, TypedResponse } from "@remix-run/node";
import { redirect, typedjson } from "remix-typedjson";
import type { Toast } from "~/components/ui/use-toast";
import { commitSession } from "~/server/session.server";

export function setGlobalToast(session: Session, toast: Toast) {
  session.flash("globalMessage", toast);
}

export function getGlobalToast(session: Session): Toast | null {
  return (session.get("globalMessage") as Toast) || null;
}

export async function redirectWithToast(
  session: Session,
  url: string,
  toast: Toast = {
    title: "Success",
    variant: "default",
    description: "Your action was successful.",
  },
  init: ResponseInit = {},
) {
  setGlobalToast(session, toast);
  return redirect(url, {
    ...init,
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function jsonWithToast<Data>(
  session: Session,
  data: Data,
  toast: Toast = {
    title: "Success",
    variant: "default",
    description: "Your action was successful.",
  },
  init: ResponseInit = {},
): Promise<TypedResponse<Data>> {
  setGlobalToast(session, toast);
  return typedjson(data, {
    ...init,
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
