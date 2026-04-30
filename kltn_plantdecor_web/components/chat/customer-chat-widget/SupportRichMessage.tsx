"use client";

import { Button, Box, Typography } from "@mui/material";
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

