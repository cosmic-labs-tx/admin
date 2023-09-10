import type { Role } from "@prisma/client";
import { Form, Link, NavLink } from "@remix-run/react";
import type { ComponentPropsWithoutRef } from "react";
import { ThemeModeToggle } from "~/components/theme-mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useUser } from "~/utils";

const links: ReadonlyArray<{
  name: string;
  href: string;
  access: ReadonlyArray<Role>;
}> = [
  { name: "Leads", href: "/leads", access: ["ADMIN", "CLIENT"] },
  { name: "Clients", href: "/clients", access: ["ADMIN"] },
  { name: "Users", href: "/users", access: ["ADMIN"] },
] as const;

export function SideNav(props: ComponentPropsWithoutRef<"nav">) {
  const user = useUser();

  return (
    <nav
      className={cn(
        "flex h-full shrink-0 grow-0 basis-56 flex-col space-x-2 border-r border-border bg-background px-6 py-10",
        props.className,
      )}
    >
      <div className="pl-3">
        <Link to="/" className="inline-flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              src="https://github.com/paulhmorris.png"
              alt="@paulhmorris"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <ul className="mt-12 space-x-0 space-y-1">
        {links
          .filter((link) => user?.role && link.access.includes(user.role))
          .map((link) => {
            return (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary",
                      isActive && "bg-secondary",
                    )
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            );
          })}
      </ul>
      <div className="mt-auto flex gap-2">
        <Form method="post" action="/logout">
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </Form>
        <ThemeModeToggle />
      </div>
    </nav>
  );
}
