'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration, ServiceRegistrationStatus } from '@/types/service.types';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ServiceRequestTable from '@/components/service/ServiceRequestTable';
import ServiceStatsCard from '@/components/service/ServiceStatsCard';
import ServiceDetailsDialog from '@/components/service/ServiceDetailsDialog';
import EmptyState from '@/components/service/EmptyState';



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
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MOCK_SERVICE_ORDERS: ServiceRegistration[] = [
  {
    id: 1,
    customerId: 1,
    servicePackageId: 1,
    address: '123 Flower Street, HCM',
    phone: '+84 901 234 567',
    serviceDate: '2025-03-10',
    note: 'Plant care service',
    status: ServiceRegistrationStatus.CONFIRMED,
    createdAt: '2025-03-05T08:00:00Z',
    updatedAt: '2025-03-05T10:00:00Z',
    mainCaretakerId: 1,
    estimatedDuration: 120,
  },
  {
    id: 2,
    customerId: 2,
    servicePackageId: 2,
    address: '456 Green Avenue, HCM',
    phone: '+84 912 345 678',
    serviceDate: '2025-03-08',
    note: 'Weekly care service',
    status: ServiceRegistrationStatus.IN_PROGRESS,
    createdAt: '2025-03-04T10:30:00Z',
    updatedAt: '2025-03-08T09:00:00Z',
    mainCaretakerId: 2,
    estimatedDuration: 90,
  },
  {
    id: 3,
    customerId: 3,
    servicePackageId: 1,
    address: '789 Plant Lane, HCM',
    phone: '+84 923 456 789',
    serviceDate: '2025-02-28',
    note: 'Monthly maintenance',
    status: ServiceRegistrationStatus.COMPLETED,
    createdAt: '2025-02-20T11:00:00Z',
    updatedAt: '2025-02-28T15:30:00Z',
    mainCaretakerId: 1,
    estimatedDuration: 80,
  },
  {
    id: 4,
    customerId: 4,
    servicePackageId: 2,
    address: '321 Leaf Court, HCM',
    phone: '+84 934 567 890',
    serviceDate: '2025-03-02',
    note: 'Service cancelled due to customer request',
    status: ServiceRegistrationStatus.CANCELLED,
    cancelReason: 'Customer requested cancellation',
    createdAt: '2025-02-25T09:00:00Z',
    updatedAt: '2025-03-02T14:00:00Z',
    mainCaretakerId: 2,
    estimatedDuration: 100,
  },
];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function ManagerServiceOrdersPage({ params }: PageProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<ServiceRegistration[]>(MOCK_SERVICE_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<ServiceRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ServiceRegistrationStatus | 'ALL'>('ALL');
  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === ServiceRegistrationStatus.CONFIRMED).length,
    inProgress: orders.filter((o) => o.status === ServiceRegistrationStatus.IN_PROGRESS).length,
    completed: orders.filter((o) => o.status === ServiceRegistrationStatus.COMPLETED).length,
    cancelled: orders.filter((o) => o.status === ServiceRegistrationStatus.CANCELLED).length,
  };

  const filteredOrders =
    filterStatus === 'ALL'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (order: ServiceRegistration) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('serviceOrders')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Total: {stats.total} orders
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={2} className="w-full flex-wrap justify-around justify-self-stretch">
          <Grid className="animate__animated animate__fadeInUp" size={{ xs: 12, sm: 6, md: 2.4, lg:2.5 }}>
            <ServiceStatsCard
              icon={<AssignmentIcon />}
              value={stats.confirmed}
              label={t('confirmed')}
              iconColor="var(--primary)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <ServiceStatsCard
              icon={<TrendingUpIcon />}
              value={stats.inProgress}
              label={t('inProgress')}
              iconColor="#0288d1"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <ServiceStatsCard
              icon={<SummarizeIcon />}
              value={stats.completed}
              label={t('completed')}
              iconColor="#2e7d32"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <ServiceStatsCard
              icon={<VisibilityIcon />}
              value={stats.cancelled}
              label={t('cancelled')}
              iconColor="#d32f2f"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Orders" />
          <Tab label={`${t('confirmed')} (${stats.confirmed})`} />
          <Tab label={`${t('inProgress')} (${stats.inProgress})`} />
          <Tab label={`${t('completed')} (${stats.completed})`} />
        </Tabs>
      </Box>

      {/* Service Orders Table */}
      <TabPanel value={tabValue} index={0}>
        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            label="Filter by Status"
          >
            <MenuItem value="ALL">All Orders</MenuItem>
            <MenuItem value={ServiceRegistrationStatus.CONFIRMED}>{t('confirmed')}</MenuItem>
            <MenuItem value={ServiceRegistrationStatus.IN_PROGRESS}>{t('inProgress')}</MenuItem>
            <MenuItem value={ServiceRegistrationStatus.COMPLETED}>{t('completed')}</MenuItem>
            <MenuItem value={ServiceRegistrationStatus.CANCELLED}>{t('cancelled')}</MenuItem>
          </Select>
        </FormControl>

        {filteredOrders.length > 0 ? (
          <ServiceRequestTable
            requests={filteredOrders}
            onViewDetails={handleViewDetails}
            showStatus={true}
            showCaretaker={true}
          />
        ) : (
          <EmptyState
            icon={<AssignmentIcon />}
            title="No service orders found"
          />
        )}
      </TabPanel>

      {/* Tab panels for filtered views */}
      {[ServiceRegistrationStatus.CONFIRMED, ServiceRegistrationStatus.IN_PROGRESS, ServiceRegistrationStatus.COMPLETED].map(
        (status, index) => (
          <TabPanel key={status} value={tabValue} index={index + 1}>
            {orders.filter((o) => o.status === status).length > 0 ? (
              <ServiceRequestTable
                requests={orders.filter((o) => o.status === status)}
                onViewDetails={handleViewDetails}
                showStatus={false}
                showCaretaker={true}
              />
            ) : (
              <EmptyState
                icon={<AssignmentIcon />}
                title="No orders with this status"
              />
            )}
          </TabPanel>
        )
      )}

      {/* Order Details Dialog */}
      <ServiceDetailsDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        service={selectedOrder}
      />
    </Box>
  );
}
