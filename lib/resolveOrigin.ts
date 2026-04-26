import { headers } from "next/headers";
import { stripTrailingSlash } from "./url";

export async function resolveOrigin(): Promise<string> {
  const baseUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL ?? "");

  if (baseUrl) {
    return baseUrl;
  }

  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";

  return host ? stripTrailingSlash(`${protocol}://${host}`) : "";
}
