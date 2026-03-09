'use client';

import { Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card sx={{ textAlign: 'center', py: 6, boxShadow: 2 }}>
      <CardContent>
        <div style={{ fontSize: 60, color: '#9e9e9e', marginBottom: 16 }}>
          {icon}
        </div>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
