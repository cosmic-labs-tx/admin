import { cssBundleHref } from "@remix-run/css-bundle";
import { type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Notifications } from "~/components/notifications";
import { ThemeProvider } from "~/components/theme-provider";
import { commitSession, getSession, getUser } from "~/server/session.server";
import { getGlobalToast } from "~/server/toast.server";
import stylesheet from "~/tailwind.css";

// prettier-ignore
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : [])
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);

  return typedjson(
    {
      user: await getUser(request),
      serverToast: getGlobalToast(session),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    },
  );
};

export default function App() {
  const { serverToast } = useTypedLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full min-h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <ThemeProvider>
        <body className="h-full">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <Notifications serverToast={serverToast} />
        </body>
      </ThemeProvider>
    </html>
  );
}
