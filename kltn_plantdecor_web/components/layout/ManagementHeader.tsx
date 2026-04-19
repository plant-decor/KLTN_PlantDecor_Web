import React from "react";
import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";

interface ActionItem {
  label: string;
  onClick: () => void;
}

interface ManagementHeaderProps {
  title: string;
  description?: string;
  entityLabel: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
  actions?: ActionItem[];
}

export default function ManagementHeader({
  title,
  description,
  entityLabel,
  count,
  actionLabel,
  onAction,
  actions,
}: ManagementHeaderProps) {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
      {count !== undefined && count !== null && (
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            List {entityLabel} ({count})
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            {actionLabel && onAction && (
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ ...hoverLiftStyle }}
                className="bg-primary!"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
            {actions && actions.length > 0 && (
              <>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ ...hoverLiftStyle }}
                    className="bg-primary!"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </>
            )}
          </Stack>
        </Box>
      )}
    </>
  );
}
