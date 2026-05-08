"use client";

import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import ManagementHeader from "@/components/layout/ManagementHeader";
import TabPanel from "@/components/admin/categories-tags/TabPanel";
import DepositPolicySection from "@/components/admin/setting/deposit-policy/DepositPolicySection";
import PolicyContentSection from "@/components/admin/setting/policy-content/PolicyContentSection";

export default function AdminSettingPageClient() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <ManagementHeader
          title="Settings"
          description="Manage system settings for the admin panel."
          entityLabel="Settings"
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
          }}
          >
          <Tab label="Deposit Policy" />
          <Tab label="Policy Content" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <DepositPolicySection />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <PolicyContentSection />
      </TabPanel>
    </Box>
  );
}

