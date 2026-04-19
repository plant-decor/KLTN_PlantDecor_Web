'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { LocalFlorist, DonutSmall, Inventory2 } from '@mui/icons-material';
import PlantTab from './PlantTab';
import PlantComboTab from './PlantComboTab';
import MaterialTab from './MaterialTab';
import type { Plant, PlantCombo, PlantInstance, Material } from '@/types/store-management.types';
import ManagementHeader from '../layout/ManagementHeader';

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
  // initialInstances = [],
  initialMaterials = [],
}: StoreManagementPageClientProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 4 }}>
        {/* Header */}
        <ManagementHeader
          title="Store Management"
          description="Manage the main data of plants, combos, plant instances, and consumable materials."
          entityLabel="packages"
                // count={packages.length}
                actionLabel="Create New"
                // onAction={openCreateModal}
              />

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
              label="Plants"
              icon={<LocalFlorist sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Combos"
              icon={<DonutSmall sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            {/* <Tab
              label="Cây Bán Lẻ"
              icon={<Spa sx={{ mr: 1 }} />}
              iconPosition="start"
              {...a11yProps(2)}
            /> */}
            <Tab
              label="Materials"
              value={3}
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

            {/* <TabPanel value={tabValue} index={2}>
              <PlantInstanceTab initialInstances={initialInstances} />
            </TabPanel> */}

            <TabPanel value={tabValue} index={3}>
              <MaterialTab initialMaterials={initialMaterials} mode="admin" />
            </TabPanel>
          </Box>
        </Paper>
    </Box>
  );
}
