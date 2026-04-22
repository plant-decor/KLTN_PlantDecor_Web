"use client";

import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { NurseryServiceScheduleItem } from "@/types/care-service.types";
import type { StoreUserItem } from "@/types/store-management.types";

interface CaretakerScheduleDrawerProps {
  open: boolean;
  caretaker: StoreUserItem | null;
  fromDate: string;
  toDate: string;
  loading: boolean;
  error: string | null;
  items: NurseryServiceScheduleItem[];
  onClose: () => void;
  onChangeFromDate: (value: string) => void;
  onChangeToDate: (value: string) => void;
  onRefresh: () => void;
  onViewProgressDetail: (serviceProgressId: number) => void;
}

const formatDateForDisplay = (value: string): string => {
  if (!value) {
    return "-";
  }

  const parts = value.split("-");
  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getStatusColor = (status: number): "warning" | "info" | "success" | "error" | "default" => {
  switch (status) {
    case 1:
      return "warning";
    case 2:
      return "info";
    case 3:
      return "success";
    case 4:
      return "success";
    case 5:
      return "error";
    default:
      return "default";
  }
};

export default function CaretakerScheduleDrawer({
  open,
  caretaker,
  fromDate,
  toDate,
  loading,
  error,
  items,
  onClose,
  onChangeFromDate,
  onChangeToDate,
  onRefresh,
  onViewProgressDetail,
}: CaretakerScheduleDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", md: 820 } } }}>
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Caretaker Schedule
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {caretaker ? `Caretaker: ${caretaker.username} (#${caretaker.id})` : "No caretaker selected"}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="From date"
              type="date"
              size="small"
              value={fromDate}
              onChange={(event) => onChangeFromDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              slotProps={{ htmlInput: { max: toDate || undefined } }}
            />
            <TextField
              label="To date"
              type="date"
              size="small"
              value={toDate}
              onChange={(event) => onChangeToDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              slotProps={{ htmlInput: { min: fromDate || undefined } }}
            />
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={!caretaker || !fromDate || !toDate}>
              Reload
            </Button>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 2.5, flex: 1, overflow: "auto", bgcolor: "#f7f7f7" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!error && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total {items.length} care sessions in the selected period.
            </Typography>
          )}

          <TableContainer sx={{ border: "1px solid var(--card-border)", borderRadius: 2, bgcolor: "white" }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "var(--primary)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Session</TableCell>
             
                  <TableCell sx={{ fontWeight: 600 }} align="center">Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Shifts</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Service Package</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      Caretaker has no care sessions in this period.
                    </TableCell>
                  </TableRow>
                )}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      Loading care schedule...
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>#{item.id}</TableCell>
                      <TableCell>{formatDateForDisplay(item.taskDate)}</TableCell>
                      <TableCell>
                        {item.shift ? `${item.shift.shiftName} (${item.shift.startTime} - ${item.shift.endTime})` : "-"}
                      </TableCell>
                      <TableCell>{item.serviceRegistration?.customer?.fullName || "-"}</TableCell>
                      <TableCell>{item.serviceRegistration?.nurseryCareService.careServicePackage.name || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={getStatusColor(item.status)}
                          label={item.statusName || "-"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => onViewProgressDetail(item.id)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Drawer>
  );
}
