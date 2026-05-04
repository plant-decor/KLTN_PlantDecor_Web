'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { AdminUser } from '@/types/admin-user.types';
import { formatRoleLabel, mapApiUserStatusToUi } from '@/lib/user-management/helpers';
import { formatDateTime } from '@/lib/utils/dateUtils';
import { CustomLoading } from '../CustomLoading';

interface UserDetailDialogProps {
  open: boolean;
  user: AdminUser | null;
  loading: boolean;
  saving: boolean;
  onClose: () => void;
  onToggleActive: () => void;
}

export default function UserDetailDialog({
  open,
  user,
  loading,
  saving,
  onClose,
  onToggleActive,
}: UserDetailDialogProps) {
  const uiStatus = user ? mapApiUserStatusToUi(user.status) : 'active';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          User details
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CustomLoading size={32} />
          </Box>
        ) : user ? (
          <Stack spacing={1.5}>
            <DetailRow label="ID" value={String(user.id)} />
            <DetailRow label="Username" value={user.username} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phoneNumber} />
            <DetailRow label="Role" value={formatRoleLabel(user.role)} />
            <DetailRow label="Status" value={formatRoleLabel(uiStatus)} />
            <DetailRow
              label="Verified"
              value={user.isVerified ? 'Yes' : 'No'}
            />
            {user.nurseryName != null && user.nurseryName !== '' && (
              <DetailRow label="Nursery" value={user.nurseryName} />
            )}
            <Divider sx={{ my: 1 }} />
            <DetailRow label="Created at" value={formatDateTime(user.createdAt)} />
            <DetailRow label="Updated at" value={formatDateTime(user.updatedAt)} />
          </Stack>
        ) : (
          <Typography color="text.secondary">No data.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={onToggleActive}
          disabled={!user || loading || saving}
          className="bg-primary!"
        >
          {saving ? 'Updating…' : uiStatus === 'active' ? 'Deactivate user' : 'Activate user'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}
