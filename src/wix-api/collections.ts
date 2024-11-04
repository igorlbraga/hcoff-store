import { WixClient } from "@/lib/wix-client.base";
import { collections } from "@wix/stores";
import { cache } from "react";

export const getCollectionBySlug = cache(
  async (wixClient: WixClient, slugs: string[]) => {
    const collections: (
      | (collections.Collection & collections.CollectionNonNullableFields)
      | undefined
    )[] = [];
    for (const slug of slugs) {
      const response = await wixClient.collections.getCollectionBySlug(slug);
      collections.push(response.collection);
    }
    return collections;
  },
);
