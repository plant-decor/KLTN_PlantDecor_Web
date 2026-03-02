'use client';

/**
 * Real-time Dashboard Notifications Panel
 * Hiển thị real-time updates cho dashboard (orders, tasks, inventory, etc.)
 * Dành cho Admin, Manager, Staff
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart,
  Assignment,
  Inventory,
  TrendingUp,
  CheckCircle,
  Refresh,
  Close,
} from '@mui/icons-material';
import { useDashboardUpdates } from '@/hooks/useSignalR';
import { formatDistanceToNow } from '@/lib/utils/dateUtils';

interface DashboardNotificationPanelProps {
  maxItems?: number;
  showOnlyRecent?: boolean; // Chỉ hiển thị updates trong 1 giờ qua
}

export function DashboardNotificationPanel({ 
  maxItems = 10,
  showOnlyRecent = true 
}: DashboardNotificationPanelProps) {
  const { updates, clearUpdates } = useDashboardUpdates();
  const [displayUpdates, setDisplayUpdates] = useState<any[]>([]);

  useEffect(() => {
    let filtered = updates;

    // Filter recent only (last 1 hour)
    if (showOnlyRecent) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      filtered = updates.filter((update) => {
        const updateTime = new Date(update.timestamp);
        return updateTime > oneHourAgo;
      });
    }

    // Limit items
    setDisplayUpdates(filtered.slice(0, maxItems));
  }, [updates, maxItems, showOnlyRecent]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'newOrder':
        return <ShoppingCart color="primary" />;
      case 'orderStatus':
        return <TrendingUp color="info" />;
      case 'inventory':
        return <Inventory color="warning" />;
      case 'taskAssigned':
        return <Assignment color="secondary" />;
      case 'taskCompleted':
        return <CheckCircle color="success" />;
      default:
        return <TrendingUp />;
    }
  };

  const getUpdateLabel = (type: string) => {
    switch (type) {
      case 'newOrder':
        return 'New Order';
      case 'orderStatus':
        return 'Order Update';
      case 'inventory':
        return 'Inventory Alert';
      case 'taskAssigned':
        return 'Task Assigned';
      case 'taskCompleted':
        return 'Task Completed';
      default:
        return 'Update';
    }
  };

  const getUpdateColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'newOrder':
        return 'primary';
      case 'orderStatus':
        return 'info';
      case 'inventory':
        return 'warning';
      case 'taskAssigned':
        return 'secondary';
      case 'taskCompleted':
        return 'success';
      default:
        return 'default';
    }
  };

  if (displayUpdates.length === 0) {
    return null; // Don't show panel if no updates
  }

  return (
    <Card 
      sx={{ 
        mb: 3,
        borderLeft: 4,
        borderLeftColor: 'primary.main',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Real-time Updates
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => window.location.reload()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear all">
              <IconButton size="small" onClick={clearUpdates}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <List dense>
          {displayUpdates.map((update, index) => (
            <ListItem
              key={index}
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 1,
                '&:last-child': { mb: 0 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getUpdateIcon(update.type)}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {update.data?.title || getUpdateLabel(update.type)}
                    </Typography>
                    <Chip 
                      label={getUpdateLabel(update.type)} 
                      size="small" 
                      color={getUpdateColor(update.type)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" component="span" display="block">
                      {update.data?.message || JSON.stringify(update.data).slice(0, 50)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(update.timestamp)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
