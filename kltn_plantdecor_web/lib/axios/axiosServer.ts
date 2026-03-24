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
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const cookieHeader = refreshToken ? `refreshToken=${refreshToken}` : undefined;

  // Create HTTPS agent that bypasses SSL certificate validation for localhost
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Allow self-signed certificates in development
  });

  return axios.create({
    baseURL,
    timeout: 100000, // 100 seconds timeout (matching client timeout)
    withCredentials: true,
    httpsAgent, // Use custom HTTPS agent
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
}
