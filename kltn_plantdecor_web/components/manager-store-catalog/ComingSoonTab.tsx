'use client';

import { Box, Paper, Typography } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';

interface ComingSoonTabProps {
  title: string;
  description: string;
}

export default function ComingSoonTab({ title, description }: ComingSoonTabProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid var(--card-border)',
        borderRadius: 2,
        p: 4,
        backgroundColor: 'var(--card)',
      }}
    >
      <Box className="flex flex-col items-center justify-center text-center gap-3 py-8">
        <ConstructionOutlinedIcon sx={{ color: 'var(--warning)', fontSize: 48 }} />
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}
