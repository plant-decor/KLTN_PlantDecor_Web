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
import type { ManagerServiceRegistration, ServiceRegistrationStatusEnum } from '@/types/care-service.types';
import {
  STATUS_CHIP_COLOR,
  STATUS_LABELS,
  canApproveOrReject,
  canAssignCaretaker,
  canManagerCancel,
  formatCurrency,
  formatDate,
} from './managerServiceOrders.constants';

interface ServiceOrdersTableProps {
  items: ManagerServiceRegistration[];
  submitting: boolean;
  onViewDetail: (id: number) => void;
  onApprove: (item: ManagerServiceRegistration) => void;
  onReject: (item: ManagerServiceRegistration) => void;
  onCancel: (item: ManagerServiceRegistration) => void;
  onAssignCaretaker: (item: ManagerServiceRegistration) => void;
}

export default function ServiceOrdersTable({
  items,
  submitting,
  onViewDetail,
  onApprove,
  onReject,
  onCancel,
  onAssignCaretaker,
}: ServiceOrdersTableProps) {
  return (
    <Table size="small">
      <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Mã đơn</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Khách hàng</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Gói dịch vụ</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Ngày dịch vụ</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Liên hệ</TableCell>
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Trạng thái
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Caretaker chính
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }} align="center">
            Hành động
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
              Không có đơn dịch vụ nào.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const typedStatus = item.status as ServiceRegistrationStatusEnum;

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
                <TableCell>
                  <Typography variant="body2">{item.phone || '-'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.address || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    color={STATUS_CHIP_COLOR[typedStatus] || 'default'}
                    label={STATUS_LABELS[typedStatus] || item.statusName || `#${item.status}`}
                  />
                </TableCell>
                <TableCell align="center">{item.mainCaretaker?.fullName || '-'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onViewDetail(item.id)}
                    >
                      <VisibilityIcon />
                    </Button>
                    {canApproveOrReject(item.status) && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => onApprove(item)}
                        disabled={submitting}
                      >
                        <CheckCircleOutlineIcon />
                      </Button>
                    )}
                    {canApproveOrReject(item.status) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onReject(item)}
                        disabled={submitting}
                      >
                            <CancelOutlinedIcon />
                      </Button>
                    )}
                    {canManagerCancel(item.status) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onCancel(item)}
                        disabled={submitting}
                      >
                        <CancelOutlinedIcon />

                      </Button>
                    )}
                    {canAssignCaretaker(item.status) && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onAssignCaretaker(item)}
                        disabled={submitting}
                      >
                        <PersonAddAltOutlinedIcon />
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
