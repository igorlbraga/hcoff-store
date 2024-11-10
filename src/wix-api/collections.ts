import { WixClient } from "@/lib/wix";
import { collections } from "@wix/stores";
import { cache } from "react";

export const getCollectionBySlug = cache(
  async (wixClient: WixClient, slugs: string[]) => {
    const collections: (collections.Collection | undefined)[] = [];
    for (const slug of slugs) {
      const response = await wixClient.collections.getCollectionBySlug(slug);
      collections.push(response.collection);
    }
    return collections;
  },
);

export const getAllCollections = cache(
  async (wixClient: WixClient, except?: string[]) => {
    const res = await wixClient.collections.queryCollections().find();
    let collections = res.items;
    if (except)
      collections = collections.filter(
        (collection) => !except.includes(collection.slug || ""),
      );
    return collections;
  },
);
