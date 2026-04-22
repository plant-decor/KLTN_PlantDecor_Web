'use client';

import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import type { ManagerServiceRegistration } from '@/types/care-service.types';
import {
  canApproveOrReject,
  canAssignCaretaker,
  canManagerCancel,
  canReschedule,
  formatCurrency,
  formatDate,
  getStatusChipColor,
} from './managerServiceOrders.constants';

interface ServiceOrdersTableProps {
  items: ManagerServiceRegistration[];
  statusLabels: Record<number, string>;
  submitting: boolean;
  onViewDetail: (id: number) => void;
  onApprove: (item: ManagerServiceRegistration) => void;
  onReject: (item: ManagerServiceRegistration) => void;
  onCancel: (item: ManagerServiceRegistration) => void;
  onAssignCaretaker: (item: ManagerServiceRegistration) => void;
  onReschedule: (item: ManagerServiceRegistration) => void;
}

export default function ServiceOrdersTable({
  items,
  statusLabels,
  submitting,
  onViewDetail,
  onApprove,
  onReject,
  onCancel,
  onAssignCaretaker,
  onReschedule,
}: ServiceOrdersTableProps) {
  return (
    <Table size="small">
      <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Service Package</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Service Date</TableCell>
          {/* <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell> */}
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Status
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Primary Caretaker
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Actions
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
              No service orders found.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            return (
              <TableRow key={item.id} hover>
                <TableCell>#{item.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.customer?.fullName || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.customer?.email || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.nurseryCareService.careServicePackage.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(item.nurseryCareService.careServicePackage.unitPrice)}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(item.serviceDate)}</TableCell>
                {/* <TableCell>
                  <Typography variant="body2">{item.phone || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.address || '-'}
                  </Typography>
                </TableCell> */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    color={getStatusChipColor(item.status)}
                    label={statusLabels[item.status] || item.statusName || `#${item.status}`}
                  />
                </TableCell>
                <TableCell align="center">{item.mainCaretaker?.fullName || '-'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="nowrap" maxHeight={40}>
                    <Button size="small" variant='contained' title='View Detail' className='bg-transparent! aspect-square! rounded-full!' onClick={() => onViewDetail(item.id)}>
                      <VisibilityIcon fontSize='medium'/>
                    </Button>
                    {canApproveOrReject(item.status) && (
                      <Button
                        size="small"
                        variant='contained'
                        className='bg-primary! aspect-square! rounded-full!'
                        onClick={() => onApprove(item)}
                        disabled={submitting}
                        title="Approve"
                      >
                        <CheckCircleOutlineIcon />
                      </Button>
                    )}
                    {canApproveOrReject(item.status) && (
                      <Button
                        size="small"
                        variant='contained'
                        className='bg-error! aspect-square! rounded-full!'
                        onClick={() => onReject(item)}
                        disabled={submitting}
                        title="Reject"
                      >
                        <CancelOutlinedIcon />
                      </Button>
                    )}
                    {canManagerCancel(item.status) && (
                      <Button
                        size="small"
                        color="error"
                        variant='contained'
                        className='bg-error! aspect-square! rounded-full!'
                        onClick={() => onCancel(item)}
                        disabled={submitting}
                        title="Cancel"
                      >
                        <CancelOutlinedIcon />
                      </Button>
                    )}
                    {canAssignCaretaker(item.status) && (
                      <Button
                        size="small"
                        variant='contained'
                        title="Assign Caretaker"
                        className='bg-blue-400! aspect-square! rounded-full!'
                        onClick={() => onAssignCaretaker(item)}
                        disabled={submitting}
                      >
                        <PersonAddAltOutlinedIcon />
                      </Button>
                    )}
                    {canReschedule(item.status) && (
                      <Button
                        size="small"
                        variant="contained"
                        className="bg-warning! aspect-square! rounded-full!"
                        onClick={() => onReschedule(item)}
                        disabled={submitting}
                        title="Reschedule"
                      >
                        <EventOutlinedIcon fontSize="medium" />
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
