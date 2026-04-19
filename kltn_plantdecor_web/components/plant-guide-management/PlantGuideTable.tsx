'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
import { Delete, Edit, Visibility } from '@mui/icons-material';
import type { AdminPlantGuideDetail } from '@/types/admin-plant-guide.types';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { localizeRoomDesignEnumLabel } from '@/lib/utils/roomDesignEnumI18n';

interface PlantGuideTableProps {
  plantGuides: AdminPlantGuideDetail[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (pageNumber: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  onView: (guide: AdminPlantGuideDetail) => void;
  onEdit: (guide: AdminPlantGuideDetail) => void;
  onDelete: (guide: AdminPlantGuideDetail) => void;
}

const truncateText = (value: string, maxLength = 60) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
};

export default function PlantGuideTable({
  plantGuides,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}: PlantGuideTableProps) {
  const tRoomDesignEnum = useTranslations('roomDesignEnums');
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Plant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Light Requirement</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Watering</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Care Notes</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">Loading data...</Typography>
                </TableCell>
              </TableRow>
            ) : plantGuides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No Plant Guides found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              plantGuides.map((guide) => (
                <TableRow key={guide.id} hover>
                  <TableCell>{guide.id}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>{guide.plantName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Plant ID: {guide.plantId}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={localizeRoomDesignEnumLabel(
                        guide.lightRequirementName,
                        tRoomDesignEnum,
                        'LightRequirement'
                      )}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{guide.watering}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2">
                      {truncateText(guide.careNotes || '-')}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(guide.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => onView(guide)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Plant Guide">
                        <IconButton size="small" color="primary" onClick={() => onEdit(guide)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Plant Guide">
                        <IconButton size="small" color="error" onClick={() => onDelete(guide)}>
                          <Delete fontSize="small" />
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
          rowsPerPageOptions={[10, 20, 50]}
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
