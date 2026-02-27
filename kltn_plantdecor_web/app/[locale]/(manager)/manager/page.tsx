'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ManagerStoreMetricsDashboard from '@/components/dashboard/ManagerStoreMetricsDashboard';
import ManagerStoreOperationsDashboard from '@/components/dashboard/ManagerStoreOperationsDashboard';

export default function ManagerDashboardPage() {
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
        <Tab label="Thống Kê Chi Nhánh" />
        <Tab label="Vận Hành" />
      </Tabs>
      <Box>
        {currentTab === 0 && <ManagerStoreMetricsDashboard />}
        {currentTab === 1 && <ManagerStoreOperationsDashboard />}
      </Box>
    </Box>
  );
}
