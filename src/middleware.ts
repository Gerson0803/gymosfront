import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth is in-memory only (client-side). Middleware does not restore sessions.
 * Protected routes are guarded in AppShell after hydration.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/checkin/:path*",
    "/pipeline/:path*",
    "/equipment/:path*",
    "/login",
  ],
};
