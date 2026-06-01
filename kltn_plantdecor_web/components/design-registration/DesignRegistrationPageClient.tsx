'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import EmptyState from '@/components/service/EmptyState';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import {
  buildDesignFlowLabelMap,
  cancelDesignRegistration,
  createDesignRegistration,
  getDesignFlowEnums,
  getDesignRegistrationDetail,
  getMyDesignRegistrations,
} from '@/lib/api/designRegistrationService';
import {
  getDesignTemplateTierNurseries,
  getMarketedDesignTemplates,
  getMarketedDesignTemplateTiers,
} from '@/lib/api/designTemplatePublicService';
import { createPaymentUrlByOrderId } from '@/lib/api/orderService';
import { getAddressFromCoordinates, searchAddressSuggestions, type AddressSuggestion } from '@/lib/utils/geocoding';
import type {
  CustomerDesignRegistrationDetail,
  CustomerDesignRegistrationListItem,
  DesignFlowEnumGroup,
  MarketedDesignTemplate,
  MarketedDesignTemplateTier,
  MarketedDesignTemplateTierNursery,
} from '@/types/design-registration.types';
import { formatDate } from '@/lib/utils/dateUtils';
import { formatCurrency } from '@/lib/utils/formatUtil';
import ClickableImageViewer from '../image-view/ClickableImageViewer';

const DESIGN_STATUS = {
  PendingApproval: 1,
  AwaitDeposit: 2,
  DepositPaid: 3,
  InProgress: 4,
  AwaitFinalPayment: 5,
  Completed: 6,
  Rejected: 7,
  Cancelled: 8,
} as const;

const FINAL_DESIGN_STATUS = new Set<number>([
  DESIGN_STATUS.Completed,
  DESIGN_STATUS.Rejected,
  DESIGN_STATUS.Cancelled,
]);

const PAYABLE_DESIGN_STATUS = new Set<number>([
  DESIGN_STATUS.AwaitDeposit,
  DESIGN_STATUS.AwaitFinalPayment,
]);



const formatEnumLabel = (value: string) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeStatusName = (value?: string | null) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

const getStatusChipColor = (status: number): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  if (status === DESIGN_STATUS.PendingApproval) return 'warning';
  if (status === DESIGN_STATUS.AwaitDeposit || status === DESIGN_STATUS.AwaitFinalPayment) return 'info';
  if (status === DESIGN_STATUS.DepositPaid || status === DESIGN_STATUS.InProgress || status === DESIGN_STATUS.Completed) return 'success';
  if (status === DESIGN_STATUS.Rejected || status === DESIGN_STATUS.Cancelled) return 'error';
  return 'default';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function DesignRegistrationPageClient() {
  const [templates, setTemplates] = useState<MarketedDesignTemplate[]>([]);
  const [tiers, setTiers] = useState<MarketedDesignTemplateTier[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0);
  const [selectedTierId, setSelectedTierId] = useState<number>(0);
  const [nurseries, setNurseries] = useState<MarketedDesignTemplateTierNursery[]>([]);
  const [selectedNurseryId, setSelectedNurseryId] = useState<number>(0);

  const [registrations, setRegistrations] = useState<CustomerDesignRegistrationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<CustomerDesignRegistrationDetail | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CustomerDesignRegistrationListItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [paymentSubmittingId, setPaymentSubmittingId] = useState<number | null>(null);

  const [addressInputValue, setAddressInputValue] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedAddressSuggestion, setSelectedAddressSuggestion] = useState<AddressSuggestion | null>(null);
  const [loadingAddressSuggestions, setLoadingAddressSuggestions] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [designFlowEnums, setDesignFlowEnums] = useState<DesignFlowEnumGroup[]>([]);

  const tiersByTemplateId = useMemo(() => {
    const map = new Map<number, MarketedDesignTemplateTier[]>();
    tiers.forEach((tier) => {
      const current = map.get(tier.designTemplateId) ?? [];
      current.push(tier);
      map.set(tier.designTemplateId, current);
    });
    return map;
  }, [tiers]);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;
  const selectedTiers = useMemo(() => {
    return selectedTemplateId ? tiersByTemplateId.get(selectedTemplateId) ?? [] : [];
  }, [selectedTemplateId, tiersByTemplateId]);
  const selectedTier = useMemo(() => {
    return selectedTiers.find((tier) => tier.id === selectedTierId) ?? null;
  }, [selectedTierId, selectedTiers]);

  const designStatusLabels = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'DesignRegistrationStatus', formatEnumLabel),
    [designFlowEnums]
  );

  const taskStatusLabels = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'DesignTaskStatus', formatEnumLabel),
    [designFlowEnums]
  );

  const taskTypeLabels = useMemo(
    () => buildDesignFlowLabelMap(designFlowEnums, 'TaskType', formatEnumLabel),
    [designFlowEnums]
  );

  const getDesignStatusLabel = useCallback(
    (item: Pick<CustomerDesignRegistrationListItem, 'status' | 'statusName'>) => {
      return designStatusLabels[item.status] || formatEnumLabel(item.statusName) || `#${item.status}`;
    },
    [designStatusLabels]
  );

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyDesignRegistrations({ pageNumber: 1, pageSize: 10 }, false);
      setRegistrations(response.items);
    } catch (loadError) {
      const message = getErrorMessage(loadError, 'Cannot load design registrations');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const [templatesResponse, tiersResponse] = await Promise.all([
        getMarketedDesignTemplates(false),
        getMarketedDesignTemplateTiers(false),
      ]);

      setTemplates(templatesResponse);
      setTiers(tiersResponse);

      const firstTemplate = templatesResponse[0];
      const firstTier = tiersResponse.find((tier) => tier.designTemplateId === firstTemplate?.id);
      setSelectedTemplateId(firstTemplate?.id ?? 0);
      setSelectedTierId(firstTier?.id ?? 0);
    } catch (loadError) {
      toast.error(getErrorMessage(loadError, 'Cannot load design templates'));
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.all([
      loadRegistrations(),
      loadTemplates(),
      getDesignFlowEnums(false).then(setDesignFlowEnums).catch(() => setDesignFlowEnums([])),
    ]);
  }, [loadRegistrations, loadTemplates]);

  useEffect(() => {
    const tier = selectedTiers[0];
    if (!selectedTierId && tier) {
      setSelectedTierId(tier.id);
    }
  }, [selectedTierId, selectedTiers]);

  useEffect(() => {
    const loadNurseries = async () => {
      if (!selectedTierId) {
        setNurseries([]);
        setSelectedNurseryId(0);
        return;
      }

      try {
        const response = await getDesignTemplateTierNurseries(selectedTierId, false);
        setNurseries(response);
        setSelectedNurseryId((prev) => (response.some((nursery) => nursery.nurseryId === prev) ? prev : 0));
      } catch {
        setNurseries([]);
        setSelectedNurseryId(0);
      }
    };

    void loadNurseries();
  }, [selectedTierId]);

  useEffect(() => {
    if (!createOpen) {
      return;
    }

    const query = addressInputValue.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setLoadingAddressSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingAddressSuggestions(true);
      try {
        const suggestions = await searchAddressSuggestions(query);
        setAddressSuggestions(suggestions);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setLoadingAddressSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [addressInputValue, createOpen]);

  const handleTemplateChange = useCallback((templateId: number) => {
    setSelectedTemplateId(templateId);
    const templateTiers = tiersByTemplateId.get(templateId) ?? [];
    setSelectedTierId(templateTiers[0]?.id ?? 0);
    setSelectedNurseryId(0);
  }, [tiersByTemplateId]);

  const handleAddressInputChange = (value: string) => {
    setAddressInputValue(value);
    setSelectedAddressSuggestion(null);
    setAddress(value);
    setLatitude(undefined);
    setLongitude(undefined);
    setFieldErrors((prev) => ({ ...prev, address: '' }));
  };

  const handleAddressSuggestionChange = (value: AddressSuggestion | string | null) => {
    if (!value) {
      handleAddressInputChange('');
      setAddressSuggestions([]);
      return;
    }

    if (typeof value === 'object') {
      setSelectedAddressSuggestion(value);
      setAddressInputValue(value.display_name);
      setAddressSuggestions([]);
      setAddress(value.display_name);
      setLatitude(value.latitude);
      setLongitude(value.longitude);
      setFieldErrors((prev) => ({ ...prev, address: '' }));
      return;
    }

    handleAddressInputChange(value);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Current location is not supported in this browser');
      return;
    }

    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedLatitude = position.coords.latitude;
        const detectedLongitude = position.coords.longitude;
        const detectedAddress = await getAddressFromCoordinates(detectedLatitude, detectedLongitude);

        setLatitude(detectedLatitude);
        setLongitude(detectedLongitude);

        if (detectedAddress) {
          setAddress(detectedAddress);
          setAddressInputValue(detectedAddress);
          setSelectedAddressSuggestion(null);
          setAddressSuggestions([]);
          setFieldErrors((prev) => ({ ...prev, address: '' }));
        }

        setUsingCurrentLocation(false);
        toast.success('Location updated');
      },
      () => {
        setUsingCurrentLocation(false);
        toast.warning('Cannot read current location');
      }
    );
  };

  const resetCreateForm = useCallback(() => {
    setSelectedNurseryId(0);
    setAddress('');
    setAddressInputValue('');
    setAddressSuggestions([]);
    setSelectedAddressSuggestion(null);
    setPhone('');
    setCustomerNote('');
    setLatitude(undefined);
    setLongitude(undefined);
    setFieldErrors({});
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
    resetCreateForm();
  }, [resetCreateForm]);

  const handleSubmit = useCallback(async () => {
    const tier = selectedTier;
    const errors: Record<string, string> = {};
    if (!tier) {
      errors.tier = 'Please choose a template tier';
    }
    if (!address.trim()) {
      errors.address = 'Address is required';
    }
    if (!phone.trim()) {
      errors.phone = 'Phone is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!tier) {
      return;
    }

    const fallbackSuggestion = !selectedAddressSuggestion && addressSuggestions.length > 0 ? addressSuggestions[0] : null;

    try {
      setSubmitting(true);
      await createDesignRegistration(
        {
          nurseryId: selectedNurseryId || undefined,
          designTemplateTierId: tier.id,
          latitude: fallbackSuggestion?.latitude ?? latitude ?? 0,
          longitude: fallbackSuggestion?.longitude ?? longitude ?? 0,
          address: address.trim(),
          phone: phone.trim(),
          customerNote: customerNote.trim() || undefined,
        },
        false
      );
      toast.success('Design registration created successfully');
      handleCloseCreate();
      await loadRegistrations();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Cannot create design registration'));
    } finally {
      setSubmitting(false);
    }
  }, [
    address,
    addressSuggestions,
    customerNote,
    handleCloseCreate,
    latitude,
    loadRegistrations,
    longitude,
    phone,
    selectedAddressSuggestion,
    selectedNurseryId,
    selectedTier,
  ]);

  const handleViewDetail = async (id: number) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      const detail = await getDesignRegistrationDetail(id, false);
      setDetailItem(detail);
    } catch (viewError) {
      toast.error(getErrorMessage(viewError, 'Cannot load design registration details'));
      setDetailOpen(false);
      setDetailItem(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePay = async (item: CustomerDesignRegistrationListItem) => {
    if (!item.orderId) {
      toast.error('Payment order is missing');
      return;
    }

    try {
      setPaymentSubmittingId(item.id);
      const paymentUrl = await createPaymentUrlByOrderId(item.orderId);
      window.location.assign(paymentUrl);
    } catch (payError) {
      toast.error(getErrorMessage(payError, 'Cannot create payment link'));
    } finally {
      setPaymentSubmittingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      toast.error('Please enter a cancellation reason');
      return;
    }

    try {
      setSubmitting(true);
      const cancelled = await cancelDesignRegistration(cancelTarget.id, trimmedReason, false);
      setRegistrations((prev) => prev.map((item) => (item.id === cancelled.id ? cancelled : item)));
      setDetailItem((prev) => (prev?.id === cancelled.id ? cancelled : prev));
      setCancelTarget(null);
      setCancelReason('');
      toast.success('Design registration cancelled successfully');
      await loadRegistrations();
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError, 'Cannot cancel design registration'));
    } finally {
      setSubmitting(false);
    }
  };

  const canCustomerCancel = (item: CustomerDesignRegistrationListItem) => {
    if (FINAL_DESIGN_STATUS.has(item.status)) {
      return false;
    }

    const normalized = normalizeStatusName(item.statusName);
    return item.status === DESIGN_STATUS.PendingApproval ||
      item.status === DESIGN_STATUS.AwaitDeposit ||
      normalized === 'pendingapproval' ||
      normalized === 'awaitdeposit';
  };

  const canPay = (item: CustomerDesignRegistrationListItem) => {
    return Boolean(item.orderId) && PAYABLE_DESIGN_STATUS.has(item.status);
  };

  return (
    <Box>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ minWidth: 180, backgroundColor: 'var(--primary)', fontWeight: 'bold', ...hoverLiftStyle }}
        >
          Register Design
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CustomLoading />
          </Box>
        ) : registrations.length === 0 ? (
          <Box>
            <EmptyState
              icon={<AddIcon />}
              title="No design registrations"
              description="Create a design registration to start your green space planning service."
            />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'var(--primary)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Design Template</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nursery</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {item.designTemplateTier.designTemplate.name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.designTemplateTier.tierName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.nursery?.name || 'Optional'}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" color={getStatusChipColor(item.status)} label={getDesignStatusLabel(item)} />
                    </TableCell>
                    <TableCell align="center">{formatCurrency(item.totalPrice, 'vi-VN')}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => void handleViewDetail(item.id)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {canPay(item) ? (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => void handlePay(item)}
                            disabled={paymentSubmittingId === item.id}
                            sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
                          >
                            {paymentSubmittingId === item.id ? 'Creating...' : 'Pay'}
                          </Button>
                        ) : null}
                        {canCustomerCancel(item) ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelOutlinedIcon />}
                            onClick={() => {
                              setCancelTarget(item);
                              setCancelReason('');
                            }}
                            sx={{ backgroundColor: 'var(--error)', ...hoverLiftStyle }}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={createOpen} onClose={handleCloseCreate} fullWidth maxWidth="md">
        <DialogTitle>Create Design Registration</DialogTitle>
        <DialogContent dividers>
          {templatesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CustomLoading />
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth error={Boolean(fieldErrors.tier)}>
                  <InputLabel id="template-select-label">Design Template</InputLabel>
                  <Select
                    labelId="template-select-label"
                    label="Design Template"
                    value={selectedTemplateId}
                    onChange={(event) => handleTemplateChange(Number(event.target.value))}
                  >
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth error={Boolean(fieldErrors.tier)}>
                  <InputLabel id="tier-select-label">Tier</InputLabel>
                  <Select
                    labelId="tier-select-label"
                    label="Tier"
                    value={selectedTierId}
                    onChange={(event) => {
                      setSelectedTierId(Number(event.target.value));
                      setSelectedNurseryId(0);
                      setFieldErrors((prev) => ({ ...prev, tier: '' }));
                    }}
                  >
                    {selectedTiers.map((tier) => (
                      <MenuItem key={tier.id} value={tier.id}>
                        {tier.tierName} - {formatCurrency(tier.packagePrice, 'vi-VN')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {selectedTemplate && selectedTier ? (
                <Card variant="outlined" sx={{ borderColor: 'var(--card-border)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedTemplate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {selectedTemplate.description}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label={selectedTier.tierName} color="primary" />
                      <Chip label={formatCurrency(selectedTier.packagePrice, 'vi-VN')} />
                      <Chip label={`${selectedTier.minArea}-${selectedTier.maxArea} m2`} />
                      <Chip label={`${selectedTier.estimatedDays} days`} />
                    </Stack>
                    <ClickableImageViewer
                      images={[selectedTemplate.imageUrl]}
                      alt={selectedTemplate.name}
                      containerClassName="w-full mt-4"
                      className="object-cover"
                      showZoomHint={true}
                    />
                  </CardContent>
                </Card>
              ) : null}

              <FormControl fullWidth>
                <InputLabel id="nursery-select-label">Nursery</InputLabel>
                <Select
                  labelId="nursery-select-label"
                  label="Nursery"
                  value={selectedNurseryId}
                  onChange={(event) => setSelectedNurseryId(Number(event.target.value))}
                >
                  <MenuItem value={0}>
                    <em>Select service provider nursery (optional)</em>
                  </MenuItem>
                  {nurseries.map((nursery) => (
                    <MenuItem key={`${nursery.nurseryId}-${nursery.id ?? nursery.nurseryId}`} value={nursery.nurseryId}>
                      {nursery.nurseryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
                <Autocomplete
                  freeSolo
                  options={addressSuggestions}
                  filterOptions={(options) => options}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.display_name || '')}
                  inputValue={addressInputValue}
                  onInputChange={(_, value) => handleAddressInputChange(value)}
                  onChange={(_, value) => handleAddressSuggestionChange(value)}
                  loading={loadingAddressSuggestions}
                  sx={{ flex: 1, width: '100%' }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Address"
                      placeholder="Search or enter your service address"
                      error={Boolean(fieldErrors.address)}
                      helperText={fieldErrors.address}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingAddressSuggestions ? <CustomLoading size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={handleUseCurrentLocation}
                  disabled={usingCurrentLocation}
                  sx={{ ...hoverLiftStyle, minHeight: 56, width: { xs: '100%', md: 'auto' } }}
                >
                  {usingCurrentLocation ? 'Locating...' : 'Use Location'}
                </Button>
              </Box>

              <TextField
                label="Phone"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone: '' }));
                }}
                error={Boolean(fieldErrors.phone)}
                helperText={fieldErrors.phone}
                fullWidth
                required
              />
              <TextField
                label="Customer Note"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={submitting}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSubmit()}
            disabled={submitting || templatesLoading || !selectedTier}
            sx={{ backgroundColor: 'var(--primary)' }}
          >
            {submitting ? 'Submitting...' : 'Create Registration'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailItem(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{detailItem ? `Design Registration #${detailItem.id}` : 'Design Registration'}</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CustomLoading />
            </Box>
          ) : detailItem ? (
            <Stack spacing={1.5}>
              <Box>
                <strong>Status:</strong>{' '}
                <Chip size="small" color={getStatusChipColor(detailItem.status)} label={getDesignStatusLabel(detailItem)} />
              </Box>
              <Typography><strong>Template:</strong> {detailItem.designTemplateTier.designTemplate.name || '-'}</Typography>
              <Typography><strong>Tier:</strong> {detailItem.designTemplateTier.tierName || '-'}</Typography>
              <Typography><strong>Nursery:</strong> {detailItem.nursery?.name || 'Optional'}</Typography>
              <Typography><strong>Total price:</strong> {formatCurrency(detailItem.totalPrice, 'vi-VN')}</Typography>
              <Typography><strong>Deposit:</strong> {formatCurrency(detailItem.depositAmount, 'vi-VN')}</Typography>
              <Typography><strong>Phone:</strong> {detailItem.phone || '-'}</Typography>
              <Typography><strong>Address:</strong> {detailItem.address || '-'}</Typography>
              <Typography><strong>Customer note:</strong> {detailItem.customerNote || '-'}</Typography>
              <Typography><strong>Order ID:</strong> {detailItem.orderId ? `#${detailItem.orderId}` : '-'}</Typography>
              <Typography><strong>Assigned caretaker:</strong> {detailItem.assignedCaretaker?.fullName || '-'}</Typography>
              {detailItem.cancelReason ? (
                <Typography color="error"><strong>Reject/Cancel reason:</strong> {detailItem.cancelReason}</Typography>
              ) : null}

              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Design Tasks
                </Typography>
                {detailItem.designTasks.length === 0 ? (
                  <Alert severity="info">No design tasks have been created for this registration.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Task</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Scheduled</TableCell>
                          <TableCell>Staff</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailItem.designTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>{taskTypeLabels[task.taskType] || formatEnumLabel(task.taskTypeName) || `#${task.taskType}`}</TableCell>
                            <TableCell>{taskStatusLabels[task.status] || formatEnumLabel(task.statusName) || `#${task.status}`}</TableCell>
                            <TableCell>{task.scheduledDate ? formatDate(task.scheduledDate) : '-'}</TableCell>
                            <TableCell>{task.assignedStaff?.fullName || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Stack>
          ) : (
            <Typography>No detail data available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {detailItem && canPay(detailItem) ? (
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => void handlePay(detailItem)}
              disabled={paymentSubmittingId === detailItem.id}
              sx={{ backgroundColor: 'var(--primary)' }}
            >
              {paymentSubmittingId === detailItem.id ? 'Creating...' : 'Pay now'}
            </Button>
          ) : null}
          {detailItem && canCustomerCancel(detailItem) ? (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setCancelTarget(detailItem);
                setCancelReason('');
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            onClick={() => {
              setDetailOpen(false);
              setDetailItem(null);
            }}
            disabled={detailLoading}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>{cancelTarget ? `Cancel design registration #${cancelTarget.id}` : 'Cancel design registration'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="Cancellation reason"
            fullWidth
            multiline
            minRows={3}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            disabled={submitting}
            placeholder="Enter cancellation reason"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)} disabled={submitting}>
            Close
          </Button>
          <Button
            onClick={() => void handleCancel()}
            disabled={submitting || cancelReason.trim().length === 0}
            variant="contained"
            color="error"
          >
            {submitting ? 'Processing...' : 'Confirm cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
