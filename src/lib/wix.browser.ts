import { Tokens } from "@wix/sdk";
import { WIX_SESSION_COOKIE } from "./constants";
import { generateWixClient } from "./wix";
import Cookies from "js-cookie";

export function getWixClient() {
  const tokens: Tokens = JSON.parse(Cookies.get(WIX_SESSION_COOKIE) || "{}");
  return generateWixClient(tokens);
}
