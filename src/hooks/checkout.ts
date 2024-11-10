import {
  getCheckoutUrlForCurrentCart,
  getCheckoutUrlForProduct,
  GetCheckoutUrlForProductValues,
} from "@/wix-api/checkout";
import { useState } from "react";
import { useToast } from "./use-toast";
import { usePathname, useRouter } from "next/navigation";
import { getWixClient } from "@/lib/wix.browser";
import { generateOAuthData, getLoginUrl } from "@/wix-api/auth";
import { getLoggedInMember } from "@/wix-api/members";

import Cookies from "js-cookie";
import { WIX_OAUTH_DATA_COOKIE } from "@/lib/constants";

export function useCartCheckout() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [pending, setPending] = useState(false);

  async function startCheckoutFlow() {
    setPending(true);

    const wixClient = getWixClient();
    const loggedInMember = await getLoggedInMember(wixClient);

    if (!loggedInMember) {
      const oAuthData = await generateOAuthData(wixClient, pathname);

      Cookies.set(WIX_OAUTH_DATA_COOKIE, JSON.stringify(oAuthData), {
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 10 * 1000),
      });

      const loginUrl = await getLoginUrl(wixClient, oAuthData);
      return router.push(loginUrl);
    }

    try {
      const checkoutUrl = await getCheckoutUrlForCurrentCart(wixClient);
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
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [pending, setPending] = useState(false);

  async function startCheckoutFlow(values: GetCheckoutUrlForProductValues) {
    setPending(true);

    const wixClient = getWixClient();
    const loggedInMember = await getLoggedInMember(wixClient);

    if (!loggedInMember) {
      const oAuthData = await generateOAuthData(wixClient, pathname);

      Cookies.set(WIX_OAUTH_DATA_COOKIE, JSON.stringify(oAuthData), {
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 10 * 1000),
      });

      const loginUrl = await getLoginUrl(wixClient, oAuthData);
      return router.push(loginUrl);
    }

    try {
      const checkoutUrl = await getCheckoutUrlForProduct(wixClient, values);
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
