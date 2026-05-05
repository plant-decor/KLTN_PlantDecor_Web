'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { toast } from 'react-toastify';
import ManagementHeader from '@/components/layout/ManagementHeader';
import DesignTemplateFormDialog, { type DesignTemplateFormValue } from '@/components/design-template-management/DesignTemplateFormDialog';
import DesignTemplateTierDialog, { type DesignTemplateTierFormValue } from '@/components/design-template-management/DesignTemplateTierDialog';
import { mapRoomTypeOptions, mapStyleOptions } from '@/components/design-template-management/designTemplateManagement.constants';
import {
  fetchRoomDesignEnumOptionsForTemplates,
  getAdminDesignTemplateDetail,
} from '@/lib/api/adminDesignTemplatesService';
import {
  createNurseryDesignTemplate,
  deleteNurseryDesignTemplate,
  getMyNurseryDesignTemplates,
  getNotOfferedDesignTemplates,
  toggleNurseryDesignTemplate,
} from '@/lib/api/managerNurseryDesignTemplatesService';
import type {
  AdminDesignTemplateDetail,
  DesignTemplateRoomTypeOption,
  DesignTemplateStyleOption,
  DesignTemplateTier,
} from '@/types/admin-design-template.types';
import type { ManagerNotOfferedDesignTemplate, ManagerNurseryDesignTemplateListItem } from '@/types/manager-design-template.types';
import {
  getNurseryDesignTemplateErrorMessage,
  type NurseryDesignTemplateListFilter,
} from './managerNurseryDesignTemplate.constants';
import ManagerNurseryDesignTemplateDialogs from './ManagerNurseryDesignTemplateDialogs';
import ManagerNurseryDesignTemplateHeader from './ManagerNurseryDesignTemplateHeader';
import ManagerNurseryDesignTemplatesTable from './ManagerNurseryDesignTemplatesTable';

const emptyTemplateForm = (defaultStyle = 1): DesignTemplateFormValue => ({
  name: '',
  description: '',
  style: defaultStyle,
  roomTypes: [],
  imageFile: null,
  specializationIds: [],
});

const emptyTierFormValue = (): DesignTemplateTierFormValue => ({
  tierName: '',
  minArea: 0,
  maxArea: 0,
  packagePrice: 0,
  scopedOfWork: '',
  estimatedDays: 1,
  isActive: true,
  items: [{ materialId: null, plantId: null, itemType: 1, quantity: 1 }],
});

const mapTierToFormValue = (tier: DesignTemplateTier): DesignTemplateTierFormValue => ({
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

export default function ManagerNurseryDesignTemplateManagementPageClient() {
  const [items, setItems] = useState<ManagerNurseryDesignTemplateListItem[]>([]);
  const [listFilter, setListFilter] = useState<NurseryDesignTemplateListFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notOfferedTemplates, setNotOfferedTemplates] = useState<ManagerNotOfferedDesignTemplate[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<ManagerNurseryDesignTemplateListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerNurseryDesignTemplateListItem | null>(null);

  const [styleOptions, setStyleOptions] = useState<DesignTemplateStyleOption[]>([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState<DesignTemplateRoomTypeOption[]>([]);
  const [templateDetailOpen, setTemplateDetailOpen] = useState(false);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<AdminDesignTemplateDetail | null>(null);
  const [templateDetailLoading, setTemplateDetailLoading] = useState(false);
  const [templateDetailError, setTemplateDetailError] = useState<string | null>(null);
  const [templateFormValue, setTemplateFormValue] = useState<DesignTemplateFormValue>(emptyTemplateForm());

  const [tierViewDialogOpen, setTierViewDialogOpen] = useState(false);
  const [tierViewSelected, setTierViewSelected] = useState<DesignTemplateTier | null>(null);
  const [tierViewFormValue, setTierViewFormValue] = useState<DesignTemplateTierFormValue>(emptyTierFormValue());

  const { activeCount, inactiveCount } = useMemo(() => {
    if (listFilter === 'active') {
      return { activeCount: items.length, inactiveCount: 0 };
    }
    const active = items.filter((item) => item.isActive).length;
    return { activeCount: active, inactiveCount: items.length - active };
  }, [items, listFilter]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const activeOnly = listFilter === 'active';
      const [currentMappings, availableTemplates] = await Promise.all([
        getMyNurseryDesignTemplates(activeOnly, false),
        getNotOfferedDesignTemplates(false),
      ]);

      setItems(currentMappings);
      setNotOfferedTemplates(availableTemplates);
    } catch (loadError) {
      const message = getNurseryDesignTemplateErrorMessage(loadError, 'Cannot load nursery design templates');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [listFilter]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const loadRoomDesignEnums = useCallback(async () => {
    try {
      const response = await fetchRoomDesignEnumOptionsForTemplates(false);
      setStyleOptions(mapStyleOptions(response.roomStyles));
      setRoomTypeOptions(mapRoomTypeOptions(response.roomTypes));
    } catch (loadError) {
      toast.error(getNurseryDesignTemplateErrorMessage(loadError, 'Cannot load room design enums'));
    }
  }, []);

  useEffect(() => {
    void loadRoomDesignEnums();
  }, [loadRoomDesignEnums]);

  const closeTierViewDialog = useCallback(() => {
    setTierViewDialogOpen(false);
    setTierViewSelected(null);
    setTierViewFormValue(emptyTierFormValue());
  }, []);

  const closeTemplateDetailDialog = useCallback(() => {
    closeTierViewDialog();
    setTemplateDetailOpen(false);
    setSelectedTemplateDetail(null);
    setTemplateDetailError(null);
    setTemplateFormValue(emptyTemplateForm(styleOptions[0]?.value ?? 1));
  }, [closeTierViewDialog, styleOptions]);

  const handleViewTierFromTemplate = useCallback((tier: DesignTemplateTier) => {
    setTierViewSelected(tier);
    setTierViewFormValue(mapTierToFormValue(tier));
    setTierViewDialogOpen(true);
  }, []);

  const handleTierViewSelectExisting = useCallback((tier: DesignTemplateTier) => {
    setTierViewSelected(tier);
    setTierViewFormValue(mapTierToFormValue(tier));
  }, []);

  const handleBackToTierListInViewDialog = useCallback(() => {
    setTierViewSelected(null);
    setTierViewFormValue(emptyTierFormValue());
  }, []);

  const noopTierListAction = useCallback((tier: DesignTemplateTier) => {
    void tier;
  }, []);

  const handleViewDesignTemplateDetail = useCallback(
    async (row: ManagerNurseryDesignTemplateListItem) => {
      setTemplateDetailOpen(true);
      setTemplateDetailError(null);
      setTemplateDetailLoading(true);
      setSelectedTemplateDetail(null);
      setTemplateFormValue(emptyTemplateForm(styleOptions[0]?.value ?? 1));
      try {
        const detail = await getAdminDesignTemplateDetail(row.designTemplateId, false);
        setSelectedTemplateDetail(detail);
        setTemplateFormValue({
          name: detail.name,
          description: detail.description,
          style: detail.style,
          roomTypes: detail.roomTypes,
          imageFile: null,
          specializationIds: detail.specializations.map((s) => s.id),
        });
      } catch (loadError) {
        const message = getNurseryDesignTemplateErrorMessage(loadError, 'Cannot load design template detail');
        setTemplateDetailError(message);
        toast.error(message);
      } finally {
        setTemplateDetailLoading(false);
      }
    },
    [styleOptions]
  );

  const handleOpenAddDialog = useCallback(async () => {
    try {
      const availableTemplates = await getNotOfferedDesignTemplates(false);
      setNotOfferedTemplates(availableTemplates);
      setSelectedTemplateId(availableTemplates[0]?.id ?? 0);
      setAddDialogOpen(true);
    } catch (loadError) {
      toast.error(getNurseryDesignTemplateErrorMessage(loadError, 'Cannot load available design templates'));
    }
  }, []);

  const handleAddTemplate = useCallback(async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a design template');
      return;
    }

    try {
      setSubmitting(true);
      await createNurseryDesignTemplate({ designTemplateId: selectedTemplateId }, false);
      toast.success('Design template added to nursery successfully');
      setAddDialogOpen(false);
      await loadInitialData();
    } catch (addError) {
      toast.error(getNurseryDesignTemplateErrorMessage(addError, 'Cannot add design template'));
    } finally {
      setSubmitting(false);
    }
  }, [loadInitialData, selectedTemplateId]);

  const handleToggle = useCallback(async () => {
    if (!toggleTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await toggleNurseryDesignTemplate(toggleTarget.id, false);
      toast.success(
        toggleTarget.isActive
          ? 'Nursery design template deactivated successfully'
          : 'Nursery design template activated successfully'
      );
      setToggleTarget(null);
      await loadInitialData();
    } catch (toggleError) {
      toast.error(getNurseryDesignTemplateErrorMessage(toggleError, 'Cannot change mapping status'));
    } finally {
      setSubmitting(false);
    }
  }, [loadInitialData, toggleTarget]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteNurseryDesignTemplate(deleteTarget.id, false);
      toast.success('Design template removed from nursery successfully');
      setDeleteTarget(null);
      await loadInitialData();
    } catch (deleteError) {
      toast.error(getNurseryDesignTemplateErrorMessage(deleteError, 'Cannot remove design template'));
    } finally {
      setSubmitting(false);
    }
  }, [deleteTarget, loadInitialData]);

  return (
    <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <ManagementHeader
        title="Nursery Design Templates"
        description="Manage which design templates are offered by your nursery."
        entityLabel="nursery design template"
        count={items.length}
        actionLabel="Add Template"
        onAction={() => void handleOpenAddDialog()}
      />

      <ManagerNurseryDesignTemplateHeader
        listFilter={listFilter}
        onListFilterChange={setListFilter}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ManagerNurseryDesignTemplatesTable
        items={items}
        loading={loading}
        onViewDetailClick={(row) => void handleViewDesignTemplateDetail(row)}
        onToggleClick={setToggleTarget}
        onDeleteClick={setDeleteTarget}
      />

      <DesignTemplateFormDialog
        open={templateDetailOpen}
        mode="view"
        template={selectedTemplateDetail}
        detailLoading={templateDetailLoading}
        detailError={templateDetailError}
        formValue={templateFormValue}
        styleOptions={styleOptions}
        roomTypeOptions={roomTypeOptions}
        specializationOptions={[]}
        submitting={false}
        onClose={closeTemplateDetailDialog}
        onSubmit={async () => {}}
        onFormChange={setTemplateFormValue}
        onViewTier={handleViewTierFromTemplate}
      />

      <DesignTemplateTierDialog
        open={tierViewDialogOpen}
        mode="view"
        template={selectedTemplateDetail}
        tier={tierViewSelected}
        existingTiers={selectedTemplateDetail?.tiers ?? []}
        showCreateTierForm={false}
        detailLoading={false}
        detailError={null}
        formValue={tierViewFormValue}
        submitting={false}
        onClose={closeTierViewDialog}
        onSubmit={async () => {}}
        onFormChange={setTierViewFormValue}
        onEditExistingTier={noopTierListAction}
        onViewExistingTier={handleTierViewSelectExisting}
        onDeactivateExistingTier={noopTierListAction}
        onBackToTierList={handleBackToTierListInViewDialog}
      />

      <ManagerNurseryDesignTemplateDialogs
        addDialogOpen={addDialogOpen}
        onCloseAddDialog={() => setAddDialogOpen(false)}
        notOfferedTemplates={notOfferedTemplates}
        selectedTemplateId={selectedTemplateId}
        onSelectedTemplateIdChange={setSelectedTemplateId}
        onConfirmAdd={() => void handleAddTemplate()}
        submitting={submitting}
        toggleTarget={toggleTarget}
        onCloseToggleDialog={() => setToggleTarget(null)}
        onConfirmToggle={() => void handleToggle()}
        deleteTarget={deleteTarget}
        onCloseDeleteDialog={() => setDeleteTarget(null)}
        onConfirmDelete={() => void handleDelete()}
      />
    </Box>
  );
}
