"use client";

import { Button, Box, Stack, Typography } from "@mui/material";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";
import { useMemo, useState } from "react";
import { parseSupportRichMessage } from "./parseSupportRichMessage";
import { SupportRichMessageDialog } from "./SupportRichMessageDialog";
import { hoverGlowStyle } from "@/lib/styles/buttonStyles";

type Props = {
  text: string;
  isMine: boolean;
};

export function SupportRichMessage({ text, isMine }: Props) {
  const parsed = useMemo(() => parseSupportRichMessage(text), [text]);
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);

  if (parsed.kind === "plain") {
    return (
      <Typography
        sx={{
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </Typography>
    );
  }

  if (parsed.kind === "serviceBooking" && parsed.serviceBooking) {
    const target = parsed.serviceBooking;
    const localePrefix = target.locale ? `/${target.locale}` : "";
    const href = `${localePrefix}/services/${target.userId}?tab=care&packageId=${target.packageId}&action=book`;

    return (
      <Box
        component={Link}
        href={href}
        sx={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          borderRadius: 2,
          p: 1.25,
          minWidth: 220,
          maxWidth: 280,
          border: "1.5px solid rgba(21,128,61,0.35)",
          bgcolor: isMine ? "rgba(34,197,94,0.08)" : "#ffffff",
          boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
          transition:
            "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
            borderColor: "rgba(21,128,61,0.6)",
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "rgba(34,197,94,0.15)",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LocalFloristIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{ fontWeight: 800, fontSize: 13, color: "#15803d" }}
            >
              {target.packageName ?? "Gói dịch vụ chăm sóc cây"}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#475569",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              Nhấn để xem gói dịch vụ và đặt lịch ngay.
            </Typography>
          </Box>
          <OpenInNewIcon
            fontSize="small"
            sx={{ color: "#15803d", flexShrink: 0 }}
          />
        </Stack>
      </Box>
    );
  }

  const buttonLabel =
    parsed.kind === "careTips" ? "View care tips" : "View suggested plants";

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={openDialog}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDialog();
          }
        }}
        sx={{ cursor: "pointer" }}
      >
        <Typography
          sx={{
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {parsed.summaryText}
        </Typography>

        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant={isMine ? "outlined" : "contained"}
            onClick={(e) => {
              e.stopPropagation();
              openDialog();
            }}
            className="bg-green-700! hover:bg-green-800! text-white!"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 999,
              px: 1.25,
              py: 0.4,
              minHeight: 0,
              ...hoverGlowStyle
            }}
          >
            {buttonLabel}
          </Button>
        </Box>
      </Box>

      <SupportRichMessageDialog
        open={open}
        kind={parsed.kind}
        content={parsed.fullText}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

