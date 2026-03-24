'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { LocalFlorist, DonutSmall, Inventory2, Spa } from '@mui/icons-material';
import PlantTab from './PlantTab';
import PlantComboTab from './PlantComboTab';
import PlantInstanceTab from './PlantInstanceTab';
import MaterialTab from './MaterialTab';
import type { Plant, PlantCombo, PlantInstance, Material } from '@/types/store-management.types';

interface StoreManagementPageClientProps {
  initialPlants?: Plant[];
  initialCombos?: PlantCombo[];
  initialInstances?: PlantInstance[];
  initialMaterials?: Material[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default function StoreManagementPageClient({
  initialPlants = [],
  initialCombos = [],
  initialInstances = [],
  initialMaterials = [],
}: StoreManagementPageClientProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="700" color="primary">
            Quản Lý Cửa Hàng
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý dữ liệu chính của cây, combo, mẫu cây và vật tư tiêu hao
          </Typography>
        </Stack>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="store management tabs"
            sx={{
              backgroundColor: '#fff',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              label="Cây"
              icon={<LocalFlorist sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Combo"
              icon={<DonutSmall sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Mẫu Cây"
              icon={<Spa sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="Vật Tư"
              icon={<Inventory2 sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(3)}
            />
          </Tabs>

          <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <TabPanel value={tabValue} index={0}>
              <PlantTab initialPlants={initialPlants} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <PlantComboTab initialCombos={initialCombos} />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <PlantInstanceTab initialInstances={initialInstances} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <MaterialTab initialMaterials={initialMaterials} />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
