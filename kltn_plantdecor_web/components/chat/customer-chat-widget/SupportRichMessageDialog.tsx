"use client";

import Link from "next/link";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import type { SupportRichMessageKind } from "./parseSupportRichMessage";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

type Props = {
  open: boolean;
  kind: SupportRichMessageKind;
  title?: string;
  content: string;
  onClose: () => void;
};

const defaultTitleByKind: Record<SupportRichMessageKind, string> = {
  plain: "Details",
  careTips: "Care tips",
  suggestedPlants: "Suggested plants",
};

export function SupportRichMessageDialog({ open, kind, title, content, onClose }: Props) {
  const resolvedTitle = title ?? defaultTitleByKind[kind] ?? "Details";
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        // Prevent accidental close when clicking inside content
        // (some layouts can cause the click to be treated as a backdrop click).
        if (reason === "backdropClick") return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="support-rich-message-dialog-title"
    >
      <DialogTitle id="support-rich-message-dialog-title" sx={{ fontWeight: 800 }}>
        {resolvedTitle}
      </DialogTitle>
      <DialogContent dividers>
        {kind === "suggestedPlants" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {lines.map((line, idx) => {
              const match = line.match(/^(\s*\d+\.\s+)(.*?)(\s+\((\/products\/\d+)\))?(.*)$/);
              if (!match) {
                return (
                  <Typography
                    key={`${idx}-${line}`}
                    sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14 }}
                  >
                    {line}
                  </Typography>
                );
              }

              const prefix = match[1] ?? "";
              const name = (match[2] ?? "").trim();
              const productPath = match[4] ?? "";
              const tail = (match[5] ?? "").trimEnd();

              if (!productPath) {
                return (
                  <Typography
                    key={`${idx}-${line}`}
                    sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14 }}
                  >
                    {line}
                  </Typography>
                );
              }

              return (
                <Typography
                  key={`${idx}-${line}`}
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14 }}
                >
                  {prefix}
                  <Link href={productPath} className="text-green-700 hover:underline font-semibold">
                    {name}
                  </Link>
                  {tail ? ` ${tail}` : ""}
                </Typography>
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14 }}>
            {content}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" 
        sx={{ textTransform: "none", fontWeight: 700, backgroundColor:'var(--error)', ...hoverLiftStyle }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

