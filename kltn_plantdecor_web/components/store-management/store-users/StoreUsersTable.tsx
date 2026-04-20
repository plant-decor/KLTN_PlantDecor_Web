"use client";

import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState, type MouseEvent } from "react";
import type { StoreUserItem, StoreUserSpecializationOption } from "@/types/store-management.types";

interface StoreUsersTableProps {
  items: StoreUserItem[];
  specializationOptions: StoreUserSpecializationOption[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  onViewDetail: (staffId: number) => void;
  onViewSchedule: (staffId: number) => void;
  onQuickAssign: (staffId: number, specializationId: number) => void;
  onChangePage: (_event: unknown, nextPage: number) => void;
  onChangeRowsPerPage: (nextPageSize: number) => void;
  readOnly?: boolean;
}

const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return "Hoạt động";
    case 2:
      return "Tạm khóa";
    default:
      return "Không xác định";
  }
};

const getStatusColor = (status: number): "success" | "warning" | "default" => {
  switch (status) {
    case 1:
      return "success";
    case 2:
      return "warning";
    default:
      return "default";
  }
};

export default function StoreUsersTable({
  items,
  specializationOptions,
  pageNumber,
  pageSize,
  totalCount,
  loading,
  onViewDetail,
  onViewSchedule,
  onQuickAssign,
  onChangePage,
  onChangeRowsPerPage,
  readOnly = false,
}: StoreUsersTableProps) {
  const [quickMenuAnchorEl, setQuickMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [quickMenuStaffId, setQuickMenuStaffId] = useState<number | null>(null);

  const getAvailableSpecializations = (staff: StoreUserItem) => {
    const ownedIds = new Set(staff.specializations.map((item) => item.id));
    return specializationOptions.filter((specialization) => !ownedIds.has(specialization.id));
  };

  const openQuickMenu = (event: MouseEvent<HTMLElement>, staffId: number) => {
    setQuickMenuAnchorEl(event.currentTarget);
    setQuickMenuStaffId(staffId);
  };

  const closeQuickMenu = () => {
    setQuickMenuAnchorEl(null);
    setQuickMenuStaffId(null);
  };

  const activeStaff = items.find((staff) => staff.id === quickMenuStaffId) ?? null;
  const activeQuickOptions = activeStaff ? getAvailableSpecializations(activeStaff) : [];

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid var(--card-border)", borderRadius: 2, overflow: "hidden" }}
    >
      <Table size="small">
        <TableHead sx={{ backgroundColor: "var(--primary)" }}>
          <TableRow className="font-bold">
            <TableCell sx={{ fontWeight:700}} align="center" >ID</TableCell>
            <TableCell sx={{ fontWeight:700}} align="center" >Staff Name</TableCell>
            <TableCell sx={{ fontWeight:700}} align="center" >Email</TableCell>
            <TableCell sx={{ fontWeight:700}} align="center" >Phone Number</TableCell>
            <TableCell sx={{ fontWeight:700}} align="center" >Status</TableCell>
            <TableCell sx={{ fontWeight:700}} align="center" >Specialization</TableCell>
            <TableCell sx={{fontWeight: 700}} align="center">
              Actions 
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 3 }}>
                  <CircularProgress size={26} />
                </Box>
              </TableCell>
            </TableRow>
          )}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                No staff members found.
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((staff) => (
              <TableRow key={staff.id} hover>
                <TableCell align="center">{staff.id}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={staff.avatarUrl ?? undefined}>{staff.username.charAt(0)}</Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {staff.username}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">{staff.email || "-"}</TableCell>
                <TableCell align="center">{staff.phoneNumber || "-"}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(staff.status)}
                    size="small"
                    color={getStatusColor(staff.status)}
                    variant="outlined"
                  />
                </TableCell>
                {staff.specializations.length == 0 ? (
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      No specializations
                    </Typography>
                  </TableCell>
                ) : (
                  <TableCell align="center">
                  <Typography variant="body2">{staff.specializations.length} specializations</Typography>
                </TableCell>
                )}
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton color="primary" onClick={() => onViewDetail(staff.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  {staff.specializations.length > 0 && !readOnly && (
                      <Tooltip title="Add Specialization">
                        <span>
                          <IconButton
                            color="secondary"
                            onClick={(event) => openQuickMenu(event, staff.id)}
                            disabled={getAvailableSpecializations(staff).length === 0}
                          >
                            <AddIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  
                                        {staff.specializations.length > 0 && (
                    <Tooltip title="View Schedule">
                      <IconButton color="info" onClick={() => onViewSchedule(staff.id)}>
                        <CalendarMonthIcon />
                      </IconButton>
                    </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Menu anchorEl={quickMenuAnchorEl} open={Boolean(quickMenuAnchorEl)} onClose={closeQuickMenu}>
        {activeQuickOptions.length > 0 ? (
          activeQuickOptions.map((specialization) => (
            <MenuItem
              key={specialization.id}
              onClick={() => {
                if (quickMenuStaffId !== null) {
                  onQuickAssign(quickMenuStaffId, specialization.id);
                }
                closeQuickMenu();
              }}
            >
              {specialization.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>Staff already has all specializations</MenuItem>
        )}
      </Menu>

      <TablePagination
        component="div"
        count={totalCount}
        page={Math.max(pageNumber - 1, 0)}
        rowsPerPage={pageSize}
        onPageChange={onChangePage}
        onRowsPerPageChange={(event) => onChangeRowsPerPage(Number(event.target.value))}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Rows per page"
      />
    </TableContainer>
  );
}
