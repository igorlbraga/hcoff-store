"use client";

import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";

interface SearchFieldProps {
  className?: string;
}

export default function SearchField({ className }: SearchFieldProps) {
  const router = useRouter();
  const params = useSearchParams();

  function onSubmit(formData: FormData) {
    const q = formData.get("q")?.toString()?.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  return (
    <form action={onSubmit} className={cn("grow", className)}>
      <div className="relative">
        <Input
          name="q"
          placeholder="Search"
          defaultValue={params.get("q") as string}
          className="pe-10"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground transition-colors hover:text-foreground"
        >
          <SearchIcon className="size-5" />
        </button>
      </div>
    </form>
  );
}
