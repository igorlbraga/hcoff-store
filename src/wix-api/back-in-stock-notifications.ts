import {
  WIX_BACK_IN_STOCK_NOTIFICATIONS_ID,
  WIX_STORES_APP_ID,
} from "@/lib/constants";
import { findVariant } from "@/lib/utils";
import { WixClient } from "@/lib/wix-client.base";
import { products } from "@wix/stores";

export interface BackInStockNotificationsProps {
  email: string;
  itemUrl: string;
  product: products.Product;
  selectedOptions: Record<string, string>;
}

export async function createBackInStockNotificationsRequest(
  wixClient: WixClient,
  { email, itemUrl, product, selectedOptions }: BackInStockNotificationsProps,
) {
  const selectedVariant = findVariant(product, selectedOptions);

  await wixClient.backInStockNotifications.createBackInStockNotificationRequest(
    {
      email,
      itemUrl,
      catalogReference: {
        appId: WIX_BACK_IN_STOCK_NOTIFICATIONS_ID,
        catalogItemId: product._id,
        options: selectedVariant
          ? { variantId: selectedVariant._id }
          : { options: selectedOptions },
      },
    },
    {
      name: product.name || undefined,
      price: product.priceData?.discountedPrice?.toFixed(2),
      image: product.media?.mainMedia?.image?.url,
    },
  );
}
