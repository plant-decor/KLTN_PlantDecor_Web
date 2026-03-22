'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Chip } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface DashboardStatProps {
  icon: React.JSX.Element;
  label: string;
  value: number | string;
  color?: string;
}

function DashboardStat({ icon, label, value, color = 'primary' }: DashboardStatProps) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ConsultantDashboard() {
  return (
    <Box sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Consultant Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System consultation staff - supporting customers through live chat and product inquiries
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStat
            icon={<MessageIcon sx={{ fontSize: 40 }} />}
            label="Active Chats"
            value={5}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStat
            icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
            label="Order Inquiries"
            value={12}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStat
            icon={<StorageIcon sx={{ fontSize: 40 }} />}
            label="Inventory Checks"
            value={8}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStat
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            label="Total Consultations"
            value="152"
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Features Overview */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Chat Support"
              subheader="Live customer consultation"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide real-time support to customers when AI chat is escalated to human staff.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Real-time" size="small" variant="outlined" />
                <Chip label="Support" size="small" variant="outlined" />
                <Chip label="Customer-facing" size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Read-Only Access"
              subheader="View customer and product information"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                View customer orders, product information, and inventory status to assist with inquiries.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Orders" size="small" variant="outlined" />
                <Chip label="Products" size="small" variant="outlined" />
                <Chip label="Inventory" size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Info */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Consultant Responsibilities
        </Typography>
        <Typography variant="body2" component="div" color="text.secondary" paragraph>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Handle live chat escalations from AI support</li>
            <li>Provide product and service recommendations</li>
            <li>Answer inventory and availability questions</li>
            <li>Assist with order inquiries (view-only)</li>
            <li>Support customer decision-making process</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}
