import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactPageClient, {
  type ContactNurseryWithMap,
} from "@/components/public/ContactPageClient";
import { searchAddressSuggestions } from "@/lib/utils/geocoding";
import { sleepMs } from "@/lib/utils/osmEmbed";
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

async function enrichNurseriesWithMapCoords(
  items: ShopNurseryListItem[]
): Promise<ContactNurseryWithMap[]> {
  const out: ContactNurseryWithMap[] = [];
  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      await sleepMs(1100);
    }
    const n = items[i];
    const row: ContactNurseryWithMap = { ...n };
    const address = n.address?.trim() ?? "";
    if (address.length >= 3) {
      const suggestions = await searchAddressSuggestions(address);
      const first = suggestions[0];
      if (first) {
        row.mapLat = first.latitude;
        row.mapLng = first.longitude;
      }
    }
    out.push(row);
  }
  return out;
}

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
  let nurseries: ContactNurseryWithMap[] = [];
  let hasNurseryFetchError = false;

  try {
    const response = await searchShopNurseries(
      { pagination: { pageNumber: 1, pageSize: 10 } },
      true,
      false
    );
    const payload = getPayload(response);
    const items = payload?.items ?? [];
    const active = items.filter((item) => item.isActive);
    nurseries = await enrichNurseriesWithMapCoords(active);
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

