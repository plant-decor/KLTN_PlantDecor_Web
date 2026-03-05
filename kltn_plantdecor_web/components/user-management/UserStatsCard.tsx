'use client';

import { Card, CardContent, Grid, Typography } from '@mui/material';

interface StatCard {
  label: string;
  value: number;
  color: string;
}

interface UserStatsCardProps {
  stats: StatCard[];
}

export default function UserStatsCard({ stats }: UserStatsCardProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card>
            <CardContent sx={{ pb: '16px !important' }}>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {stat.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: stat.color }}
              >
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
