'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type { NurseryServiceScheduleItem } from '@/types/care-service.types';

interface ManagerScheduleServicesTableProps {
  items: NurseryServiceScheduleItem[];
  loading: boolean;
  onViewDetail: (item: NurseryServiceScheduleItem) => void;
  onReassign: (item: NurseryServiceScheduleItem) => void;
}

const getStatusColor = (status: number): 'warning' | 'info' | 'success' | 'error' | 'default' => {
  switch (status) {
    case 1:
      return 'warning';
    case 2:
      return 'info';
    case 3:
      return 'success';
    case 4:
      return 'success';
    case 5:
      return 'error';
    default:
      return 'default';
  }
};

const formatDateForDisplay = (value: string): string => {
  if (!value) {
    return '-';
  }

  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getShiftDisplay = (item: NurseryServiceScheduleItem): string => {
  if (!item.shift) {
    return '-';
  }

  return `${item.shift.shiftName} (${item.shift.startTime} - ${item.shift.endTime})`;
};

export default function ManagerScheduleServicesTable({
  items,
  loading,
  onViewDetail,
  onReassign,
}: ManagerScheduleServicesTableProps) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--card-border)', borderRadius: 2 }}>
      <Table size='small'>
        <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }} align='center'>Session</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align='center'>Date</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align='center'>Shift</TableCell>
            <TableCell sx={{ fontWeight: 700 }}align='center'>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700 }}align='center'>Service Package</TableCell>
            <TableCell sx={{ fontWeight: 700 }}align='center'>Caretaker</TableCell>
            <TableCell sx={{ fontWeight: 700 }}align='center'>Status</TableCell>
            <TableCell align='center' sx={{ fontWeight: 700 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={8}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={26} />
                </Box>
              </TableCell>
            </TableRow>
          )}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align='center' sx={{ py: 4, color: 'text.secondary' }}>
                Không có lịch chăm sóc trong ngày đã chọn.
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>#{item.id}</TableCell>
                <TableCell>{formatDateForDisplay(item.taskDate)}</TableCell>
                <TableCell>{getShiftDisplay(item)}</TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant='body2' fontWeight={500}>
                      {item.serviceRegistration?.customer?.fullName || '-'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {item.serviceRegistration?.customer?.email || '-'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant='body2' fontWeight={500}>
                      {item.serviceRegistration?.nurseryCareService.careServicePackage.name || '-'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {item.serviceRegistration?.nurseryCareService.nurseryName || '-'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant='body2' fontWeight={500}>
                      {item.caretaker?.fullName || 'Chưa phân công'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {item.caretaker?.email || '-'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip size='small' variant='outlined' color={getStatusColor(item.status)} label={item.statusName || '-'} />
                </TableCell>
                <TableCell align='right'>
                  <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                    <Tooltip title='Xem chi tiết'>
                      <IconButton color='primary' onClick={() => onViewDetail(item)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Chuyển caretaker'>
                      <IconButton
                        color='secondary'
                        onClick={() => onReassign(item)}
                        disabled={!item.serviceRegistrationId}
                      >
                        <SwapHorizIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
