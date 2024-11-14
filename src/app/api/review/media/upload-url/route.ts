import { getWixAdminClient } from "@/lib/wix.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  const mimeType = req.nextUrl.searchParams.get("mimeType");

  if (!fileName || !mimeType)
    return new NextResponse("Missing required query parameters", {
      status: 400,
    });

  const { uploadUrl } = await getWixAdminClient().files.generateFileUploadUrl(
    mimeType,
    {
      fileName,
      filePath: "product-reviews-media",
      private: false,
    },
  );

  return Response.json({ uploadUrl });
}
