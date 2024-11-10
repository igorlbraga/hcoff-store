import { createClient, OAuthStrategy, Tokens } from "@wix/sdk";
import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";
import { WIX_SESSION_COOKIE } from "./lib/constants";
import { members } from "@wix/members";

export async function middleware(request: NextRequest) {
  const sessionCookies = request.cookies.get(WIX_SESSION_COOKIE);

  if (sessionCookies?.value) {
    const tokens: Tokens = JSON.parse(sessionCookies.value);
    const wixClient = createClient({
      modules: {
        members,
      },
      auth: OAuthStrategy({ clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID, tokens }),
    });
    if (wixClient.auth.loggedIn()) {
      try {
        await wixClient.members.getCurrentMember();
        return null;
      } catch {}
    }
  }
  const res = NextResponse.next();

  const wixClient = createClient({
    auth: OAuthStrategy({ clientId: env.NEXT_PUBLIC_WIX_CLIENT_ID }),
  });

  const visitorTokens = await wixClient.auth.generateVisitorTokens();

  res.cookies.set(WIX_SESSION_COOKIE, JSON.stringify(visitorTokens), {
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
