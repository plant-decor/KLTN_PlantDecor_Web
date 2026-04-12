"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChatBubbleOutline,
  HeadsetMicOutlined,
  LocalFloristOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";
import type { ShopNurseryListItem } from "@/lib/api/shopPlantsService";
import { OPEN_SUPPORT_CHAT_EVENT } from "@/lib/constants/chat";
import { Link } from "@/i18n/navigation";

type SubjectOption = "general" | "service" | "order";

type FormValues = {
  name: string;
  email: string;
  subject: SubjectOption;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

interface ContactPageClientProps {
  nurseries: ShopNurseryListItem[];
  hasNurseryFetchError: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPageClient({
  nurseries,
  hasNurseryFetchError,
}: ContactPageClientProps) {
  const t = useTranslations("contactPage");
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const subjectOptions = useMemo(
    () => [
      { value: "general" as const, label: t("form.subjectOptions.general") },
      { value: "service" as const, label: t("form.subjectOptions.service") },
      { value: "order" as const, label: t("form.subjectOptions.order") },
    ],
    [t]
  );

  const validate = (values: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = t("form.errors.required");
    }

    if (!values.email.trim()) {
      nextErrors.email = t("form.errors.required");
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = t("form.errors.invalidEmail");
    }

    if (!values.subject) {
      nextErrors.subject = t("form.errors.required");
    }

    if (!values.message.trim()) {
      nextErrors.message = t("form.errors.required");
    }

    return nextErrors;
  };

  const handleOpenSupportChat = () => {
    window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_CHAT_EVENT));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(formValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSuccessOpen(true);
    setFormValues({
      name: "",
      email: "",
      subject: "general",
      message: "",
    });
  };

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
