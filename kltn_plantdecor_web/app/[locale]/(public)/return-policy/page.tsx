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
  AssignmentReturnOutlined,
  ChecklistOutlined,
  LocalShippingOutlined,
  PaidOutlined,
  ReportProblemOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";

interface ReturnPolicyPageProps {
  params: Promise<{ locale: string }>;
}

const DEFAULT_OG_IMAGE = "/img/landingPageImage(1).jpg";

export async function generateMetadata({
  params,
}: ReturnPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title = "Return Policy";
  const description =
    "Learn about eligibility, exclusions, return steps, refunds, exchanges, and timelines for PlantDecor orders.";

  const canonicalPath = locale === "en" ? "/return-policy" : `/${locale}/return-policy`;

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
  eligibilityWindowDays: 3,
  refundProcessingDays: "3–10",
  contactEmail: "support@plantdecor.vn",
} as const;

export default async function ReturnPolicyPage() {
  return (
    <div className="bg-gray-50 pb-16">
      <section className="bg-linear-to-r from-green-50 via-white to-green-100 border-b border-gray-100 py-12 md:py-16">
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} className="items-center">
              <AssignmentReturnOutlined className="text-green-700!" />
              <Typography variant="h4" className="font-bold! text-gray-900!">
                Return Policy
              </Typography>
            </Stack>

            <Typography className="text-gray-600! text-lg!">
              This policy explains how returns, refunds, and exchanges work for purchases
              made on PlantDecor.
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
              <Chip
                size="small"
                label={`Return window: ${POLICY.eligibilityWindowDays} days`}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Alert severity="info" icon={<ChecklistOutlined />}>
              Keep your order number and photos (if the item arrived damaged) to speed up
              the return process.
            </Alert>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <ChecklistOutlined className="text-emerald-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Eligibility
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    You may request a return within{" "}
                    <strong>{POLICY.eligibilityWindowDays} days</strong> of delivery when
                    the following conditions are met:
                  </Typography>

                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>The item is unused and in its original condition.</li>
                    <li>Original packaging, tags, and included accessories are intact.</li>
                    <li>You can provide proof of purchase (order confirmation/receipt).</li>
                  </ul>

                  <Divider />

                  <Stack direction="row" spacing={1} className="items-center">
                    <ReportProblemOutlined className="text-amber-700!" />
                    <Typography variant="h6" className="font-semibold! text-gray-900!">
                      Non-returnable items
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    For safety and quality reasons, the following items are generally not
                    eligible for return:
                  </Typography>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Gift cards and promotional items.</li>
                    <li>Items marked as final sale/clearance (if applicable).</li>
                    <li>
                      Perishable goods and live plants that have been repotted, pruned, or
                      otherwise altered after delivery.
                    </li>
                  </ul>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <LocalShippingOutlined className="text-blue-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      How to start a return
                    </Typography>
                  </Stack>

                  <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                    <li>
                      Contact support with your order number and the item(s) you want to
                      return.
                    </li>
                    <li>
                      If the item is damaged or incorrect, attach clear photos of the
                      product and packaging.
                    </li>
                    <li>
                      We will confirm eligibility and provide return instructions (and a
                      return address if applicable).
                    </li>
                    <li>
                      Pack the item securely to prevent shipping damage and send it back
                      per the instructions.
                    </li>
                  </ol>

                  <Alert severity="warning">
                    Please do not send items back without contacting support first. Untracked
                    or unsolicited returns may be delayed.
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <PaidOutlined className="text-purple-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Refunds & exchanges
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    Once we receive and inspect the returned item, we will notify you of the
                    approval status. Approved refunds are processed within{" "}
                    <strong>{POLICY.refundProcessingDays} business days</strong> and sent to
                    the original payment method when possible.
                  </Typography>

                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      <strong>Refund amount</strong> may exclude original shipping fees (if
                      applicable) unless the return is due to our error.
                    </li>
                    <li>
                      <strong>Exchanges</strong> are offered when stock is available. If the
                      replacement item is unavailable, we will refund instead.
                    </li>
                    <li>
                      <strong>Bank/issuer posting time</strong> may vary after we process
                      your refund.
                    </li>
                  </ul>
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-gray-100">
              <CardContent className="p-6! md:p-8!">
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} className="items-center">
                    <ReportProblemOutlined className="text-red-700!" />
                    <Typography variant="h5" className="font-semibold! text-gray-900!">
                      Damaged, wrong, or missing items
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    If your order arrives damaged, incorrect, or incomplete, please contact
                    us as soon as possible. We may offer a replacement, partial refund, or
                    full refund depending on the case.
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
                      Need help?
                    </Typography>
                  </Stack>

                  <Typography className="text-gray-700!">
                    Contact our support team at{" "}
                    <a
                      className="text-green-700 hover:text-green-800 underline underline-offset-2"
                      href={`mailto:${POLICY.contactEmail}`}
                    >
                      {POLICY.contactEmail}
                    </a>{" "}
                    and include your order number for faster assistance.
                  </Typography>

                  <Typography className="text-gray-700!">
                    You can also reach us via the{" "}
                    <Link
                      href="/contact"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2"
                    >
                      Contact page
                    </Link>
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

