"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookmarkIcon, LogOutIcon, SparklesIcon } from "lucide-react";
import { cn } from "cn";

import { ButtonLink } from "@/components/button-link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout, useMe } from "@/lib/api/hooks";
import { teamInitials } from "@/lib/format";

const NAV = [
  { href: "/", label: "Fixtures" },
  { href: "/saved", label: "Saved" },
  { href: "/premium", label: "Premium" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isPending } = useMe();
  const logout = useLogout({ onSuccess: () => router.push("/") });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-foreground text-background">
            <SparklesIcon className="size-3.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Predict<span className="text-muted-foreground">X</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors sm:px-2.5",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label="Account menu"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[11px] font-medium">
                        {teamInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/saved" />}>
                  <BookmarkIcon /> Saved predictions
                </DropdownMenuItem>
                {!user.subscribed && (
                  <DropdownMenuItem render={<Link href="/premium" />}>
                    <SparklesIcon /> Go Premium
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOutIcon /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <ButtonLink variant="ghost" size="sm" href="/login">
                Sign in
              </ButtonLink>
              <ButtonLink size="sm" href="/register" className="hidden sm:inline-flex">
                Create account
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
