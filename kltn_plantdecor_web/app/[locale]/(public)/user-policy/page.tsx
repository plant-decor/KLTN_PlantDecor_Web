import type { Metadata } from "next";
import Link from "next/link";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  GavelOutlined,
  ManageAccountsOutlined,
  PrivacyTipOutlined,
  ReportProblemOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";

interface UserPolicyPageProps {
  params: Promise<{ locale: string }>;
}

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

export async function generateMetadata({
  params,
}: UserPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "User Policy";
  const description =
    "Understand account responsibilities, acceptable use, prohibited actions, content rules, enforcement, and support for PlantDecor users.";

  const canonicalPath = locale === "en" ? "/user-policy" : `/${locale}/user-policy`;

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

const POLICY = {
  effectiveDate: "April 28, 2026",
  supportEmail: "hello@plantdecor.vn",
} as const;

export default async function UserPolicyPage() {
  return (
    <div className="bg-gray-50 pb-16">
      <section className="bg-linear-to-r from-green-50 via-white to-green-100 border-b border-gray-100 py-12 md:py-16">
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} className="items-center">
              <GavelOutlined className="text-green-700!" />
              <Typography variant="h4" className="font-bold! text-gray-900!">
                User Policy
              </Typography>
            </Stack>

            <Typography className="text-gray-600! text-lg!">
              This User Policy describes the rules for using PlantDecor services,
              including your account, acceptable use, and enforcement actions.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              className="items-start sm:items-center"
            >
              <Chip
                size="small"
                label={`Effective date: ${POLICY.effectiveDate}`}
                variant="outlined"
              />
              <Chip size="small" label="Applies to: all users" variant="outlined" />
            </Stack>
          </Stack>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Alert severity="info" icon={<PrivacyTipOutlined />}>
              This page is a practical guide for user behavior. For details on how we
              process personal data, please refer to our{" "}
              <Link
                href="/privacy"
                className="text-green-700 hover:text-green-800 underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </Alert>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <ManageAccountsOutlined className="text-emerald-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Accounts & security
                    </Typography>
                  </Stack>

                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      You are responsible for maintaining the confidentiality of your
                      credentials and any activity that occurs under your account.
                    </li>
                    <li>
                      Provide accurate information during registration and keep your
                      profile information up to date.
                    </li>
                    <li>
                      Notify us promptly if you suspect unauthorized access or suspicious
                      activity.
                    </li>
                  </ul>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <AdminPanelSettingsOutlined className="text-blue-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Acceptable use
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    You agree to use PlantDecor in a lawful, respectful manner and not to
                    interfere with the platform’s reliability or other users’ experience.
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={1} className="items-center">
                    <ReportProblemOutlined className="text-amber-700!" />
                    <Typography variant="h6" className="font-semibold! text-gray-900!">
                      Prohibited activities
                    </Typography>
                  </Stack>

                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Attempting to gain unauthorized access to accounts or systems.</li>
                    <li>
                      Abusing APIs, scraping excessively, or performing actions that
                      degrade service performance.
                    </li>
                    <li>
                      Uploading malicious code, using automated tools to exploit
                      vulnerabilities, or bypassing security controls.
                    </li>
                    <li>
                      Harassment, hate speech, or any content that is unlawful or harmful.
                    </li>
                    <li>
                      Fraudulent behavior (including payment fraud, chargeback abuse, or
                      misrepresentation).
                    </li>
                  </ul>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <GavelOutlined className="text-purple-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      User content & submissions
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    If you submit content (e.g., reviews, images, messages), you confirm
                    that you have the right to share it and that it does not violate any
                    law or third-party rights.
                  </Typography>

                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Do not post private information (yours or others) in public areas.
                    </li>
                    <li>Do not impersonate others or misrepresent affiliations.</li>
                    <li>
                      We may remove content that violates this policy or applicable law.
                    </li>
                  </ul>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <AdminPanelSettingsOutlined className="text-red-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Enforcement
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    If we reasonably believe this policy has been violated, we may take
                    actions such as warnings, content removal, feature restrictions,
                    temporary suspension, or account termination, depending on severity.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <SupportAgentOutlined className="text-green-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Questions or reports
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    If you have questions about this policy or want to report misuse,
                    contact us at{" "}
                    <a
                      className="text-green-700 hover:text-green-800 underline underline-offset-2"
                      href={`mailto:${POLICY.supportEmail}`}
                    >
                      {POLICY.supportEmail}
                    </a>
                    .
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </section>
    </div>
  );
}

