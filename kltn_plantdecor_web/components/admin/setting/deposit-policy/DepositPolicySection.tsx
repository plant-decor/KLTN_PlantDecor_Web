"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAdminDepositPolicies } from "@/lib/api/admin/useAdminDepositPolicies";
import type { DepositPolicy, DepositPolicyUpsertRequest } from "@/lib/api/depositPolicyService";
import ConfirmActionDialog from "@/components/admin/categories-tags/ConfirmActionDialog";
import DepositPolicyModal from "@/components/admin/setting/deposit-policy/DepositPolicyModal";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import { formatDateTime } from "@/lib/utils/dateUtils";
import { formatCurrency } from "@/lib/utils/formatUtil";
const toDisplayMax = (maxPrice: number | null): string => {
  if (maxPrice == null) {
    return "∞";
  }
  return formatCurrency(maxPrice, 'vi-VN');
};

const sortByMinPrice = (items: DepositPolicy[]) => {
  return [...items].sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
};

export default function DepositPolicySection() {
  const { policies, loading, error, fetchPolicies, addPolicy, updatePolicyItem, deletePolicy, clearError } =
    useAdminDepositPolicies();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPolicy, setEditingPolicy] = useState<DepositPolicy | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DepositPolicy | null>(null);
  const initialFetchDoneRef = useRef(false);

  useEffect(() => {
    if (initialFetchDoneRef.current) {
      return;
    }
    initialFetchDoneRef.current = true;
    void fetchPolicies();
  }, [fetchPolicies]);

  const sortedPolicies = useMemo(() => sortByMinPrice(policies ?? []), [policies]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingPolicy(undefined);
    setModalOpen(true);
  };

  const handleOpenEdit = (policy: DepositPolicy) => {
    setModalMode("edit");
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: DepositPolicyUpsertRequest): Promise<boolean> => {
    if (modalMode === "edit" && editingPolicy?.id) {
      const updated = await updatePolicyItem(editingPolicy.id, payload);
      return Boolean(updated);
    }

    const created = await addPolicy(payload);
    return Boolean(created);
  };

  const handleRequestDelete = (policy: DepositPolicy) => {
    setDeleteTarget(policy);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const ok = await deletePolicy(deleteTarget.id);
    if (ok) {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ...hoverLiftStyle }}
          className="bg-primary!"
          onClick={handleOpenCreate}
          disabled={loading}
        >
          Add deposit policy
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Deposit policies
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--primary)' }}>
                  <TableCell sx={{ fontWeight: 700 }} align="center">ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Min price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Max price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Deposit %</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Updated at</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedPolicies.length > 0 ? (
                  sortedPolicies.map((policy) => (
                    <TableRow key={policy.id} hover>
                      <TableCell align="center">{policy.id}</TableCell>
                      <TableCell align="center">{formatCurrency(policy.minPrice, 'vi-VN')}</TableCell>
                      <TableCell align="center">{toDisplayMax(policy.maxPrice)}</TableCell>
                      <TableCell align="center">{policy.depositPercentage}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={policy.isActive ? "Active" : "Inactive"}
                          color={policy.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="center">{policy.updatedAt ? formatDateTime(policy.updatedAt) : "-"}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(policy)}
                          disabled={loading}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRequestDelete(policy)}
                          disabled={loading}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" sx={{ color: "#999", textAlign: "center", py: 3 }}>
                        No deposit policies yet. Create one to get started!
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <DepositPolicyModal
        open={modalOpen}
        mode={modalMode}
        policy={editingPolicy}
        existingPolicies={sortedPolicies}
        loading={loading}
        onClose={() => {
          setModalOpen(false);
          setEditingPolicy(undefined);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmActionDialog
        open={deleteConfirmOpen}
        title="Confirm Delete Deposit Policy"
        message={
          deleteTarget
            ? `Are you sure you want to delete this policy (${formatCurrency(deleteTarget.minPrice, 'vi-VN')} - ${
                deleteTarget.maxPrice == null ? "∞" : formatCurrency(deleteTarget.maxPrice, 'vi-VN')
              })? This action cannot be undone.`
            : "Are you sure you want to delete this policy? This action cannot be undone."
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={loading}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

