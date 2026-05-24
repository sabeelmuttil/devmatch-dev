/** True on Vercel Production deployment (not Preview). */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}
