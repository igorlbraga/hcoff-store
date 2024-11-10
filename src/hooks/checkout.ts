import {
  getCheckoutUrlForCurrentCart,
  getCheckoutUrlForProduct,
  GetCheckoutUrlForProductValues,
} from "@/wix-api/checkout";
import { useState } from "react";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { getWixClient } from "@/lib/wix.browser";

export function useCartCheckout() {
  const router = useRouter();
  const { toast } = useToast();

  const [pending, setPending] = useState(false);

  async function startCheckoutFlow() {
    setPending(true);

    try {
      const checkoutUrl = await getCheckoutUrlForCurrentCart(getWixClient());
      router.push(checkoutUrl);
    } catch (error) {
      setPending(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to load checkout. Please try again.",
      });
    }
  }

  return { startCheckoutFlow, pending };
}

export function useQuickBuy() {
  const { toast } = useToast();

  const [pending, setPending] = useState(false);

  async function startCheckoutFlow(values: GetCheckoutUrlForProductValues) {
    setPending(true);

    try {
      const checkoutUrl = await getCheckoutUrlForProduct(
        getWixClient(),
        values,
      );
      window.location.href = checkoutUrl;
    } catch (error) {
      setPending(false);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to load checkout. Please try again.",
      });
    }
  }

  return { startCheckoutFlow, pending };
}
