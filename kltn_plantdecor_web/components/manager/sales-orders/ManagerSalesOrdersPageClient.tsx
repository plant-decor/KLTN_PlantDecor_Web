'use client';

import { useMemo, useState, type ReactNode, type SyntheticEvent } from 'react';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import ManagerReturnTicketManagementPageClient from '@/components/manager/return-ticket-management/ManagerReturnTicketManagementPageClient';
import ManagerSalesOrdersTabContent from './ManagerSalesOrdersTabContent';
import ManagementHeader from '@/components/layout/ManagementHeader';

const SALES_TAB = 0;
const RETURN_TAB = 1;

interface TabPanelProps {
  children: ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`manager-sales-orders-tabpanel-${index}`}>
      {value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null}
    </div>
  );
}

export default function ManagerSalesOrdersPageClient() {
  const [activeTab, setActiveTab] = useState<number>(SALES_TAB);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([SALES_TAB]));
  const [pendingReturnAssignmentsBadge, setPendingReturnAssignmentsBadge] = useState<number>(0);

  const handleChangeTab = (_event: SyntheticEvent, nextTab: number) => {
    setActiveTab(nextTab);
    setVisitedTabs((prev) => {
      if (prev.has(nextTab)) {
        return prev;
      }

      return new Set([...prev, nextTab]);
    });
  };

  const shouldMountSalesTab = useMemo(() => visitedTabs.has(SALES_TAB), [visitedTabs]);
  const shouldMountReturnTab = useMemo(() => visitedTabs.has(RETURN_TAB), [visitedTabs]);

  return (
    <Box >
      <ManagementHeader
        title="Sales Orders"
        description="Review and process assigned return tickets"
        entityLabel="sales orders"
      />
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
          '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
        }}
      >
        <Tab label="Sales Orders" />
        <Tab
          label={
            <Badge
              color="error"
              badgeContent={pendingReturnAssignmentsBadge}
              invisible={pendingReturnAssignmentsBadge <= 0}
            >
              Return Tickets
            </Badge>
          }
        />
      </Tabs>

      <TabPanel value={activeTab} index={SALES_TAB}>
        {shouldMountSalesTab ? <ManagerSalesOrdersTabContent /> : null}
      </TabPanel>

      <TabPanel value={activeTab} index={RETURN_TAB}>
        {shouldMountReturnTab ? (
          <ManagerReturnTicketManagementPageClient
            onPendingBadgeLoaded={(count) => setPendingReturnAssignmentsBadge(count)}
            onRefundCompleted={(count) => setPendingReturnAssignmentsBadge(count)}
          />
        ) : null}
      </TabPanel>
    </Box>
  );
}
