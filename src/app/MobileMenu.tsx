"use client";

import SearchField from "@/components/SearchField";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserButton } from "@/components/UserButton";
import { twConfig } from "@/lib/utils";
import { members } from "@wix/members";
import { collections } from "@wix/stores";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MobileMenuProps {
  collections: collections.Collection[];
  loggedInMember: members.Member | null;
}

export function MobileMenu({ collections, loggedInMember }: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const lgBreakpoint = twConfig?.theme?.screens?.lg || "1024px";

    const mediaQuery = window.matchMedia(`(min-width: ${lgBreakpoint})`);

    const handleScreenSizeChange = (
      e: MediaQueryListEvent | MediaQueryList,
    ) => {
      if (e.matches) setIsOpen(false);
    };

    mediaQuery.addEventListener("change", handleScreenSizeChange);
    handleScreenSizeChange(mediaQuery);

    return () =>
      mediaQuery.removeEventListener("change", handleScreenSizeChange);
  }, []);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="inline-flex lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-full">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center space-y-10 py-10">
            <SearchField className="w-full" />
            <ul className="space-y-5 text-center text-lg">
              <li>
                <Link href="/shop" className="font-semibold hover:underline">
                  Shop
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection._id}>
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <UserButton loggedInMember={loggedInMember} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
