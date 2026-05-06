"use client";

import { useMemo, useState } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useTodayMyCareReminders } from "@/hooks/useTodayMyCareReminders";
import { useCompleteMyCareReminder } from "@/hooks/useCompleteMyCareReminder";
import type { MyCareReminderItem } from "@/types/my-plant.types";

type HeaderNotificationDropdownProps = {
  userId: number;
  onNavigate?: () => void;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const getReminderContent = (reminder: MyCareReminderItem) =>
  reminder.content || reminder.message || "";

export default function HeaderNotificationDropdown({
  userId,
  onNavigate,
}: HeaderNotificationDropdownProps) {
  const t = useTranslations("careReminderNotifications");
  const [isOpen, setIsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const {
    reminders,
    isLoading,
    error,
    reloadTodayReminders,
  } = useTodayMyCareReminders();
  const { completeReminder, isCompleting } = useCompleteMyCareReminder();

  const activeReminders = useMemo(
    () => reminders.filter((reminder) => !reminder.isCompleted),
    [reminders],
  );

  const showSnackbarMessage = (
    message?: string,
    severity: "success" | "error" = "success",
  ) => {
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    if (!trimmedMessage) {
      return;
    }

    setSnackbarMessage(trimmedMessage);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCompleteReminder = async (id: number) => {
    const res = await completeReminder(id);
    showSnackbarMessage(res.message, res.success ? "success" : "error");
    if (res.success) {
      await reloadTodayReminders();
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Tooltip title={t("tooltip")}>
        <IconButton
          aria-label={t("tooltip")}
          onClick={() => setIsOpen((open) => !open)}
          sx={{
            color: "text.secondary",
            "&:hover": { color: "success.main", bgcolor: "success.50" },
          }}
        >
          <Badge
            badgeContent={activeReminders.length}
            color="error"
            max={99}
            invisible={activeReminders.length === 0}
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {isOpen && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 1300,
            width: { xs: 320, sm: 380 },
            maxWidth: "calc(100vw - 24px)",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 6,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle1" fontWeight={750}>
              {t("title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("subtitle", { count: activeReminders.length })}
            </Typography>
          </Box>

          <Box sx={{ maxHeight: 360, overflowY: "auto", p: 1.5 }}>
            {isLoading ? (
              <Stack alignItems="center" spacing={1.25} sx={{ py: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  {t("loading")}
                </Typography>
              </Stack>
            ) : error ? (
              <Alert severity="warning">{t("loadError")}</Alert>
            ) : activeReminders.length === 0 ? (
              <Alert severity="info">{t("empty")}</Alert>
            ) : (
              <Stack spacing={1.25}>
                {activeReminders.map((reminder) => (
                  <Box
                    key={reminder.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      p: 1.25,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 0.75 }}>
                          <Chip label={formatDate(reminder.reminderDate)} size="small" variant="outlined" />
                          <Chip label={reminder.careTypeName} size="small" color="success" />
                        </Stack>
                        <Typography variant="subtitle2" fontWeight={750} noWrap>
                          {reminder.plantName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getReminderContent(reminder)}
                        </Typography>
                      </Box>
                      <Tooltip title={t("markDone")}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleCompleteReminder(reminder.id)}
                            disabled={isCompleting}
                            sx={{ color: "success.main" }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              component={Link}
              href={`/care-reminders/${userId}`}
              fullWidth
              variant="outlined"
              color="success"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
            >
              {t("viewAll")}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
