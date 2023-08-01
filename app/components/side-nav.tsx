import { Link, NavLink } from "@remix-run/react";
import type { ComponentPropsWithoutRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useOptionalUser } from "~/utils";

const links = [
  { name: "Dashboard", href: "/" },
  { name: "Leads", href: "/leads" },
];

export function SideNav(props: ComponentPropsWithoutRef<"nav">) {
  const user = useOptionalUser();
  if (!user) return null;

  return (
    <nav
      className={cn(
        "flex shrink-0 grow-0 basis-72 space-x-2 border-r border-slate-300 px-6 pt-10 lg:flex-col",
        props.className
      )}
    >
      <div className="pl-3">
        <Link to="/" className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              src="https://github.com/paulhmorris.png"
              alt="@paulhmorris"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <ul className="mt-12 lg:space-x-0 lg:space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <NavLink
              to={link.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100",
                  isActive && "bg-gray-100"
                )
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
