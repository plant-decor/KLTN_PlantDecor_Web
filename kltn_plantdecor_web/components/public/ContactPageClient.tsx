"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Box,
  ButtonBase,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocationOnOutlined, OpenInNew, PhoneOutlined } from "@mui/icons-material";
import type { ShopNurseryListItem } from "@/lib/api/shopPlantsService";
import { buildOsmEmbedUrl, buildOsmSearchUrl } from "@/lib/utils/osmEmbed";

export type ContactNurseryWithMap = ShopNurseryListItem & {
  mapLat?: number;
  mapLng?: number;
};

interface ContactPageClientProps {
  nurseries: ContactNurseryWithMap[];
  hasNurseryFetchError: boolean;
}

function hasMapCoords(
  n: ContactNurseryWithMap
): n is ContactNurseryWithMap & { mapLat: number; mapLng: number } {
  return (
    typeof n.mapLat === "number" &&
    Number.isFinite(n.mapLat) &&
    typeof n.mapLng === "number" &&
    Number.isFinite(n.mapLng)
  );
}

export default function ContactPageClient({
  nurseries,
  hasNurseryFetchError,
}: ContactPageClientProps) {
  const t = useTranslations("contactPage");
  const theme = useTheme();
  /** Chỉ khi 2 cột cạnh nhau (lg+); từ md tới dưới lg vẫn xếp dọc — không sync chiều cao */
  const isLayoutSideBySide = useMediaQuery(theme.breakpoints.up("lg"), { noSsr: true });
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | null>(null);
  const [mapColHeight, setMapColHeight] = useState<number | null>(null);
  const mapColRef = useRef<HTMLDivElement | null>(null);

  /** Không cần effect: luôn “snap” về bản hợp lệ (hoặc vườn đầu) khi danh sách thay đổi. */
  const resolvedNurseryId = useMemo((): number | null => {
    if (nurseries.length === 0) {
      return null;
    }
    if (
      selectedNurseryId != null &&
      nurseries.some((n) => n.id === selectedNurseryId)
    ) {
      return selectedNurseryId;
    }
    return nurseries[0].id;
  }, [nurseries, selectedNurseryId]);

  const selectedNursery = useMemo((): ContactNurseryWithMap | null => {
    if (resolvedNurseryId == null) {
      return null;
    }
    return nurseries.find((n) => n.id === resolvedNurseryId) ?? null;
  }, [nurseries, resolvedNurseryId]);

  useLayoutEffect(() => {
    if (!isLayoutSideBySide) {
      return undefined;
    }
    const el = mapColRef.current;
    if (!el) {
      return undefined;
    }
    const apply = () => {
      setMapColHeight(el.offsetHeight);
    };
    queueMicrotask(apply);
    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [isLayoutSideBySide, hasNurseryFetchError, nurseries.length, resolvedNurseryId]);

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

      <Container maxWidth="lg" className="mt-10! md:mt-14! w-full">
        <Grid container spacing={3} alignItems="flex-start">
          <Grid
            size={{ xs: 12, lg: 4 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              ...(isLayoutSideBySide &&
                mapColHeight != null && {
                  height: mapColHeight,
                  minHeight: mapColHeight,
                  maxHeight: mapColHeight,
                }),
            }}
          >
            <Card
              className="border border-gray-100 w-full h-full"
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflow: "hidden",
                flex: 1,
              }}
            >
              <CardContent
                className="p-6! flex! flex-1! flex-col! min-h-0! overflow-hidden!"
                sx={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column" }}
              >
                <Typography variant="h5" className="font-semibold! text-gray-900! mb-3 shrink-0!">
                  {t("nurseries.title")}
                </Typography>

                {hasNurseryFetchError ? (
                  <Alert className="shrink-0!" severity="warning">
                    {t("nurseries.fetchError")}
                  </Alert>
                ) : null}

                {!hasNurseryFetchError && nurseries.length === 0 ? (
                  <Alert className="shrink-0!" severity="info">
                    {t("nurseries.empty")}
                  </Alert>
                ) : null}

                {nurseries.length > 0 ? (
                  <Box
                    className="pr-0.5"
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                    }}
                  >
                    <Stack spacing={2}>
                      {nurseries.map((nursery) => {
                        const isSelected = resolvedNurseryId === nursery.id;
                        return (
                          <ButtonBase
                            key={nursery.id}
                            onClick={() => setSelectedNurseryId(nursery.id)}
                            aria-pressed={isSelected}
                            aria-label={t("map.selectNurseryAria", { name: nursery.name })}
                            className="rounded-xl! w-full! text-left! justify-start! items-stretch! p-0! normal-case! transition-colors! duration-200!"
                            sx={{ display: "block" }}
                          >
                            <Box
                              className={`rounded-xl border w-full p-4 transition-all ${
                                isSelected
                                  ? "border-green-600! ring-2 ring-green-200! bg-green-50/60!"
                                  : "border-gray-200! bg-white! hover:bg-gray-50/90!"
                              }`}
                            >
                              <Typography className="font-semibold! text-gray-900!">
                                {nursery.name}
                              </Typography>
                              <Stack direction="row" spacing={1} className="mt-2! items-start">
                                <LocationOnOutlined className="text-green-600! mt-0.5!" />
                                <Typography className="text-sm! text-gray-600! text-left">
                                  {nursery.address}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} className="mt-1! items-center">
                                <PhoneOutlined className="text-green-600!" />
                                <Typography className="text-sm! text-gray-600! text-left">
                                  {nursery.phone}
                                </Typography>
                              </Stack>
                            </Box>
                          </ButtonBase>
                        );
                      })}
                    </Stack>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{ display: "flex", minHeight: 0, flexDirection: "column" }}
          >
            <Box ref={mapColRef} sx={{ width: "100%" }}>
              <Card
                className="w-full border border-dashed border-gray-300"
                sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}
              >
                <CardContent
                  className="p-6! flex! flex-1! flex-col! min-h-0! overflow-hidden"
                  sx={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column" }}
                >
                <Typography variant="h6" className="font-semibold! mb-1">
                  {t("map.title")}
                </Typography>
                <Typography className="text-gray-600! text-sm! mb-4">
                  {t("map.description")}
                </Typography>

                {hasNurseryFetchError ? (
                  <Alert severity="info">{t("map.unavailableOnFetchError")}</Alert>
                ) : null}

                {!hasNurseryFetchError && nurseries.length === 0 ? (
                  <Alert severity="info">{t("map.emptyNurseries")}</Alert>
                ) : null}

                {!hasNurseryFetchError && nurseries.length > 0 && selectedNursery ? (
                  <Box
                    className="rounded-lg border border-gray-200 overflow-hidden"
                    key={selectedNursery.id}
                  >
                    <Typography
                      className="font-semibold! text-gray-900! px-3! pt-3! pb-2! bg-white"
                      variant="subtitle1"
                      component="h2"
                    >
                      {selectedNursery.name}
                    </Typography>
                    {hasMapCoords(selectedNursery) ? (
                      <Box
                        component="iframe"
                        className="w-full border-0 block bg-gray-100"
                        sx={{ minHeight: 360, height: 360, maxWidth: "100%" }}
                        src={buildOsmEmbedUrl({
                          lat: selectedNursery.mapLat,
                          lon: selectedNursery.mapLng,
                        })}
                        title={t("map.iframeTitle", { name: selectedNursery.name })}
                        loading="lazy"
                        allowFullScreen
                      />
                    ) : (
                      <Box className="px-3! pb-3!">
                        <Typography
                          className="text-sm! text-gray-600! mb-2"
                          color="text.secondary"
                        >
                          {t("map.fallbackNoCoords")}
                        </Typography>
                        <Link
                          href={buildOsmSearchUrl(selectedNursery.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex! items-center! gap-1! text-green-700! no-underline hover:underline! text-sm! font-medium"
                        >
                          {t("map.openInOsm")}
                          <OpenInNew className="text-base! shrink-0" aria-hidden />
                        </Link>
                      </Box>
                    )}

                    {hasMapCoords(selectedNursery) ? (
                      <Box className="px-3! py-2! bg-gray-50 border-t border-gray-200">
                        <Link
                          href={buildOsmSearchUrl(selectedNursery.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex! items-center! gap-1! text-sm! text-green-800! no-underline hover:underline!"
                        >
                          {t("map.openLargerInOsm")}
                          <OpenInNew className="text-base! shrink-0" aria-hidden />
                        </Link>
                      </Box>
                    ) : null}
                  </Box>
                ) : null}
                </CardContent>
              </Card>
            </Box>
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
