'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  existingFeedback?: string | null;
  onSubmit?: (comment: string) => Promise<void>;
}

export default function FeedbackModal({ open, onClose, title, existingFeedback, onSubmit }: FeedbackModalProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isViewOnly = Boolean(existingFeedback) || !onSubmit;

  const handleClose = () => {
    if (submitting) return;
    setText('');
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || !onSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit(trimmed);
      setText('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChatBubbleOutlineIcon fontSize="small" />
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {isViewOnly ? (
          <Box sx={{ p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="body2" color="info.dark" fontWeight={600} sx={{ mb: 0.5 }}>
              {onSubmit ? 'Your Feedback' : 'Customer Feedback'}
            </Typography>
            <Typography variant="body2">
              {existingFeedback}
            </Typography>
          </Box>
        ) : (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            placeholder="Share your feedback..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Close
        </Button>
        {!isViewOnly && (
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={submitting || !text.trim()}
            sx={{ backgroundColor: 'var(--primary)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
