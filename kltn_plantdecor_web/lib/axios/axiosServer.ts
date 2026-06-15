import axios, { type AxiosInstance } from "axios";
import https from "https";

export async function createAxiosServer(): Promise<AxiosInstance> {
  const baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    throw new Error("Missing API_URL or NEXT_PUBLIC_API_URL for server-side API calls.");
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const cookiePairs = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`);
  const cookieHeader = cookiePairs.length > 0 ? cookiePairs.join("; ") : undefined;

  const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  });

  return axios.create({
    baseURL,
    timeout: 30000,
    withCredentials: true,
    httpsAgent, // Use custom HTTPS agent
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
}
