'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import { getMyManagerNursery } from '@/lib/api/managerStoreCatalogService';
import type { ManagerNursery } from '@/types/manager-store-catalog.types';
import type { ResponseModel } from '@/types/api.types';
import CommonPlantTab from '@/components/manager-store-catalog/CommonPlantTab';
import ManagerPlantComboTab from '@/components/manager-store-catalog/ManagerPlantComboTab';
import PlantInstanceManagerTab from '@/components/manager-store-catalog/PlantInstanceManagerTab';
import ManagerMaterialTab from '@/components/store-management/MaterialTab';
import { CustomLoading } from '@/components/CustomLoading';

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`store-catalog-tabpanel-${index}`}>
      {value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null}
    </div>
  );
}

const getPayload = <T,>(response: ResponseModel<T>): T | undefined => {
  return response.payload ?? response.data;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function StoreCatalogPage() {
  const [tabValue, setTabValue] = useState(0);
  const [nursery, setNursery] = useState<ManagerNursery | null>(null);
  const [loadingNursery, setLoadingNursery] = useState(true);
  const [nurseryError, setNurseryError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNursery = async () => {
      setLoadingNursery(true);
      setNurseryError(null);

      try {
        const response = await getMyManagerNursery(true);
        const payload = getPayload(response);

        if (!mounted) {
          return;
        }

        if (!payload) {
          setNursery(null);
          setNurseryError('Could not load manager nursery data.');
          return;
        }

        setNursery(payload);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setNursery(null);
        setNurseryError(getErrorMessage(error, 'Failed to load manager nursery'));
      } finally {
        if (mounted) {
          setLoadingNursery(false);
        }
      }
    };

    void fetchNursery();

    return () => {
      mounted = false;
    };
  }, []);

  const nurserySummary = useMemo(() => {
    if (!nursery) {
      return null;
    }

    return {
      name: nursery.name,
      manager: nursery.managerName,
      address: nursery.address,
      totalPlants: nursery.totalPlants,
      totalMaterials: nursery.totalMaterials,
      isActive: nursery.isActive,
    };
  }, [nursery]);

  return (
    <Box sx={{ py: 3, minHeight: '100%' }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="primary">
          Catalog Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage core data for plants, combos, plant instances, and consumable materials
        </Typography>
      </Stack>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {loadingNursery ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CustomLoading size={18} />
            <Typography variant="body2" color="text.secondary">
              Loading nursery information...
            </Typography>
          </Stack>
        ) : nurserySummary ? (
          <Paper
            elevation={0}
            sx={{ border: '1px solid var(--card-border)', borderRadius: 2, p: 2, backgroundColor: 'var(--primary)' }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {nurserySummary.name}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Manager: {nurserySummary.manager}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {nurserySummary.address}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" fontWeight={650}>
                <Chip label={`Plants: ${nurserySummary.totalPlants}`} sx={{ bgcolor: '#ecfff3' }} />
                <Chip label={`Materials: ${nurserySummary.totalMaterials}`} sx={{ bgcolor: '#ecf7ff' }} />
                <Chip
                  label={nurserySummary.isActive ? 'Nursery Active' : 'Nursery Inactive'}
                  color={nurserySummary.isActive ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ bgcolor: "#ecfff3" }}
                />
              </Stack>
            </Stack>
          </Paper>
        ) : null}

        {nurseryError && <Alert severity="error">{nurseryError}</Alert>}
      </Stack>

      <Box className="w-full flex-col" sx={{mx: 'auto' }}>
        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
            '& .Mui-selected': { backgroundColor: 'var(--primary) !important', color: '#fff !important' },
          }}
        >
          <Tab icon={<ParkOutlinedIcon />} iconPosition="start" label="CommonPlant" />
          <Tab icon={<SpaOutlinedIcon />} iconPosition="start" label="PlantInstance" />
          <Tab icon={<WidgetsOutlinedIcon />} iconPosition="start" label="PlantCombo" />
          <Tab icon={<Inventory2OutlinedIcon />} iconPosition="start" label="Material" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TabPanel value={tabValue} index={0}>
            <CommonPlantTab nurseryId={nursery?.id ?? null} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PlantInstanceManagerTab nurseryId={nursery?.id ?? null} managerName={nursery?.managerName ?? ''} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <ManagerPlantComboTab />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <ManagerMaterialTab mode="manager" />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}

