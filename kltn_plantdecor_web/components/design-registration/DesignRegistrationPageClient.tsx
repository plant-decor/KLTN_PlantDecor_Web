'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { CustomLoading } from '@/components/CustomLoading';
import ManagementHeader from '@/components/layout/ManagementHeader';
import {
  createDesignRegistration,
} from '@/lib/api/designRegistrationService';
import {
  getDesignTemplateTierNurseries,
  getMarketedDesignTemplates,
  getMarketedDesignTemplateTiers,
} from '@/lib/api/designTemplatePublicService';
import type {
  MarketedDesignTemplate,
  MarketedDesignTemplateTier,
  MarketedDesignTemplateTierNursery,
} from '@/types/design-registration.types';

const formatCurrency = (value: number) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [latitude, setLatitude] = useState('10');
  const [longitude, setLongitude] = useState('105');

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

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
      const message = getErrorMessage(loadError, 'Cannot load design template suggestions');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

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
        setSelectedNurseryId(response[0]?.nurseryId ?? 0);
      } catch {
        setNurseries([]);
        setSelectedNurseryId(0);
      }
    };

    void loadNurseries();
  }, [selectedTierId]);

  const handleTemplateChange = useCallback((templateId: number) => {
    setSelectedTemplateId(templateId);
    const templateTiers = tiersByTemplateId.get(templateId) ?? [];
    setSelectedTierId(templateTiers[0]?.id ?? 0);
  }, [tiersByTemplateId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedTier || !selectedNurseryId) {
      toast.error('Please choose a template tier and nursery');
      return;
    }

    if (!address.trim() || !phone.trim()) {
      toast.error('Address and phone are required');
      return;
    }

    try {
      setSubmitting(true);
      await createDesignRegistration(
        {
          nurseryId: selectedNurseryId,
          designTemplateTierId: selectedTier.id,
          latitude: Number(latitude),
          longitude: Number(longitude),
          address: address.trim(),
          phone: phone.trim(),
          customerNote: customerNote.trim(),
        },
        false
      );
      toast.success('Design registration created successfully');
      setCustomerNote('');
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, 'Cannot create design registration'));
    } finally {
      setSubmitting(false);
    }
  }, [address, customerNote, latitude, longitude, phone, selectedNurseryId, selectedTier]);

  return (
    <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Design Registration"
        description="Choose a marketed design template tier, pick an available nursery, and create a design registration."
        entityLabel="design registration"
        count={templates.length}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CustomLoading />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, border: '1px solid var(--card-border)' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Step 1. Pick a template and tier
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
                  <InputLabel id="tier-select-label">Tier</InputLabel>
                  <Select
                    labelId="tier-select-label"
                    label="Tier"
                    value={selectedTierId}
                    onChange={(event) => setSelectedTierId(Number(event.target.value))}
                  >
                    {selectedTiers.map((tier) => (
                      <MenuItem key={tier.id} value={tier.id}>
                        {tier.tierName} - {formatCurrency(tier.packagePrice)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {selectedTemplate && (
                <Card variant="outlined" sx={{ borderColor: 'var(--card-border)' }}>
                  <CardMedia component="img" height="220" image={selectedTemplate.imageUrl} alt={selectedTemplate.name} />
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedTemplate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedTemplate.description}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {selectedTiers.map((tier) => (
                        <Chip
                          key={tier.id}
                          label={`${tier.tierName} • ${formatCurrency(tier.packagePrice)} • ${tier.minArea}-${tier.maxArea}m2`}
                          color={tier.id === selectedTierId ? 'primary' : 'default'}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, border: '1px solid var(--card-border)' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Step 2. Choose a nursery and submit
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="nursery-select-label">Nursery</InputLabel>
                <Select
                  labelId="nursery-select-label"
                  label="Nursery"
                  value={selectedNurseryId}
                  onChange={(event) => setSelectedNurseryId(Number(event.target.value))}
                >
                  {nurseries.map((nursery) => (
                    <MenuItem key={`${nursery.nurseryId}-${nursery.id ?? nursery.nurseryId}`} value={nursery.nurseryId}>
                      {nursery.nurseryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedTier && (
                <Alert severity="info">
                  Selected tier: <strong>{selectedTier.tierName}</strong> with package price {formatCurrency(selectedTier.packagePrice)}.
                </Alert>
              )}

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Latitude" type="number" value={latitude} onChange={(event) => setLatitude(event.target.value)} fullWidth />
                <TextField label="Longitude" type="number" value={longitude} onChange={(event) => setLongitude(event.target.value)} fullWidth />
              </Stack>
              <TextField label="Address" value={address} onChange={(event) => setAddress(event.target.value)} fullWidth required />
              <TextField label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} fullWidth required />
              <TextField
                label="Customer Note"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />

              <Button variant="contained" onClick={() => void handleSubmit()} disabled={submitting || !selectedTier || !selectedNurseryId}>
                {submitting ? 'Submitting...' : 'Create Registration'}
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
