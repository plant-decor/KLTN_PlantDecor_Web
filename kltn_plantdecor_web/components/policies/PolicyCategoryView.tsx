"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { ArticleOutlined, PolicyOutlined } from "@mui/icons-material";
import { getPolicyContentsByCategory, type PolicyContent } from "@/lib/api/policyContentService";

interface PolicyCategoryViewProps {
  categoryValue: number;
  categoryLabel: string;
}

const sortByDisplayOrder = (items: PolicyContent[]): PolicyContent[] => {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
};

const formatUpdatedAt = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PolicyCategoryView({
  categoryValue,
  categoryLabel,
}: PolicyCategoryViewProps) {
  const [policies, setPolicies] = useState<PolicyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setPolicies([]);

      try {
        const response = await getPolicyContentsByCategory(categoryValue, false);
        if (cancelled) {
          return;
        }

        const payload = response.payload ?? response.data ?? [];
        const items = Array.isArray(payload) ? payload : [];
        setPolicies(sortByDisplayOrder(items.filter((p) => p.isActive)));
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          (err as { message?: string })?.message ?? "Failed to load policies";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [categoryValue]);

  return (
    <div className="bg-gray-50 pb-16 min-h-[60vh]">
      <section className="bg-linear-to-r from-green-50 via-white to-green-100 border-b border-gray-100 py-12 md:py-16">
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} className="items-center">
              <PolicyOutlined className="text-green-700!" />
              <Typography variant="h4" className="font-bold! text-gray-900!">
                {categoryLabel}
              </Typography>
            </Stack>

            <Typography className="text-gray-600! text-lg!">
              Read our latest {categoryLabel.toLowerCase()} policies below. They explain
              how PlantDecor handles related matters and what is expected from our
              customers.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              className="items-start sm:items-center"
            >
              <Chip size="small" label={`Category: ${categoryLabel}`} variant="outlined" />
              {!loading && (
                <Chip
                  size="small"
                  label={`${policies.length} active polic${policies.length === 1 ? "y" : "ies"}`}
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {loading && !error && (
              <Stack spacing={2}>
                {[0, 1].map((idx) => (
                  <Card key={idx} className="border border-gray-100">
                    <CardContent className="p-6! md:p-8!">
                      <Stack spacing={1.5}>
                        <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {!loading && !error && policies.length === 0 && (
              <Card className="border border-gray-100">
                <CardContent className="p-6! md:p-8!">
                  <Stack spacing={1.5} className="items-center text-center">
                    <ArticleOutlined className="text-gray-400!" sx={{ fontSize: 48 }} />
                    <Typography variant="h6" className="text-gray-700!">
                      No active policies in this category yet.
                    </Typography>
                    <Typography className="text-gray-500!">
                      Please check back later or contact our support team for assistance.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {!loading && !error &&
              policies.map((policy) => {
                const updatedAt = formatUpdatedAt(policy.updatedAt);

                return (
                  <Card key={policy.id} className="border border-gray-100">
                    <CardContent className="p-6! md:p-8!">
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          className="sm:items-center sm:justify-between"
                        >
                          <Typography
                            variant="h5"
                            className="font-semibold! text-gray-900!"
                          >
                            {policy.title}
                          </Typography>
                          {updatedAt && (
                            <Typography
                              variant="caption"
                              className="text-gray-500! whitespace-nowrap"
                            >
                              Updated: {updatedAt}
                            </Typography>
                          )}
                        </Stack>

                        {policy.summary && (
                          <Typography className="text-gray-600! italic!">
                            {policy.summary}
                          </Typography>
                        )}

                        {policy.content && (
                          <Typography
                            className="text-gray-700! whitespace-pre-line"
                            component="div"
                          >
                            {policy.content}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
          </Stack>
        </Container>
      </section>
    </div>
  );
}
