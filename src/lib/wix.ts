import { env } from "@/env";
import {
  backInStockNotifications,
  checkout,
  currentCart,
  orders,
  recommendations,
} from "@wix/ecom";
import { files } from "@wix/media";
import { members } from "@wix/members";
import { redirects } from "@wix/redirects";
import { reviews } from "@wix/reviews";
import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { collections, products } from "@wix/stores";
import { WIX_SESSION_COOKIE } from "./constants";

import Cookies from "js-cookie";
import { cookies } from "next/headers";

export function getWixClient(mode: "browser" | "server") {
  let tokens: Tokens;

  try {
    if (mode === "server")
      tokens = JSON.parse(cookies().get(WIX_SESSION_COOKIE)?.value || "{}");
    else tokens = JSON.parse(Cookies.get(WIX_SESSION_COOKIE) || "{}");
  } catch (error) {
    tokens = {} as Tokens;
  }

  return createClient({
    modules: {
      products,
      collections,
      currentCart,
      checkout,
      redirects,
      orders,
      recommendations,
      backInStockNotifications,
      reviews,
      members,
      files,
    },
    auth: OAuthStrategy({
      clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID,
      tokens,
    }),
  });
}

export type WixClient = ReturnType<typeof getWixClient>;
