'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import type {
  AdminDesignTemplateCreateRequest,
  AdminDesignTemplateDetail,
  AdminDesignTemplateListItem,
  AdminDesignTemplateTierCreateRequest,
  AdminDesignTemplateTierUpdateRequest,
  DesignTemplateSpecialization,
  DesignTemplateRoomTypeOption,
  DesignTemplateStyleOption,
  DesignTemplateTier,
} from '@/types/admin-design-template.types';
import {
  createAdminDesignTemplate,
  createAdminDesignTemplateTier,
  deactivateAdminDesignTemplateTier,
  deleteAdminDesignTemplate,
  getActiveDesignTemplateSpecializations,
  getAdminDesignTemplateDetail,
  getAdminDesignTemplates,
  updateAdminDesignTemplate,
  updateAdminDesignTemplateTier,
} from '@/lib/api/adminDesignTemplatesService';
import { fetchRoomDesignEnumOptions } from '@/lib/api/adminPlantGuidesService';
import DesignTemplateTable from './DesignTemplateTable';
import DesignTemplateFormDialog, { type DesignTemplateFormValue } from './DesignTemplateFormDialog';
import DesignTemplateTierDialog, { type DesignTemplateTierFormValue } from './DesignTemplateTierDialog';
import {
  mapRoomTypeOptions,
  mapStyleOptions,
} from './designTemplateManagement.constants';

type TemplateDialogMode = 'create' | 'edit' | 'view';
type TierDialogMode = 'create' | 'edit' | 'view';

const emptyTemplateForm = (defaultStyle = 1): DesignTemplateFormValue => ({
  name: '',
  description: '',
  style: defaultStyle,
  roomTypes: [],
  imageUrl: '',
  specializationIds: [],
});

const emptyTierForm = (): DesignTemplateTierFormValue => ({
  tierName: '',
  minArea: 0,
  maxArea: 0,
  packagePrice: 0,
  scopedOfWork: '',
  estimatedDays: 1,
  isActive: true,
  items: [{ materialId: null, plantId: null, itemType: 1, quantity: 1 }],
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || fallback;
};

export default function DesignTemplateManagementPageClient() {
  const [templates, setTemplates] = useState<AdminDesignTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [styleOptions, setStyleOptions] = useState<DesignTemplateStyleOption[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<DesignTemplateRoomTypeOption[]>([]);
  const [specializationOptions, setSpecializationOptions] = useState<DesignTemplateSpecialization[]>([]);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDialogMode, setTemplateDialogMode] = useState<TemplateDialogMode>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<AdminDesignTemplateDetail | null>(null);
  const [templateDetailLoading, setTemplateDetailLoading] = useState(false);
  const [templateDetailError, setTemplateDetailError] = useState<string | null>(null);
  const [templateFormValue, setTemplateFormValue] = useState<DesignTemplateFormValue>(emptyTemplateForm());
  const [templateSubmitting, setTemplateSubmitting] = useState(false);

  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [tierDialogMode, setTierDialogMode] = useState<TierDialogMode>('create');
  const [selectedTier, setSelectedTier] = useState<DesignTemplateTier | null>(null);
  const [tierFormValue, setTierFormValue] = useState<DesignTemplateTierFormValue>(emptyTierForm());
  const [tierDetailLoading, setTierDetailLoading] = useState(false);
  const [tierDetailError, setTierDetailError] = useState<string | null>(null);
  const [tierSubmitting, setTierSubmitting] = useState(false);

  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<AdminDesignTemplateListItem | null>(null);
  const [deleteTierTarget, setDeleteTierTarget] = useState<DesignTemplateTier | null>(null);

  const totalCount = templates.length;

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const response = await getAdminDesignTemplates(false);
      setTemplates(response);
    } catch (error) {
      const message = getErrorMessage(error, 'Cannot load design templates');
      setPageError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoomDesignEnums = useCallback(async () => {
    try {
      const response = await fetchRoomDesignEnumOptions(false);
      const nextStyleOptions = mapStyleOptions(response.roomStyles);
      const nextRoomTypeOptions = mapRoomTypeOptions(response.roomTypes);

      setStyleOptions(nextStyleOptions);
      setRoomTypeOptions(nextRoomTypeOptions);

      setTemplateFormValue((prev) => {
        if (nextStyleOptions.some((option) => option.value === prev.style) || nextStyleOptions.length === 0) {
          return prev;
        }

        return {
          ...prev,
          style: nextStyleOptions[0].value,
        };
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot load room design enums'));
    }
  }, []);

  const loadSpecializations = useCallback(async () => {
    try {
      const response = await getActiveDesignTemplateSpecializations(false);
      setSpecializationOptions(response);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot load specializations'));
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
    void loadRoomDesignEnums();
    void loadSpecializations();
  }, [loadRoomDesignEnums, loadSpecializations, loadTemplates]);

  const activeCount = useMemo(() => templates.filter((template) => template.isActive !== false).length, [templates]);

  const openTemplateDialog = useCallback(
    async (mode: TemplateDialogMode, template?: AdminDesignTemplateListItem) => {
      setTemplateDialogMode(mode);
      setTemplateDetailError(null);
      setTemplateDetailLoading(false);
      setTemplateFormValue(emptyTemplateForm());

      if (!template) {
        setSelectedTemplate(null);
        setTemplateDialogOpen(true);
        return;
      }

      setTemplateDialogOpen(true);
      setTemplateDetailLoading(true);
      try {
        const detail = await getAdminDesignTemplateDetail(template.id, false);
        setSelectedTemplate(detail);
        setTemplateFormValue({
          name: detail.name,
          description: detail.description,
          style: detail.style,
          roomTypes: detail.roomTypes,
          imageUrl: detail.imageUrl,
          specializationIds: detail.specializations.map((item) => item.id),
        });
      } catch (error) {
        const message = getErrorMessage(error, 'Cannot load design template detail');
        setTemplateDetailError(message);
        toast.error(message);
      } finally {
        setTemplateDetailLoading(false);
      }
    },
    []
  );

  const openCreateTemplate = useCallback(() => {
    setTemplateDialogMode('create');
    setSelectedTemplate(null);
    setTemplateFormValue(emptyTemplateForm(styleOptions[0]?.value ?? 1));
    setTemplateDialogOpen(true);
  }, [styleOptions]);

  const handleSaveTemplate = useCallback(async () => {
    try {
      setTemplateSubmitting(true);

      if (!templateFormValue.name.trim()) {
        toast.error('Template name is required');
        return;
      }

      if (!templateFormValue.description.trim()) {
        toast.error('Template description is required');
        return;
      }

      if (!templateFormValue.imageUrl.trim()) {
        toast.error('Image URL is required');
        return;
      }

      if (templateDialogMode === 'create') {
        if (templateFormValue.specializationIds.length === 0) {
          toast.error('Please select at least one specialization');
          return;
        }

        const payload: AdminDesignTemplateCreateRequest = {
          name: templateFormValue.name.trim(),
          description: templateFormValue.description.trim(),
          style: templateFormValue.style,
          roomTypes: templateFormValue.roomTypes,
          imageUrl: templateFormValue.imageUrl.trim(),
          specializationIds: templateFormValue.specializationIds,
        };
        await createAdminDesignTemplate(payload, false);
        toast.success('Design template created successfully');
      } else if (templateDialogMode === 'edit' && selectedTemplate) {
        const payload = {
          name: templateFormValue.name.trim(),
          description: templateFormValue.description.trim(),
          style: templateFormValue.style,
          roomTypes: templateFormValue.roomTypes,
          imageUrl: templateFormValue.imageUrl.trim(),
        };
        await updateAdminDesignTemplate(selectedTemplate.id, payload, false);
        toast.success('Design template updated successfully');
      }

      setTemplateDialogOpen(false);
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot save design template'));
    } finally {
      setTemplateSubmitting(false);
    }
  }, [loadTemplates, selectedTemplate, templateDialogMode, templateFormValue]);

  const openTierDialog = useCallback(async (mode: TierDialogMode, template: AdminDesignTemplateListItem, tier?: DesignTemplateTier) => {
    setTierDialogMode(mode);
    setTierDialogOpen(true);
    setTierDetailError(null);
    setSelectedTier(null);

    try {
      setTierDetailLoading(true);
      const detail = await getAdminDesignTemplateDetail(template.id, false);
      setSelectedTemplate(detail);

      if (!tier) {
        setTierFormValue(emptyTierForm());
        return;
      }

      setSelectedTier(tier);
      if (mode === 'edit' || mode === 'view') {
        const tierDetail = detail.tiers.find((item) => item.id === tier.id) ?? tier;
        setTierFormValue({
          tierName: tierDetail.tierName,
          minArea: tierDetail.minArea,
          maxArea: tierDetail.maxArea,
          packagePrice: tierDetail.packagePrice,
          scopedOfWork: tierDetail.scopedOfWork,
          estimatedDays: tierDetail.estimatedDays,
          isActive: tierDetail.isActive,
          items: tierDetail.items.map((item) => ({
            materialId: item.materialId,
            plantId: item.plantId,
            itemType: item.itemType,
            quantity: item.quantity,
          })),
        });
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Cannot load tier detail');
      setTierDetailError(message);
      toast.error(message);
    } finally {
      setTierDetailLoading(false);
    }
  }, []);

  const handleEditExistingTier = useCallback(
    (tier: DesignTemplateTier) => {
      setTierDialogMode('edit');
      setSelectedTier(tier);
      setTierFormValue({
        tierName: tier.tierName,
        minArea: tier.minArea,
        maxArea: tier.maxArea,
        packagePrice: tier.packagePrice,
        scopedOfWork: tier.scopedOfWork,
        estimatedDays: tier.estimatedDays,
        isActive: tier.isActive,
        items: tier.items.map((item) => ({
          materialId: item.materialId,
          plantId: item.plantId,
          itemType: item.itemType,
          quantity: item.quantity,
        })),
      });
    },
    []
  );

  const handleSaveTier = useCallback(async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    try {
      setTierSubmitting(true);

      if (!tierFormValue.tierName.trim()) {
        toast.error('Tier name is required');
        return;
      }

      if (!tierFormValue.scopedOfWork.trim()) {
        toast.error('Scope of work is required');
        return;
      }

      if (tierDialogMode === 'create') {
        const payload: AdminDesignTemplateTierCreateRequest = {
          designTemplateId: selectedTemplate.id,
          tierName: tierFormValue.tierName.trim(),
          minArea: tierFormValue.minArea,
          maxArea: tierFormValue.maxArea,
          packagePrice: tierFormValue.packagePrice,
          scopedOfWork: tierFormValue.scopedOfWork.trim(),
          estimatedDays: tierFormValue.estimatedDays,
          isActive: tierFormValue.isActive,
          items: tierFormValue.items,
        };
        await createAdminDesignTemplateTier(payload, false);
        toast.success('Tier created successfully');
      } else if (tierDialogMode === 'edit' && selectedTier) {
        const payload: AdminDesignTemplateTierUpdateRequest = {
          tierName: tierFormValue.tierName.trim(),
          minArea: tierFormValue.minArea,
          maxArea: tierFormValue.maxArea,
          packagePrice: tierFormValue.packagePrice,
          scopedOfWork: tierFormValue.scopedOfWork.trim(),
          estimatedDays: tierFormValue.estimatedDays,
          isActive: tierFormValue.isActive,
        };
        await updateAdminDesignTemplateTier(selectedTier.id, payload, false);
        toast.success('Tier updated successfully');
      }

      setTierDialogOpen(false);
      setSelectedTier(null);
      await loadTemplates();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot save tier'));
    } finally {
      setTierSubmitting(false);
    }
  }, [loadTemplates, selectedTemplate, selectedTier, tierDialogMode, tierFormValue]);

  const handleDeleteTemplate = useCallback((template: AdminDesignTemplateListItem) => {
    setDeleteTemplateTarget(template);
  }, []);

  const confirmDeleteTemplate = useCallback(async () => {
    if (!deleteTemplateTarget) {
      return;
    }

    try {
      await deleteAdminDesignTemplate(deleteTemplateTarget.id, false);
      toast.success('Design template deleted successfully');
      setDeleteTemplateTarget(null);
      await loadTemplates();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot delete design template'));
    }
  }, [deleteTemplateTarget, loadTemplates]);

  const handleDeleteTier = useCallback((tier: DesignTemplateTier) => {
    setDeleteTierTarget(tier);
  }, []);

  const confirmDeleteTier = useCallback(async () => {
    if (!deleteTierTarget) {
      return;
    }

    try {
      await deactivateAdminDesignTemplateTier(deleteTierTarget.id, false);
      toast.success('Tier deactivated successfully');
      setDeleteTierTarget(null);
      await loadTemplates();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cannot deactivate tier'));
    }
  }, [deleteTierTarget, loadTemplates]);

  const closeTemplateDialog = useCallback(() => {
    if (templateSubmitting) {
      return;
    }

    setTemplateDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateDetailError(null);
  }, [templateSubmitting]);

  const closeTierDialog = useCallback(() => {
    if (tierSubmitting) {
      return;
    }

    setTierDialogOpen(false);
    setSelectedTemplate(null);
    setSelectedTier(null);
    setTierDetailError(null);
  }, [tierSubmitting]);

  return (
    <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Design Template Management"
        description="Manage design templates and their tier packages for the admin workspace."
        entityLabel="design template"
        count={totalCount}
        actionLabel="Create Template"
        onAction={openCreateTemplate}
        actions={[
          {
            label: 'Reload',
            onClick: () => {
              void loadTemplates();
              void loadRoomDesignEnums();
              void loadSpecializations();
            },
          },
        ]}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip label={`Active: ${activeCount}`} color="success" variant="outlined" />
        <Chip label={`Inactive: ${totalCount - activeCount}`} variant="outlined" />
      </Stack>

      {pageError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <DesignTemplateTable
        templates={templates}
        loading={loading}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPageNumber}
        onRowsPerPageChange={setPageSize}
        onView={(template) => void openTemplateDialog('view', template)}
        onEdit={(template) => void openTemplateDialog('edit', template)}
        onManageTiers={(template) => void openTierDialog('create', template)}
        onDelete={handleDeleteTemplate}
        styleOptions={styleOptions}
        roomTypeOptions={roomTypeOptions}
      />

      <DesignTemplateFormDialog
        open={templateDialogOpen}
        mode={templateDialogMode}
        template={selectedTemplate}
        detailLoading={templateDetailLoading}
        detailError={templateDetailError}
        formValue={templateFormValue}
        styleOptions={styleOptions}
        roomTypeOptions={roomTypeOptions}
        specializationOptions={specializationOptions}
        submitting={templateSubmitting}
        onClose={closeTemplateDialog}
        onSubmit={handleSaveTemplate}
        onFormChange={setTemplateFormValue}
      />

      <DesignTemplateTierDialog
        open={tierDialogOpen}
        mode={tierDialogMode}
        template={selectedTemplate}
        tier={selectedTier}
        existingTiers={selectedTemplate?.tiers ?? []}
        detailLoading={tierDetailLoading}
        detailError={tierDetailError}
        formValue={tierFormValue}
        submitting={tierSubmitting}
        onClose={closeTierDialog}
        onSubmit={handleSaveTier}
        onFormChange={setTierFormValue}
        onEditExistingTier={handleEditExistingTier}
        onDeactivateExistingTier={handleDeleteTier}
      />

      <Dialog open={Boolean(deleteTemplateTarget)} onClose={() => setDeleteTemplateTarget(null)}>
        <DialogTitle>Delete template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove <strong>{deleteTemplateTarget?.name}</strong> from the admin list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTemplateTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDeleteTemplate()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTierTarget)} onClose={() => setDeleteTierTarget(null)}>
        <DialogTitle>Deactivate tier?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deactivate <strong>{deleteTierTarget?.tierName}</strong>? It will remain in history but stop being offered.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTierTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDeleteTier()}>
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
