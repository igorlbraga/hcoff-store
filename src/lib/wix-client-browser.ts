import { Tokens } from "@wix/sdk";
import Cookies from "js-cookie";
import { WIX_SESSION_COOKIE } from "./constants";
import { getWixClient } from "./wix-client.base";

export const wixBrowserClient = () => {
  const tokens: Tokens = JSON.parse(Cookies.get(WIX_SESSION_COOKIE) || "{}");
  return getWixClient(tokens);
};
