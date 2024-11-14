import { ApiKeyStrategy, createClient, Tokens } from "@wix/sdk";
import { generateWixClient } from "./wix";
import { WIX_SESSION_COOKIE } from "./constants";
import { cookies } from "next/headers";
import { cache } from "react";
import { files } from "@wix/media";
import { env } from "@/env";

export function getWixClient() {
  let tokens;

  try {
    tokens = JSON.parse(cookies().get(WIX_SESSION_COOKIE)?.value || "{}");
  } catch (error) {
    tokens = {} as Tokens;
  }

  return generateWixClient(tokens);
}

export const getWixAdminClient = cache(() => {
  const wixClient = createClient({
    modules: {
      files,
    },
    auth: ApiKeyStrategy({
      siteId: env.NEXT_PUBLIC_WIX_SITE_ID,
      apiKey: env.WIX_API_KEY,
    }),
  });

  return wixClient;
});
