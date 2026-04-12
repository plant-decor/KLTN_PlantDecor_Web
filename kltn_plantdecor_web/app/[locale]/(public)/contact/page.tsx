import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactPageClient from "@/components/public/ContactPageClient";
import {
  searchShopNurseries,
  type ShopNurseryListItem,
} from "@/lib/api/shopPlantsService";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

const getPayload = <T,>(
  response: { payload?: T; data?: T } | null | undefined
): T | null => {
  if (!response) return null;
  return response.payload ?? response.data ?? null;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage.metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ContactPage() {
  let nurseries: ShopNurseryListItem[] = [];
  let hasNurseryFetchError = false;

  try {
    const response = await searchShopNurseries(
      { pagination: { pageNumber: 1, pageSize: 10 } },
      true,
      false
    );
    const payload = getPayload(response);
    const items = payload?.items ?? [];
    nurseries = items.filter((item) => item.isActive);
  } catch (error) {
    console.error("Failed to load active nurseries for contact page:", error);
    hasNurseryFetchError = true;
  }

  return (
    <ContactPageClient
      nurseries={nurseries}
      hasNurseryFetchError={hasNurseryFetchError}
    />
  );
}

