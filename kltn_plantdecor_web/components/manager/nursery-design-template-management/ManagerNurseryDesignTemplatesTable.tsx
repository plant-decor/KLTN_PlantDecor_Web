'use client';

import {
  Chip,
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
} from '@mui/material';
import { DeleteOutline, ToggleOff, ToggleOn, Visibility } from '@mui/icons-material';
import { CustomLoading } from '@/components/CustomLoading';
import type { ManagerNurseryDesignTemplateListItem } from '@/types/manager-design-template.types';
import { formatDateTime } from '@/lib/utils/dateUtils';

interface ManagerNurseryDesignTemplatesTableProps {
  items: ManagerNurseryDesignTemplateListItem[];
  loading: boolean;
  onViewDetailClick: (item: ManagerNurseryDesignTemplateListItem) => void;
  onToggleClick: (item: ManagerNurseryDesignTemplateListItem) => void;
  onDeleteClick: (item: ManagerNurseryDesignTemplateListItem) => void;
}

export default function ManagerNurseryDesignTemplatesTable({
  items,
  loading,
  onViewDetailClick,
  onToggleClick,
  onDeleteClick,
}: ManagerNurseryDesignTemplatesTableProps) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid var(--card-border)' }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Design Template</TableCell>
            {/* <TableCell sx={{ fontWeight: 700 }}>Nursery</TableCell> */}
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <CustomLoading size={24} />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No nursery design templates found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.7 }}>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <Typography fontWeight={700}>{item.designTemplateName}</Typography>
                  {/* <Typography variant="caption" color="text.secondary">
                    Design Template ID: {item.designTemplateId}
                  </Typography> */}
                </TableCell>
                {/* <TableCell>
                  <Typography>{item.nurseryName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Nursery ID: {item.nurseryId}
                  </Typography>
                </TableCell> */}
                <TableCell align="center">
                  <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell>{item.createdAt ? formatDateTime(item.createdAt) : '-'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" color="primary" onClick={() => onViewDetailClick(item)} aria-label="View design template detail">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color={item.isActive ? 'success' : 'default'} onClick={() => onToggleClick(item)}>
                      {item.isActive ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteClick(item)}>
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
