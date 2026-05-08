"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ClickableImageViewer from "@/components/image-view/ClickableImageViewer";
import type { DesignRegistrationTask } from "@/types/design-registration.types";
import { formatDate, formatDateTime } from "@/lib/utils/dateUtils";

interface DesignTaskDetailDialogProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: DesignRegistrationTask | null;
  onClose: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || "-"}
      </Typography>
    </Stack>
  );
}

export default function DesignTaskDetailDialog({
  open,
  loading,
  error,
  detail,
  onClose,
}: DesignTaskDetailDialogProps) {
  console.log('detail', detail);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Design task details #{detail?.id || "-"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && <Typography>Loading design task details...</Typography>}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && detail && (
          <Stack spacing={2}>
            <DetailRow label="Task type" value={detail.taskTypeName || `#${detail.taskType}`} />
            <DetailRow label="Status" value={detail.statusName || `#${detail.status}`} />
            <DetailRow label="Scheduled date" value={detail.scheduledDate ? formatDate(detail.scheduledDate) : "-"} />
            <DetailRow label="Created at" value={detail.createdAt ? formatDateTime(detail.createdAt) : "-"} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="subtitle1" fontWeight={700}>
              Assigned staff
            </Typography>
            <DetailRow label="Name" value={detail.assignedStaff?.fullName || "Unassigned"} />
            <DetailRow label="Email" value={detail.assignedStaff?.email || "-"} />
            <DetailRow label="Phone" value={detail.assignedStaff?.phone || "-"} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="subtitle1" fontWeight={700}>
              Registration information
            </Typography>
            {/* <DetailRow label="Registration ID" value={detail.registration?.id ? `#${detail.registration.id}` : "-"} /> */}
            <DetailRow label="Customer" value={detail.registration.customer?.fullName ? `${detail.registration.customer?.fullName} | ${detail.registration.customer?.email}` : "-"} />
            <DetailRow label="Registration status" value={detail.registration?.statusName || `#${detail.registration?.status ?? "-"}`} />
            <DetailRow label="Phone" value={detail.registration?.phone || "-"} />
            <DetailRow label="Address" value={detail.registration?.address || "-"} />

            {detail.taskMaterialUsages.length > 0 && (
              <>
                <Divider sx={{ my: 0.5 }} />

                <Typography variant="subtitle1" fontWeight={700}>
                  Material usages
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Material</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.taskMaterialUsages.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>{usage.materialName || `#${usage.materialId}`}</TableCell>
                          <TableCell align="right">{usage.actualQuantity}</TableCell>
                          <TableCell>{usage.note || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {detail.reportImageUrl && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                  Report image
                </Typography>
                <ClickableImageViewer
                  images={[detail.reportImageUrl]}
                  alt="Design task report"
                  containerClassName="w-full max-w-[260px] bg-gray-100"
                  showZoomHint
                />
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
