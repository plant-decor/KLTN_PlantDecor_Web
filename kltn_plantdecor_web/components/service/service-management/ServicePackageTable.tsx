import React from "react";
import { DeleteOutline, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { AdminCareServicePackageListItem } from "@/types/admin-service-package.types";
import { toCurrency } from "./types";

interface ServicePackageTableProps {
  packages: AdminCareServicePackageListItem[];
  loading: boolean;
  serviceTypeLabelMap: Map<number, string>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function ServicePackageTable({
  packages,
  loading,
  serviceTypeLabelMap,
  onView,
  onEdit,
  onDelete,
}: ServicePackageTableProps) {
  return (
    <Paper sx={{ border: "1px solid var(--card-border)", overflow: "hidden" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--primary)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên gói</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Loại dịch vụ</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Số lần/tuần
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Thời lượng (ngày)
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Diện tích
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Đơn giá
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Trạng thái
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    Không có gói dịch vụ nào.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((item) => (
                  <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.65 }}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.serviceTypeLabel ||
                        serviceTypeLabelMap.get(item.serviceType) ||
                        `Loại ${item.serviceType}`}
                    </TableCell>
                    <TableCell align="right">{item.visitPerWeek}</TableCell>
                    <TableCell align="right">{item.durationDays}</TableCell>
                    <TableCell align="right">{item.areaLimit}</TableCell>
                    <TableCell align="right">{toCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={item.isActive ? "success" : "default"}
                        label={item.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem">
                        <IconButton size="small" color="info" onClick={() => onView(item.id)}>
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" color="primary" onClick={() => onEdit(item.id)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isActive ? "Vô hiệu hóa" : "Đã inactive"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!item.isActive}
                            onClick={() => void onDelete(item.id)}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
