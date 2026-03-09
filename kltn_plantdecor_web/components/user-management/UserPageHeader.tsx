'use client';

import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';

interface UserPageHeaderProps {
  onAddNewClick: () => void;
}

export default function UserPageHeader({ onAddNewClick }: UserPageHeaderProps) {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon sx={{ fontSize: 32, color: '#1976d2' }} />
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddNewClick}
        sx={{ textTransform: 'none', fontSize: 15 }}
      >
        Add New User
      </Button>
    </Box>
  );
}
