"use client";

import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Avatar,
  Snackbar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  PaginationItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import type { EnumOption } from "@/types/care-service.types";
import type {
  MyCareReminderItem,
  MyPlantItemWithGuide,
} from "@/types/my-plant.types";
import { useCareReminderTypeEnums } from "../../hooks/useCareReminderTypeEnums";
import { useCreateMyCareReminder } from "../../hooks/useCreateMyCareReminder";
import { useUpdateMyCareReminder } from "../../hooks/useUpdateMyCareReminder";
import { useMyCareReminders } from "../../hooks/useMyCareReminders";
import { useDeleteMyCareReminder } from "../../hooks/useDeleteMyCareReminder";
import { useCompleteMyCareReminder } from "../../hooks/useCompleteMyCareReminder";
import { formatDate } from "@/lib/utils/dateUtils";


const getCareTypeChipStyles = (careTypeName?: string | null) => {
  const normalized = (careTypeName ?? "").toLowerCase();

  if (normalized.includes("watering")) {
    return { bgcolor: "#2196f3", color: "white" };
  }
  if (normalized.includes("fertilizing")) {
    return { bgcolor: "#ff9800", color: "white" };
  }
  if (normalized.includes("pruning")) {
    return { bgcolor: "#4caf50", color: "white" };
  }
  if (normalized.includes("misting")) {
    return { bgcolor: "#00bcd4", color: "white" };
  }
  if (normalized.includes("cleaning")) {
    return { bgcolor: "#9c27b0", color: "white" };
  }

  return { bgcolor: "grey.500", color: "white" };
};

const getReminderContent = (reminder: MyCareReminderItem) =>
  reminder.content || reminder.message || "";

type CareRemindersSectionProps = {
  plants: MyPlantItemWithGuide[];
};

export default function CareRemindersSection({
  plants,
}: CareRemindersSectionProps) {
  const { options: careTypeOptions, isLoading: isCareTypesLoading } =
    useCareReminderTypeEnums();
  const { createReminder, isSaving: isCreatingReminder } =
    useCreateMyCareReminder();
  const { updateReminder, isSaving: isUpdatingReminder } =
    useUpdateMyCareReminder();
  const { deleteReminder, isDeleting } = useDeleteMyCareReminder();
  const { completeReminder, isCompleting } = useCompleteMyCareReminder();

  const [selectedCareType, setSelectedCareType] = useState<number | "all">(
    "all",
  );
  const [reminderPage, setReminderPage] = useState(1);
  const reminderPageSize = 5;
  const reminderQuery = useMemo(
    () => ({
      careType: selectedCareType === "all" ? undefined : selectedCareType,
      pageNumber: reminderPage,
      pageSize: reminderPageSize,
    }),
    [reminderPage, selectedCareType],
  );
  const { reminders, pagination, isLoading, error, reloadReminders } =
    useMyCareReminders({ query: reminderQuery });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userPlantId: plants[0]?.id ?? 0,
    careType: careTypeOptions[0]?.value ?? 0,
    content: "",
    reminderDate: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title?: string | null;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");

  const showSnackbarMessage = (
    message?: string,
    severity: "success" | "error" | "info" = "success",
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
      await reloadReminders();
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({
      userPlantId: plants[0]?.id ?? 0,
      careType: careTypeOptions[0]?.value ?? 0,
      content: "",
      reminderDate: "",
    });
    setIsDialogOpen(true);
  };

  const selectedCareTypeLabel =
    selectedCareType === "all"
      ? "All reminder types"
      : (careTypeOptions.find(
          (option: EnumOption) => option.value === selectedCareType,
        )?.name ?? "Selected type");

  const handleSaveReminder = async () => {
    if (
      !formData.userPlantId ||
      !formData.careType ||
      !formData.reminderDate ||
      !formData.content.trim()
    ) {
      return;
    }

    const body = {
      userPlantId: formData.userPlantId,
      careType: formData.careType,
      content: formData.content.trim(),
      reminderDate: formData.reminderDate,
    };

    if (editingId != null) {
      const updated = await updateReminder(editingId, body);
      setFormData((prev) => ({ ...prev, content: "", reminderDate: "" }));
      setIsDialogOpen(false);
      setEditingId(null);
      showSnackbarMessage(
        updated.message,
        updated.success ? "success" : "error",
      );
      await reloadReminders();
      return;
    }

    const created = await createReminder(body);
    setFormData((prev) => ({ ...prev, content: "", reminderDate: "" }));
    setIsDialogOpen(false);
    showSnackbarMessage(created.message, created.success ? "success" : "error");
    await reloadReminders();
  };

  return (
    <Stack spacing={3}>
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          bgcolor: "#f7fbf7",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            {/* Header with title and Add button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Care reminders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all upcoming and completed plant care notes.
                </Typography>
              </Box>
              <IconButton
                onClick={openCreateDialog}
                sx={{
                  bgcolor: "#4caf50",
                  color: "white",
                  "&:hover": { bgcolor: "#45a049" },
                }}
                disabled={plants.length === 0}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {plants.length === 0 && (
              <Alert severity="info">
                You need at least one plant before creating a new care reminder.
              </Alert>
            )}

            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
              }}
            >
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={750}>
                        All reminders
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete list of all care reminders.
                      </Typography>
                    </Box>

                    {isLoading ? (
                      <Typography variant="body2" color="text.secondary">
                        Loading reminders...
                      </Typography>
                    ) : error ? (
                      <Alert severity="warning">
                        Unable to load care reminders.
                      </Alert>
                    ) : (
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: { xs: "stretch", sm: "center" },
                            justifyContent: "space-between",
                            gap: 2,
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <TextField
                            select
                            size="small"
                            label="Filter by type"
                            value={selectedCareType}
                            onChange={(event) => {
                              const value = event.target.value;
                              setReminderPage(1);
                              setSelectedCareType(
                                value === "all" ? "all" : Number(value),
                              );
                            }}
                            sx={{ minWidth: { xs: "100%", sm: 200 } }}
                          >
                            <MenuItem value="all">All reminder types</MenuItem>
                            {careTypeOptions.map((option: EnumOption) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </TextField>
                          <Typography variant="body2" color="text.secondary">
                            Showing page {pagination.pageNumber} of{" "}
                            {pagination.totalPages || 1}
                          </Typography>
                        </Box>

                        {reminders.length === 0 ? (
                          <Alert severity="info">
                            No care reminders found for{" "}
                            {selectedCareTypeLabel.toLowerCase()}.
                          </Alert>
                        ) : (
                          <Stack spacing={1.25}>
                            {reminders.map((reminder) => (
                              <Box
                                key={reminder.id}
                                sx={{
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  pb: 1.25,
                                  opacity: reminder.isCompleted ? 0.72 : 1,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="flex-start"
                                >
                                  <Avatar
                                    variant="rounded"
                                    src={reminder.plantImageUrl ?? undefined}
                                    alt={reminder.plantName}
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      border: "1px solid",
                                      borderColor: "divider",
                                      bgcolor: "success.50",
                                      color: "success.dark",
                                      fontWeight: 700,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {reminder.plantName?.charAt(0) ?? "P"}
                                  </Avatar>

                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      useFlexGap
                                      flexWrap="wrap"
                                      sx={{ mb: 0.5, alignItems: "center" }}
                                    >
                                      <Chip
                                        label={formatDate(
                                          reminder.reminderDate ?? '',
                                        )}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={reminder.careTypeName}
                                        size="small"
                                        sx={getCareTypeChipStyles(
                                          reminder.careTypeName,
                                        )}
                                      />
                                      {reminder.isCompleted && (
                                        <Chip
                                          label="Done"
                                          size="small"
                                          color="success"
                                        />
                                      )}
                                      <Box
                                        sx={{
                                          ml: "auto",
                                          display: "flex",
                                          gap: 0.5,
                                        }}
                                      >
                                        <Tooltip
                                          title={
                                            reminder.isCompleted
                                              ? "Already done"
                                              : "Mark as done"
                                          }
                                        >
                                          <span>
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleCompleteReminder(
                                                  reminder.id,
                                                )
                                              }
                                              sx={{ color: "success.main" }}
                                              disabled={
                                                isCompleting ||
                                                reminder.isCompleted
                                              }
                                            >
                                              <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setEditingId(reminder.id);
                                            setFormData((prev) => ({
                                              ...prev,
                                              userPlantId: reminder.userPlantId,
                                              careType: reminder.careType,
                                              content:
                                                reminder.content ||
                                                reminder.message ||
                                                "",
                                              reminderDate:
                                                reminder.reminderDate?.split(
                                                  "T",
                                                )[0] ?? "",
                                            }));
                                            setIsDialogOpen(true);
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setDeleteTarget({
                                              id: reminder.id,
                                              title:
                                                reminder.title ||
                                                reminder.careTypeName,
                                            });
                                            setIsDeleteDialogOpen(true);
                                          }}
                                          sx={{ color: "error.main" }}
                                          disabled={isDeleting}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Stack>
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight={700}
                                      noWrap
                                    >
                                      {reminder.plantName}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {getReminderContent(reminder)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        )}

                        {pagination.totalPages > 1 && (
                          <Stack spacing={1} alignItems="center" sx={{ pt: 1 }}>
                            <Pagination
                              count={pagination.totalPages}
                              page={pagination.pageNumber}
                              onChange={(_, value) => setReminderPage(value)}
                              color="primary"
                              shape="rounded"
                              renderItem={(item) => (
                                <PaginationItem
                                  {...item}
                                  sx={{ borderRadius: 2 }}
                                />
                              )}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {pagination.totalCount} reminder(s)
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
            </Card>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingId(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Edit care reminder" : "Create care reminder"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Plant"
              value={formData.userPlantId}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  userPlantId: Number(event.target.value),
                }))
              }
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.plantName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Care type"
              value={formData.careType}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  careType: Number(event.target.value),
                }))
              }
              disabled={isCareTypesLoading}
            >
              {careTypeOptions.map((option: EnumOption) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Reminder date"
              value={formData.reminderDate}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  reminderDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Note"
              placeholder="Add a reminder note"
              value={formData.content}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  content: event.target.value,
                }))
              }
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveReminder}
            variant="contained"
            disabled={
              isCreatingReminder ||
              isUpdatingReminder ||
              !formData.userPlantId ||
              !formData.careType ||
              !formData.reminderDate ||
              !formData.content.trim()
            }
          >
            {editingId
              ? isUpdatingReminder
                ? "Updating..."
                : "Update"
              : isCreatingReminder
                ? "Creating..."
                : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete reminder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the reminder{" "}
            <strong>{deleteTarget?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!deleteTarget) return;
              const res = await deleteReminder(deleteTarget.id);
              setIsDeleteDialogOpen(false);
              showSnackbarMessage(
                res.message,
                res.success ? "success" : "error",
              );
              if (res.success) {
                await reloadReminders();
              }
              setDeleteTarget(null);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
