import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyCategoryView from "@/components/policies/PolicyCategoryView";
import { getCategoryBySlug } from "@/lib/constants/policyCategories";

interface PolicyCategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

export async function generateMetadata({
  params,
}: PolicyCategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const definition = getCategoryBySlug(category);

  if (!definition) {
    return { title: "Policy Not Found | PlantDecor" };
  }

  const title = `${definition.label} | PlantDecor Policies`;
  const description = `Read the latest ${definition.label.toLowerCase()} policies for PlantDecor.`;
  const canonicalPath =
    locale === "en" ? `/policies/${definition.slug}` : `/${locale}/policies/${definition.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
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

export default async function PolicyCategoryPage({ params }: PolicyCategoryPageProps) {
  const { category } = await params;
  const definition = getCategoryBySlug(category);

  if (!definition) {
    notFound();
  }

  return (
    <PolicyCategoryView
      categoryValue={definition.value}
      categoryLabel={definition.label}
    />
  );
}
