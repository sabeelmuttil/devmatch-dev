import {
  isRemoteShareConfigured,
  shareStorageEnvStatus,
  testShareStorageWrite,
} from "@/lib/share-remote-store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** GET — verify Redis/Blob env (no secrets). Add ?test=1 to try a write. */
export async function GET(request: Request) {
  const test = new URL(request.url).searchParams.get("test") === "1";
  const env = shareStorageEnvStatus();

  const body: Record<string, unknown> = {
    configured: isRemoteShareConfigured(),
    env,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV,
  };

  if (test) {
    body.writeTest = await testShareStorageWrite();
  }

  return NextResponse.json(body);
}
