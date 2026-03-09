'use client';

import { Alert } from '@mui/material';

interface MessageAlertProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClose: () => void;
}

export default function MessageAlert({ message, onClose }: MessageAlertProps) {
  if (!message) return null;

  return (
    <Alert severity={message.type} sx={{ mb: 3 }} onClose={onClose}>
      {message.text}
    </Alert>
  );
}
