'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { submitServiceRating } from '@/lib/api/serviceRatingService';
import { toast } from 'react-toastify';

interface ServiceRatingSubmitDialogProps {
  open: boolean;
  registrationId: number | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ServiceRatingSubmitDialog({
  open,
  registrationId,
  onClose,
  onSubmitted,
}: ServiceRatingSubmitDialogProps) {
  const [ratingValue, setRatingValue] = useState<number | null>(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRatingValue(5);
      setDescription('');
    }
  }, [open]);

  const handleClose = () => {
    if (submitting) return;
    setRatingValue(5);
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!registrationId || ratingValue == null || ratingValue < 1) {
      toast.error('Please select a rating (1–5 stars).');
      return;
    }

    try {
      setSubmitting(true);
      await submitServiceRating(
        {
          serviceRegistrationId: registrationId,
          rating: ratingValue,
          description: description.trim(),
        },
        false
      );
      toast.success('Rating submitted successfully');
      onSubmitted();
      handleClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rate this service</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Share how your completed service went (1–5 stars).
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography component="span" variant="body2">
              Your rating
            </Typography>
            <Rating
              name="service-rating"
              value={ratingValue}
              onChange={(_, value) => setRatingValue(value)}
              size="large"
            />
          </Stack>
          <TextField
            label="Comment"
            placeholder="Optional feedback"
            multiline
            minRows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={submitting}>
          Submit rating
        </Button>
      </DialogActions>
    </Dialog>
  );
}
