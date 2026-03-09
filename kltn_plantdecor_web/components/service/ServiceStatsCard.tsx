'use client';

import { Card, CardContent, Typography, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface ServiceStatsCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  iconColor?: string;
  sx?: SxProps<Theme>;
}

export default function ServiceStatsCard({
  icon,
  value,
  label,
  iconColor = 'primary.main',
  sx,
}: ServiceStatsCardProps) {
  return (
    <Card className='justify-self-stretch!' sx={{ boxShadow: 2, ...sx }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, color: iconColor, marginBottom: 8 }}>
          {icon}
        </div>
        <Typography variant="h6" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
