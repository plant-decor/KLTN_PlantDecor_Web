"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import {
  LocationOnOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import type { ShopNurseryListItem } from "@/lib/api/shopPlantsService";

interface ContactPageClientProps {
  nurseries: ShopNurseryListItem[];
  hasNurseryFetchError: boolean;
}

export default function ContactPageClient({
  nurseries,
  hasNurseryFetchError,
}: ContactPageClientProps) {
  const t = useTranslations("contactPage");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  return (
    <Box className="bg-gray-50 pb-16">
      <Box className="bg-linear-to-r from-green-50 via-white to-green-100 py-4 md:py-8 border-b border-gray-100">
        <Container maxWidth="lg">
          <Stack spacing={2.5} className="max-w-3xl">
            <Typography variant="h3" className="font-bold! text-gray-900!">
              {t("hero.title")}
            </Typography>
            <Typography className="text-gray-600! text-lg!">
              {t("hero.description")}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" className="mt-10! md:mt-14!">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <Card className="border border-gray-100">
                <CardContent className="p-6!">
                  <Typography variant="h5" className="font-semibold! text-gray-900! mb-4">
                    {t("nurseries.title")}
                  </Typography>

                  {hasNurseryFetchError ? (
                    <Alert severity="warning">{t("nurseries.fetchError")}</Alert>
                  ) : null}

                  {!hasNurseryFetchError && nurseries.length === 0 ? (
                    <Alert severity="info">{t("nurseries.empty")}</Alert>
                  ) : null}

                  <Stack spacing={2}>
                    {nurseries.map((nursery) => (
                      <Box
                        key={nursery.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <Typography className="font-semibold! text-gray-900!">
                          {nursery.name}
                        </Typography>
                        <Stack direction="row" spacing={1} className="mt-2! items-start">
                          <LocationOnOutlined className="text-green-600! mt-0.5!" />
                          <Typography className="text-sm! text-gray-600!">
                            {nursery.address}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} className="mt-1! items-center">
                          <PhoneOutlined className="text-green-600!" />
                          <Typography className="text-sm! text-gray-600!">
                            {nursery.phone}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card className="w-full border border-dashed border-gray-300">
              <CardContent className="p-6! text-center">
                <Typography variant="h6" className="font-semibold! mb-2">
                  {t("map.title")}
                </Typography>
                <Typography className="text-gray-600!">
                  {t("map.placeholder")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={isSuccessOpen}
        autoHideDuration={4000}
        onClose={() => setIsSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setIsSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t("form.placeholderSuccess")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
