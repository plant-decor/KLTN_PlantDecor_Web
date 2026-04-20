'use client';

import React from 'react';
import {
  Box,
  Chip,
  IconButton,
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
} from '@mui/material';
import { DeleteOutline, EditOutlined, VisibilityOutlined, TuneOutlined } from '@mui/icons-material';
import type { AdminDesignTemplateListItem, DesignTemplateRoomTypeOption, DesignTemplateStyleOption } from '@/types/admin-design-template.types';
import { DESIGN_TEMPLATE_TABLE_PAGE_SIZE_OPTIONS, formatCurrency, formatRoomTypes, formatStyle } from './designTemplateManagement.constants';

interface DesignTemplateTableProps {
  templates: AdminDesignTemplateListItem[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onView: (template: AdminDesignTemplateListItem) => void;
  onEdit: (template: AdminDesignTemplateListItem) => void;
  onManageTiers: (template: AdminDesignTemplateListItem) => void;
  onDelete: (template: AdminDesignTemplateListItem) => void;
  styleOptions: DesignTemplateStyleOption[];
  roomTypeOptions: DesignTemplateRoomTypeOption[];
}

const truncateText = (value: string, maxLength = 72) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

export default function DesignTemplateTable({
  templates,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onManageTiers,
  onDelete,
  styleOptions,
  roomTypeOptions,
}: DesignTemplateTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid var(--card-border)' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Template</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Style</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Room Types</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tiers</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading templates...</Typography>
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No design templates found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} hover sx={{ opacity: template.isActive === false ? 0.7 : 1 }}>
                  <TableCell>{template.id}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(template.description)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.imageUrl}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={formatStyle(template.style, styleOptions)} variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2">{formatRoomTypes(template.roomTypes, roomTypeOptions)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.75}>
                      <Chip size="small" color="primary" variant="outlined" label={`${template.tiers.length} tiers`} />
                      {template.tiers[0] && (
                        <Typography variant="caption" color="text.secondary">
                          From {formatCurrency(template.tiers[0].packagePrice)}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {template.updatedAt ? new Date(template.updatedAt).toLocaleString('vi-VN') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View details">
                        <IconButton size="small" color="primary" onClick={() => onView(template)}>
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit template">
                        <IconButton size="small" color="primary" onClick={() => onEdit(template)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage tiers">
                        <IconButton size="small" color="secondary" onClick={() => onManageTiers(template)}>
                          <TuneOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete template">
                        <IconButton size="small" color="error" onClick={() => onDelete(template)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={DESIGN_TEMPLATE_TABLE_PAGE_SIZE_OPTIONS}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize}
          page={Math.max(pageNumber - 1, 0)}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page"
        />
      </TableContainer>
    </Box>
  );
}
