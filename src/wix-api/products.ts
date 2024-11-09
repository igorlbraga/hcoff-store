import { WIX_STORES_APP_ID } from "@/lib/constants";
import { getWixClient, WixClient } from "@/lib/wix-client.base";
import { products } from "@wix/stores";
import { cache } from "react";
export type ProductsSort = "last_updated" | "price_asc" | "price_desc";

interface QueryProductsFilter {
  q?: string;
  collectionIds?: string[] | string;
  priceRange?: { min?: number; max?: number };
  sort?: ProductsSort;
  skip?: number;
  limit?: number;
}

export async function queryProducts(
  wixClient: WixClient,
  {
    q,
    collectionIds,
    sort = "last_updated",
    skip,
    limit,
    priceRange,
  }: QueryProductsFilter,
) {
  let query = wixClient.products.queryProducts();

  const collectionIdsArray = collectionIds
    ? Array.isArray(collectionIds)
      ? collectionIds
      : [collectionIds]
    : [];

  if (collectionIdsArray.length > 0)
    query = query.hasSome("collectionIds", collectionIdsArray);

  if (priceRange?.min) query = query.ge("priceData.price", priceRange.min);

  if (priceRange?.max) query = query.le("priceData.price", priceRange.max);

  if (q) {
    const res = await query.find();

    const searchString = q.toLowerCase();

    const foundedProductsIds: string[] = [];

    res.items
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(searchString) ||
          item.description?.toLowerCase().includes(searchString),
      )
      .forEach((item) => foundedProductsIds.push(item._id!));

    query = query.hasSome("_id", foundedProductsIds);
  }

  switch (sort) {
    case "price_asc":
      query = query.ascending("price");
      break;
    case "price_desc":
      query = query.descending("price");
      break;
    case "last_updated":
      query = query.descending("lastUpdated");
      break;
  }

  if (limit) query = query.limit(limit);
  if (skip) query = query.skip(skip);

  return query.find();
}

export const getProductBySlug = cache(
  async (wixClient: WixClient, slug: string) => {
    const { items } = await wixClient.products
      .queryProducts()
      .eq("slug", slug)
      .limit(1)
      .find();

    const product = items[0];

    if (!product || !product.visible) {
      return null;
    }

    return product;
  },
);

export async function getRelatedProducts(
  wixClient: WixClient,
  productId: string,
) {
  const result = await wixClient.recommendations.getRecommendation(
    [
      {
        _id: "68ebce04-b96a-4c52-9329-08fc9d8c1253", // "From the same categories"
        appId: WIX_STORES_APP_ID,
      },
      {
        _id: "d5aac1e1-2e53-4d11-85f7-7172710b4783", // "Frequenly bought together"
        appId: WIX_STORES_APP_ID,
      },
    ],
    {
      items: [
        {
          appId: WIX_STORES_APP_ID,
          catalogItemId: productId,
        },
      ],
      minimumRecommendedItems: 3,
    },
  );

  const productIds = result.recommendation?.items
    .filter((item) => item.catalogItemId != null)
    .map((item) => item.catalogItemId);

  if (!productIds || !productIds.length) return [];

  const productsResult = await wixClient.products
    .queryProducts()
    .in("_id", productIds)
    .limit(4)
    .find();

  return productsResult.items;
}
