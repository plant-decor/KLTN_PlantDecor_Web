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
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
      >
        <Tab label="Store Metrics" />`r`n        <Tab label="Operations" />
      </Tabs>
      <Box>
        {currentTab === 0 && <ManagerStoreMetricsDashboard />}
        {currentTab === 1 && <ManagerStoreOperationsDashboard />}
      </Box>
    </Box>
  );
}

