import { NextResponse, type NextRequest } from "next/server";

/**
 * List of countries blocked from accessing the platform due to:
 * - International sanctions
 * - Regulatory restrictions
 * - Legal compliance requirements
 * 
 * Country codes follow ISO 3166-1 alpha-2 standard
 */
const BLOCKED_COUNTRY = [
  "BA", // Bosnia and Herzegovina
  "BU", // Bulgaria
  "BY", // Belarus - Sanctions
  "CD", // Democratic Republic of the Congo - Sanctions
  "CF", // Central African Republic - Sanctions
  "CU", // Cuba - Sanctions
  "ET", // Ethiopia
  "IR", // Iran - Sanctions
  "IQ", // Iraq - Sanctions
  "KP", // North Korea - Sanctions
  "LY", // Libya - Sanctions
  "SD", // Sudan - Sanctions
  "SY", // Syria - Sanctions
  "RU", // Russia - Sanctions
  "XC", // Reserved
  "MM", // Myanmar - Sanctions
  "VE", // Venezuela - Sanctions
  "YE", // Yemen - Sanctions
  "UK", // Ukraine - Temporary restriction
  "ZW", // Zimbabwe - Sanctions
];

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!monitoring-tunnel))"],
};

/**
 * Middleware function to handle country-based access control
 * Redirects users from blocked countries to an access-deny page
 * Default fallback country is Canada (CA) if geo location is not available
 */
export function middleware(req: NextRequest) {
  const country = req.geo?.country || "CA";

  req.nextUrl.pathname = BLOCKED_COUNTRY.includes(country) 
    ? "/access-deny"
    : "/";

  return NextResponse.rewrite(req.nextUrl);
}
