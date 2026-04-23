import React from "react";
import { DeleteOutline, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Box,
  Chip,
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
import { hoverGlowStyle } from "@/lib/styles/buttonStyles";
import { formatCurrency } from "@/lib/utils/formatUtil";
import { CustomLoading } from "@/components/CustomLoading";

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
          <CustomLoading />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--primary)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }} align="center">ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Package Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Service Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Visits/Week</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Duration (Days)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Area Limit (m²)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    No service packages available.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((item) => (
                  <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.65, ...hoverGlowStyle }}>
                    <TableCell align="center">{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.serviceTypeLabel ||
                        serviceTypeLabelMap.get(item.serviceType) ||
                        `Loại ${item.serviceType}`}
                    </TableCell>
                    <TableCell align="center">{item.visitPerWeek}</TableCell>
                    <TableCell align="center">{item.durationDays}</TableCell>
                    <TableCell align="center">{item.areaLimit}</TableCell>
                    <TableCell align="center">{formatCurrency(item.unitPrice, 'vi-VN')}</TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={item.isActive ? "success" : "default"}
                        label={item.isActive ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info" onClick={() => onView(item.id)}>
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => onEdit(item.id)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={item.isActive ? "Deactivate" : "Activate"}>
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
