'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface NoQuotaModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NoQuotaModal({ open, onClose }: NoQuotaModalProps) {
  const locale = useLocale();
  const router = useRouter();

  const handleViewPackages = () => {
    router.push(`/${locale}/ai-packages`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>AI Quota Exhausted</DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          You have no remaining AI quota for this month. Purchase a package to continue using AI plant
          recommendations.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" className="bg-primary!" onClick={handleViewPackages}>
          View Packages
        </Button>
      </DialogActions>
    </Dialog>
  );
}
