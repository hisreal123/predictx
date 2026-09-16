import Link from "next/link";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

/**
 * A Button that navigates.
 *
 * Base UI's Button assumes a native `<button>` unless told otherwise, so
 * rendering a Link into it without `nativeButton={false}` strips the element's
 * button semantics (and warns in development). Encapsulating it here keeps
 * every call site correct.
 */
export function ButtonLink({
  href,
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
  href: string;
}) {
  return (
    <Button
      {...props}
      nativeButton={false}
      render={<Link href={href}>{children}</Link>}
    />
  );
}
