import { Tokens } from "@wix/sdk";
import { generateWixClient } from "./wix";
import { WIX_SESSION_COOKIE } from "./constants";
import { cookies } from "next/headers";

export function getWixClient() {
  let tokens;

  try {
    tokens = JSON.parse(cookies().get(WIX_SESSION_COOKIE)?.value || "{}");
  } catch (error) {
    tokens = {} as Tokens;
  }

  return generateWixClient(tokens);
}
