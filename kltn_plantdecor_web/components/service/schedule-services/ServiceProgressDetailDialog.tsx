'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { ServiceProgressDetail } from '@/types/care-service.types';

interface ServiceProgressDetailDialogProps {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: ServiceProgressDetail | null;
  onClose: () => void;
}

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

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography variant='body2' fontWeight={500}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export default function ServiceProgressDetailDialog({
  open,
  loading,
  error,
  detail,
  onClose,
}: ServiceProgressDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Chi tiết phiên chăm sóc #{detail?.id || '-'}
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && <Typography>Đang tải chi tiết...</Typography>}

        {!loading && error && <Alert severity='error'>{error}</Alert>}

        {!loading && !error && detail && (
          <Stack spacing={2}>
            <DetailRow label='Ngày thực hiện' value={formatDateForDisplay(detail.taskDate)} />
            <DetailRow
              label='Ca làm'
              value={detail.shift ? `${detail.shift.shiftName} (${detail.shift.startTime} - ${detail.shift.endTime})` : '-'}
            />
            <DetailRow label='Trạng thái' value={detail.statusName || '-'} />
            <DetailRow label='Bắt đầu thực tế' value={detail.actualStartTime || '-'} />
            <DetailRow label='Kết thúc thực tế' value={detail.actualEndTime || '-'} />
            <DetailRow label='Mô tả công việc' value={detail.description || '-'} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle1' fontWeight={700}>
              Thông tin khách hàng
            </Typography>
            <DetailRow label='Khách hàng' value={detail.serviceRegistration?.customer?.fullName || '-'} />
            <DetailRow label='Email' value={detail.serviceRegistration?.customer?.email || '-'} />
            <DetailRow label='Điện thoại' value={detail.serviceRegistration?.phone || '-'} />
            <DetailRow label='Địa chỉ chăm sóc' value={detail.serviceRegistration?.address || '-'} />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle1' fontWeight={700}>
              Thông tin dịch vụ
            </Typography>
            <DetailRow
              label='Gói dịch vụ'
              value={detail.serviceRegistration?.nurseryCareService.careServicePackage.name || '-'}
            />
            <DetailRow label='Vựa phụ trách' value={detail.serviceRegistration?.nurseryCareService.nurseryName || '-'} />
            <DetailRow label='Caretaker hiện tại' value={detail.caretaker?.fullName || 'Chưa phân công'} />

            {detail.evidenceImageUrl && (
              <Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 0.75 }}>
                  Ảnh minh chứng
                </Typography>
                <Box
                  component='img'
                  src={detail.evidenceImageUrl}
                  alt='Ảnh minh chứng'
                  sx={{ width: '100%', maxHeight: 260, borderRadius: 2, objectFit: 'cover' }}
                />
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
