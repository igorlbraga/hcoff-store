import { Skeleton } from "@/components/ui/skeleton";
import { cn, delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client-server";
import { getCollectionBySlug } from "@/wix-api/collections";
import { collections } from "@wix/stores";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export default async function Layout({ children, params }: LayoutProps) {
  const collection = (
    await getCollectionBySlug(getWixServerClient(), [params.slug])
  )?.[0];
  if (!collection) notFound();
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero collection={collection} />
      </Suspense>
      {children}
    </>
  );
}

async function Hero({ collection }: { collection: collections.Collection }) {
  await delay(2000);

  const banner = collection.media?.mainMedia?.image;

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <div className="flex flex-col gap-10">
        {banner && (
          <div className="relative hidden h-96 sm:block">
            <Image
              src={banner.url || "/placeholder.png"}
              width={1280}
              height={400}
              className="h-full object-cover"
              alt={banner.altText || ""}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
            <h1 className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl font-bold text-white lg:text-5xl">
              {collection.name}
            </h1>
          </div>
        )}
        <h1
          className={cn(
            "mx-auto text-3xl font-bold md:text-4xl",
            banner && "sm:hidden",
          )}
        >
          {collection.name}
        </h1>
      </div>
    </main>
  );
}

function HeroSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <div className="flex flex-col gap-10">
        {/* Desktop banner skeleton */}
        <div className="relative hidden h-96 sm:block">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Mobile title skeleton */}
        <div className="mx-auto sm:hidden">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    </main>
  );
}
