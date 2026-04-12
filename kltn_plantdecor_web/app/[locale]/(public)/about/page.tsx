import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import {
  AutoAwesomeMosaicOutlined,
  CloudUploadOutlined,
  Diversity3Outlined,
  InsightsOutlined,
  NaturePeopleOutlined,
} from "@mui/icons-material";
import { Button, Card, CardContent, Container, Grid, Stack, Typography } from "@mui/material";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage.metadata" });

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

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const aiRecommendationHref = getPathname({
    locale,
    href: "/ai-plant-recommendation",
  });
  const contactHref = getPathname({
    locale,
    href: "/contact",
  });

  const aiSteps = [
    {
      title: t("ai.steps.upload.title"),
      description: t("ai.steps.upload.description"),
      icon: <CloudUploadOutlined className="text-blue-600!" />,
    },
    {
      title: t("ai.steps.analyze.title"),
      description: t("ai.steps.analyze.description"),
      icon: <InsightsOutlined className="text-emerald-600!" />,
    },
    {
      title: t("ai.steps.transform.title"),
      description: t("ai.steps.transform.description"),
      icon: <AutoAwesomeMosaicOutlined className="text-purple-600!" />,
    },
  ];

  return (
    <div className="bg-gray-50 pb-16">
      <section className="bg-linear-to-r from-green-50 via-white to-green-100 border-b border-gray-100 py-14 md:py-20">
        <Container maxWidth="lg">
          <Grid container spacing={5} className="items-center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2.5}>
                <Typography variant="h3" className="font-bold! text-gray-900!">
                  {t("hero.title")}
                </Typography>
                <Typography className="text-gray-600! text-lg!">
                  {t("hero.subtitle")}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button href={aiRecommendationHref} variant="contained" sx={{backgroundColor: 'var(--primary)', ...hoverLiftStyle}}>
                    {t("hero.primaryCta")}
                  </Button>
                  <Button href={contactHref} variant="outlined" sx={{borderColor: 'var(--primary)', color: '#000', ...hoverLiftStyle}}>
                    {t("hero.secondaryCta")}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-md">
                <Image
                  src="/img/landingPageImage(5).jpg"
                  alt={t("hero.imageAlt")}
                  width={1280}
                  height={720}
                  className="h-80 w-full rounded-xl object-cover"
                />
              </div>
            </Grid>
          </Grid>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container maxWidth="lg">
          <Card className="border border-amber-100">
            <CardContent className="p-6! md:p-8!">
              <Stack spacing={2}>
                <Typography variant="h5" className="font-semibold! text-gray-900!">
                  {t("mission.title")}
                </Typography>
                <Typography className="text-gray-600!">{t("mission.problem")}</Typography>
                <Typography className="text-gray-600!">{t("mission.solution")}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="py-4 md:py-8">
        <Container maxWidth="lg">
          <Stack spacing={1} className="mb-5">
            <Typography variant="h5" className="font-semibold! text-gray-900!">
              {t("ai.title")}
            </Typography>
            <Typography className="text-gray-600!">{t("ai.subtitle")}</Typography>
          </Stack>
          <Grid container spacing={3}>
            {aiSteps.map((step) => (
              <Grid key={step.title} size={{ xs: 12, md: 4 }}>
                <Card className="h-full border border-gray-100">
                  <CardContent className="p-6!">
                    <Stack spacing={2}>
                      {step.icon}
                      <Typography variant="h6" className="font-semibold!">
                        {step.title}
                      </Typography>
                      <Typography className="text-gray-600!">{step.description}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container maxWidth="lg">
          <Stack spacing={1} className="mb-5">
            <Typography variant="h5" className="font-semibold! text-gray-900!">
              {t("human.title")}
            </Typography>
            <Typography className="text-gray-600!">{t("human.subtitle")}</Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="h-full border border-gray-100">
                <CardContent className="p-6!">
                  <Stack spacing={2}>
                    <NaturePeopleOutlined className="text-green-600!" />
                    <Typography variant="h6" className="font-semibold!">
                      {t("human.caretakers.title")}
                    </Typography>
                    <Typography className="text-gray-600!">
                      {t("human.caretakers.description")}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="h-full border border-gray-100">
                <CardContent className="p-6!">
                  <Stack spacing={2}>
                    <Diversity3Outlined className="text-blue-600!" />
                    <Typography variant="h6" className="font-semibold!">
                      {t("human.consultants.title")}
                    </Typography>
                    <Typography className="text-gray-600!">
                      {t("human.consultants.description")}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </section>
    </div>
  );
}
