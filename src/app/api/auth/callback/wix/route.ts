import { WIX_OAUTH_DATA_COOKIE, WIX_SESSION_COOKIE } from "@/lib/constants";
import { getWixClient } from "@/lib/wix.server";
import { OauthData } from "@wix/sdk";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");

  if (error) {
    return new Response(error_description, { status: 400 });
  }

  const oAuthData: OauthData = JSON.parse(
    cookies().get(WIX_OAUTH_DATA_COOKIE)?.value || "{}",
  );
  cookies().delete(WIX_OAUTH_DATA_COOKIE);

  if (!code || !state || !oAuthData) {
    return new Response("Invalid request", { status: 400 });
  }

  const wixClient = getWixClient();

  const memberTokens = await wixClient.auth.getMemberTokens(
    code,
    state,
    oAuthData,
  );

  cookies().set(WIX_SESSION_COOKIE, JSON.stringify(memberTokens), {
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(oAuthData.originalUri);
}
