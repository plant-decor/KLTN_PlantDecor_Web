'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import AdminBusinessDashboard from '@/components/dashboard/AdminBusinessDashboard';
import AdminSystemDashboard from '@/components/dashboard/AdminSystemDashboard';

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
      >
        <Tab label="Business Dashboard" />`r`n        <Tab label="System Dashboard" />
      </Tabs>
      <Box>
        {currentTab === 0 && <AdminBusinessDashboard />}
        {currentTab === 1 && <AdminSystemDashboard />}
      </Box>
    </Box>
  );
}

