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
import type { AdminSpecializationListItem } from "@/types/admin-specialization.types";
import { CustomLoading } from "@/components/CustomLoading";

interface SpecializationTableProps {
  specializations: AdminSpecializationListItem[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SpecializationTable({
  specializations,
  loading,
  onView,
  onEdit,
  onDelete,
}: SpecializationTableProps) {
  return (
    <Paper sx={{ border: "1px solid var(--card-border)", overflow: "hidden" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CustomLoading size={18} />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "var(--primary)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specializations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    No specializations available.
                  </TableCell>
                </TableRow>
              ) : (
                specializations.map((item) => (
                  <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.65 }}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </TableCell>
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
                            onClick={() => onDelete(item.id)}
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
