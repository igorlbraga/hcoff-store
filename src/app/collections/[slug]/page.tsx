import { PaginationBar } from "@/components/PaginationBar";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { delay } from "@/lib/utils";
import { getWixServerClient } from "@/lib/wix-client-server";
import { getCollectionBySlug } from "@/wix-api/collections";
import { queryProducts } from "@/wix-api/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params: { slug },
}: PageProps): Promise<Metadata> {
  const collection = (
    await getCollectionBySlug(getWixServerClient(), [slug])
  )?.[0];

  if (!collection) notFound();

  const banner = collection.media?.mainMedia?.image;

  return {
    title: collection.name,
    description: collection.description,
    openGraph: {
      images: banner?.url ? [{ url: banner.url }] : [],
    },
  };
}

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export default async function Page({
  params: { slug },
  searchParams: { page = "1" },
}: PageProps) {
  const collection = (
    await getCollectionBySlug(getWixServerClient(), [slug])
  )?.[0];

  if (!collection?._id) notFound();

  const pageNumber = parseInt(page);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Products</h2>
      <Suspense fallback={<LoadingSkeleton />} key={page}>
        <Products
          collectionId={collection._id}
          page={pageNumber <= 0 || Number.isNaN(pageNumber) ? 1 : pageNumber}
        />
      </Suspense>
    </div>
  );
}

interface ProductsProps {
  collectionId: string;
  page: number;
}

async function Products({ collectionId, page }: ProductsProps) {
  const itemsPerPage = 8;

  const collectionProducts = await queryProducts(getWixServerClient(), {
    collectionIds: collectionId,
    limit: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  });

  if (!collectionProducts.length) notFound();

  if (page > (collectionProducts.totalPages || 1)) notFound();

  return (
    <div className="space-y-10 pb-6">
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {collectionProducts.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar
        currentPage={page}
        totalPages={collectionProducts.totalPages || 1}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 sm:grid md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Product.Skeleton key={i} />
      ))}
    </div>
  );
}
