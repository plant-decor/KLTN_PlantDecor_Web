'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ServiceRegistration } from '@/types/service.types';
import ServiceStatusChip from './ServiceStatusChip';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: ServiceRegistration) => React.ReactNode;
}

interface ServiceRequestTableProps {
  requests: ServiceRegistration[];
  onViewDetails?: (request: ServiceRegistration) => void;
  showStatus?: boolean;
  showCaretaker?: boolean;
  actionButtons?: (request: ServiceRegistration) => React.ReactNode;
  columns?: Column[];
}

export default function ServiceRequestTable({
  requests,
  onViewDetails,
  showStatus = true,
  showCaretaker = false,
  actionButtons,
  columns,
}: ServiceRequestTableProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const defaultColumns: Column[] = columns || [
    { id: 'id', label: 'ID', format: (value) => `#${value}` },
    {
      id: 'serviceDate',
      label: t('serviceDate'),
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'address',
      label: t('address'),
      maxWidth: 200,
      format: (value) => value,
    },
    { id: 'phone', label: t('phone') },
    ...(showStatus
      ? [
          {
            id: 'status',
            label: t('status'),
            format: (value: any) => <ServiceStatusChip status={value} />,
          },
        ]
      : []),
    ...(showCaretaker
      ? [
          {
            id: 'mainCaretakerId',
            label: t('caretaker'),
            format: (value: any) => (value ? `Caretaker #${value}` : '-'),
          },
        ]
      : []),
  ];

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            {defaultColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                sx={{ fontWeight: 'bold', minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
            {(onViewDetails || actionButtons) && (
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                {tCommon('action')}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} hover>
              {defaultColumns.map((column) => {
                const value = request[column.id as keyof ServiceRegistration];
                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      maxWidth: column.maxWidth,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {column.format
                      ? column.format(value, request)
                      : typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? '')}
                  </TableCell>
                );
              })}
              {(onViewDetails || actionButtons) && (
                <TableCell align="center">
                  {actionButtons ? (
                    actionButtons(request)
                  ) : onViewDetails ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onViewDetails(request)}
                    >
                      {tCommon('view')}
                    </Button>
                  ) : null}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
