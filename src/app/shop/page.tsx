import { PaginationBar } from "@/components/PaginationBar";
import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { getWixServerClient } from "@/lib/wix-client-server";
import { ProductsSort, queryProducts } from "@/wix-api/products";
import { media } from "@wix/sdk";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  searchParams: {
    q?: string;
    page?: string;
    collection?: string[];
    price_min?: string;
    price_max?: string;
    sort?: string;
  };
}

export function generateMetadata({ searchParams: { q } }: PageProps): Metadata {
  return {
    title: q ? `Results for "${q}"` : "Products",
  };
}

export default async function Page({
  searchParams: {
    q,
    page = "1",
    collection: collectionIds,
    price_min,
    price_max,
    sort,
  },
}: PageProps) {
  const title = q ? `Results for "${q}"` : "Products";

  const pageNumber = parseInt(page);

  return (
    <div className="space-y-3">
      <h1 className="text-start text-2xl font-bold md:text-3xl">{title}</h1>
      <Suspense fallback={<LoadingSkeleton />} key={`${q}-${page}`}>
        <ProductResults
          q={q}
          page={pageNumber <= 0 || Number.isNaN(pageNumber) ? 1 : pageNumber}
          collectionIds={collectionIds}
          priceMin={price_min ? parseInt(price_min) : undefined}
          priceMax={price_max ? parseInt(price_max) : undefined}
          sort={sort as ProductsSort}
        />
      </Suspense>
    </div>
  );
}

interface ProductResultsProps {
  q?: string;
  page: number;
  collectionIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: ProductsSort;
}

async function ProductResults({
  q,
  page,
  collectionIds,
  priceMin,
  priceMax,
  sort,
}: ProductResultsProps) {
  const pageSize = 8;

  const products = await queryProducts(getWixServerClient(), {
    q,
    limit: pageSize,
    skip: (page - 1) * pageSize,
    collectionIds,
    priceRange: {
      min: priceMin,
      max: priceMax,
    },
    sort,
  });

  if (page > (products.totalPages || 1)) notFound();

  return (
    <div className="space-y-10 group-has-[[data-pending]]:animate-pulse">
      <p className="text-start text-xl">
        {products.totalCount}{" "}
        {products.totalCount === 1 ? "product" : "products"} found
      </p>
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {products.items.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      <PaginationBar currentPage={page} totalPages={products.totalPages || 1} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pt-4">
      <Skeleton className="h-6 w-52" />
      <div className="flex grid-cols-2 flex-col gap-5 sm:grid xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Product.Skeleton key={i} />
        ))}
      </div>
    </div>
  );
}
