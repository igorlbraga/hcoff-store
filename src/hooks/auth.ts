import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";
import { generateOAuthData, getLoginUrl, getLogoutUrl } from "@/wix-api/auth";
import Cookies from "js-cookie";
import { useToast } from "./use-toast";
import { usePathname, useRouter } from "next/navigation";
import { getWixClient } from "@/lib/wix.browser";

export default function useAuth() {
  const pathname = usePathname();
  const router = useRouter();

  const { toast } = useToast();

  async function login() {
    try {
      const oAuthData = await generateOAuthData(getWixClient(), pathname);

      Cookies.set(WIX_OAUTH_DATA_COOKIE, JSON.stringify(oAuthData), {
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 10 * 1000),
      });

      const redirectUrl = await getLoginUrl(getWixClient(), oAuthData);

      router.push(redirectUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to log in. Please try again.",
      });
    }
  }

  async function logout() {
    try {
      const logoutUrl = await getLogoutUrl(getWixClient());

      Cookies.remove(WIX_SESSION_COOKIE);

      router.push(logoutUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to log out. Please try again.",
      });
    }
  }

  return { login, logout };
}
