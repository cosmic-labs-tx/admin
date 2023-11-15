import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { IconExternalLink } from "@tabler/icons-react";
import { cn } from "~/lib/utils";

type PropsWeControl = "target" | "rel";
export function ExternalLink(props: Omit<RemixLinkProps, PropsWeControl>) {
  return (
    <Link {...props} target="_blank" to={props.to} rel="noreferrer" className={cn("flex items-center gap-1.5", props.className)}>
      <span>{props.children}</span>
      <IconExternalLink className="h-4 w-4 shadow-primary drop-shadow-md" />
    </Link>
  );
}
