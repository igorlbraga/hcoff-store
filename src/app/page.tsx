import banner from "@/assets/banner.jpg";
import Product from "@/components/Product";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWixClient } from "@/lib/wix.server";
import { getCollectionBySlug } from "@/wix-api/collections";
import { queryProducts } from "@/wix-api/products";
import { products } from "@wix/stores";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <div className="flex items-center bg-secondary md:h-96">
        <div className="space-y-7 p-10 text-center md:w-1/2">
          <h1 className="text-3xl font-bold md:text-4xl">
            Fill the void in your heart
          </h1>
          <p>
            Tough day? Credit card maxed out? Buy some expensive stuff and
            become happy again!
          </p>
          <Button asChild>
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
        <div className="relative hidden h-full w-1/2 md:block">
          <Image
            src={banner}
            width={1920}
            priority
            height={1280}
            alt="Hcoff Store banner"
            className="h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-transparent to-transparent" />
        </div>
      </div>
      <Suspense fallback={<CollectionSkeleton />}>
        <Content />
      </Suspense>
    </main>
  );
}

async function Content() {
  const collections = await getCollectionBySlug(getWixClient(), [
    "featured-products",
  ]);

  return collections.map((collection) => {
    if (!collection?._id) return null;
    return <Collection key={collection._id} collection={collection!} />;
  });
}

async function Collection({ collection }: { collection: products.Collection }) {
  const wixClient = getWixClient();

  const products = await queryProducts(wixClient, {
    collectionIds: collection._id!,
  });

  if (!products.items.length) return null;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">{collection.name}</h2>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {products.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Product.Skeleton key={i} />
        ))}
      </div>
    </div>
  );
}
