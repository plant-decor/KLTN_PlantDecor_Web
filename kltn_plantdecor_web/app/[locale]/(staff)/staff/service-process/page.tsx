'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Grid,
  ImageList,
  ImageListItem,
  Divider,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { useTranslations } from 'next-intl';
import { ServiceRegistration, ServiceRegistrationStatus, ServiceProgress, ServiceProgressAction } from '@/types/service.types';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FolderIcon from '@mui/icons-material/Folder';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const MOCK_SERVICES: ServiceRegistration[] = [
  {
    id: 1,
    customerId: 1,
    servicePackageId: 1,
    address: '123 Flower Street, HCM',
    phone: '+84 901 234 567',
    serviceDate: '2025-03-08',
    note: 'Plant is showing signs of disease',
    status: ServiceRegistrationStatus.IN_PROGRESS,
    createdAt: '2025-03-05T08:00:00Z',
    updatedAt: '2025-03-08T09:30:00Z',
    mainCaretakerId: 1,
    estimatedDuration: 120,
  },
  {
    id: 2,
    customerId: 2,
    servicePackageId: 2,
    address: '456 Green Avenue, HCM',
    phone: '+84 912 345 678',
    serviceDate: '2025-03-09',
    note: 'Weekly care service',
    status: ServiceRegistrationStatus.IN_PROGRESS,
    createdAt: '2025-03-04T10:30:00Z',
    updatedAt: '2025-03-09T10:00:00Z',
    mainCaretakerId: 2,
    estimatedDuration: 90,
  },
];

const MOCK_PROGRESS: ServiceProgress[] = [
  {
    id: 1,
    serviceRegistrationId: 1,
    caretakerId: 1,
    action: ServiceProgressAction.CHECK_IN,
    description: 'Arrived at customer location, checking plant condition',
    actualStartTime: '2025-03-08T09:00:00Z',
    createdAt: '2025-03-08T09:00:00Z',
    updatedAt: '2025-03-08T09:00:00Z',
  },
  {
    id: 2,
    serviceRegistrationId: 1,
    caretakerId: 1,
    action: ServiceProgressAction.SURVEY,
    description: 'Examined plant thoroughly. Found evidence of root rot and fungal infection. Recommended repotting and fungicide treatment.',
    createdAt: '2025-03-08T09:15:00Z',
    updatedAt: '2025-03-08T09:15:00Z',
  },
  {
    id: 3,
    serviceRegistrationId: 1,
    caretakerId: 1,
    action: ServiceProgressAction.WORK_IN_PROGRESS,
    description: 'Started treatment process - removed affected parts, changed potting soil, applied fungicide',
    createdAt: '2025-03-08T09:30:00Z',
    updatedAt: '2025-03-08T09:30:00Z',
  },
  {
    id: 4,
    serviceRegistrationId: 1,
    caretakerId: 1,
    action: ServiceProgressAction.PHOTO_EVIDENCE,
    description: 'Took before and after photos of the plant treatment',
    evidenceImageUrl: 'https://via.placeholder.com/300x200?text=Plant+Treatment',
    createdAt: '2025-03-08T10:00:00Z',
    updatedAt: '2025-03-08T10:00:00Z',
  },
];

const MOCK_ADDONS = [
  {
    id: 1,
    serviceRegistrationId: 1,
    name: 'Premium Fertilizer Treatment',
    description: 'High-quality organic fertilizer for plant recovery',
    price: 150000,
    quantity: 1,
    status: 'PROPOSED' as const,
    createdAt: '2025-03-08T10:15:00Z',
    updatedAt: '2025-03-08T10:15:00Z',
  },
  {
    id: 2,
    serviceRegistrationId: 1,
    name: 'Follow-up Care Package',
    description: 'Weekly monitoring and care for next 4 weeks',
    price: 400000,
    quantity: 1,
    status: 'PROPOSED' as const,
    createdAt: '2025-03-08T10:30:00Z',
    updatedAt: '2025-03-08T10:30:00Z',
  },
];

const getProgressSteps = (t: any) => [
  { label: t('checkIn'), action: ServiceProgressAction.CHECK_IN },
  { label: t('survey'), action: ServiceProgressAction.SURVEY },
  { label: t('workInProgress'), action: ServiceProgressAction.WORK_IN_PROGRESS },
  { label: t('photoEvidence'), action: ServiceProgressAction.PHOTO_EVIDENCE },
  { label: t('checkout'), action: ServiceProgressAction.CHECK_OUT },
];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function StaffServiceProcessPage({ params }: PageProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const [services, setServices] = useState<ServiceRegistration[]>(MOCK_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [progressLogs] = useState<ServiceProgress[]>(MOCK_PROGRESS);
  const [addOns] = useState<any[]>(MOCK_ADDONS);

  const handleViewDetails = (service: ServiceRegistration) => {
    setSelectedService(service);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedService(null);
  };

  const handleApproveAddOn = (addonId: number) => {
    console.log('Approving add-on:', addonId);
    alert('Add-on approved!');
  };

  const handleDeclineAddOn = (addonId: number) => {
    console.log('Declining add-on:', addonId);
    alert('Add-on declined!');
  };

  const progressSteps = getProgressSteps(t);
  const currentStepIndex = selectedService
    ? progressSteps.findIndex((step) =>
        progressLogs.some((log) => log.serviceRegistrationId === selectedService.id && log.action === step.action)
      )
    : 0;

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('serviceProcess')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('viewProgress')} - {services.length} in-progress service(s)
        </Typography>
      </Box>

      {/* In-Progress Services Table */}
      {services.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 4 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('serviceDate')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('address')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('caretaker')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('status')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  {tCommon('action')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>#{service.id}</TableCell>
                  <TableCell>{new Date(service.serviceDate).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {service.address}
                  </TableCell>
                  <TableCell>
                    Caretaker #{service.mainCaretakerId}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t('inProgress')}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ManageSearchIcon />}
                      onClick={() => handleViewDetails(service)}
                    >
                      {tCommon('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ textAlign: 'center', py: 6, boxShadow: 2, mb: 4 }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('noProcess')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Service Details Dialog */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('serviceProcess')} - Request #{selectedService?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedService && (
            <Box>
              {/* Service Info */}
              <Box sx={{ mb: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('address')}
                    </Typography>
                    <Typography variant="body2">{selectedService.address}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('serviceDate')}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedService.serviceDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('phone')}
                    </Typography>
                    <Typography variant="body2">{selectedService.phone}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('estimatedDuration')}
                    </Typography>
                    <Typography variant="body2">
                      {selectedService.estimatedDuration} {t('minEstimatedDuration')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Progress Timeline */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                {t('progressTimeline')}
              </Typography>

              <Stepper activeStep={currentStepIndex} orientation="vertical" sx={{ mb: 4 }}>
                {progressSteps.map((step, index) => (
                  <Step key={index} completed={index <= currentStepIndex}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Activity Timeline */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, mt: 3 }}>
                {t('activityLog')}
              </Typography>

              <Timeline sx={{ mb: 4 }}>
                {progressLogs
                  .filter((log) => log.serviceRegistrationId === selectedService.id)
                  .map((log, index) => (
                    <TimelineItem key={log.id}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" variant="outlined">
                          <CheckCircleOutlineIcon fontSize="small" />
                        </TimelineDot>
                        {index < progressLogs.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {progressSteps.find((s) => s.action === log.action)?.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {log.description}
                        </Typography>
                        {log.evidenceImageUrl && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                              {t('images')}:
                            </Typography>
                            <ImageList cols={1} rowHeight={200}>
                              <ImageListItem>
                                <img
                                  src={log.evidenceImageUrl}
                                  alt="Evidence"
                                  style={{ borderRadius: '4px' }}
                                />
                              </ImageListItem>
                            </ImageList>
                          </Box>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
              </Timeline>

              <Divider sx={{ my: 3 }} />

              {/* Add-Ons Section */}
              {addOns.length > 0 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    {t('proposedAddOns')}
                  </Typography>

                  {addOns.map((addon) => (
                    <Card key={addon.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {addon.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {addon.description}
                            </Typography>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold">
                              {addon.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleApproveAddOn(addon.id)}
                            >
                              {t('approve')}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeclineAddOn(addon.id)}
                            >
                              {t('decline')}
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetail}>{tCommon('close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
