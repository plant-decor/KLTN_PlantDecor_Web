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
          backgroundColor: 'white',
          px: 2,
        }}
      >
        <Tab label="Dashboard Kinh Doanh" />
        <Tab label="Dashboard Hệ Thống" />
      </Tabs>
      <Box>
        {currentTab === 0 && <AdminBusinessDashboard />}
        {currentTab === 1 && <AdminSystemDashboard />}
      </Box>
    </Box>
  );
}
