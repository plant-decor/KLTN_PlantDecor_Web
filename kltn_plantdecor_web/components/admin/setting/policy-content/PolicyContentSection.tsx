"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAdminPolicyContents } from "@/lib/api/admin/useAdminPolicyContents";
import type {
  PolicyContent,
  PolicyContentUpsertRequest,
} from "@/lib/api/policyContentService";
import {
  POLICY_CATEGORIES,
  getCategoryLabel,
} from "@/lib/constants/policyCategories";
import ConfirmActionDialog from "@/components/admin/categories-tags/ConfirmActionDialog";
import PolicyContentModal from "@/components/admin/setting/policy-content/PolicyContentModal";
import { hoverLiftStyle } from "@/lib/styles/buttonStyles";
import { formatDateTime } from "@/lib/utils/dateUtils";

const ALL_CATEGORIES = "all" as const;

type CategoryFilterValue = number | typeof ALL_CATEGORIES;

const truncate = (text: string, max = 80): string => {
  if (!text) {
    return "";
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trimEnd()}…`;
};

const sortPolicies = (items: PolicyContent[]): PolicyContent[] => {
  return [...items].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category - b.category;
    }
    return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
  });
};

export default function PolicyContentSection() {
  const {
    policies,
    loading,
    error,
    fetchPolicies,
    addPolicy,
    updatePolicyItem,
    togglePolicyStatus,
    clearError,
  } = useAdminPolicyContents();

  const [includeInactive, setIncludeInactive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(ALL_CATEGORIES);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPolicy, setEditingPolicy] = useState<PolicyContent | undefined>(undefined);

  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<PolicyContent | null>(null);

  const initialFetchDoneRef = useRef(false);

  useEffect(() => {
    if (initialFetchDoneRef.current) {
      return;
    }
    initialFetchDoneRef.current = true;
    void fetchPolicies(includeInactive);
  }, [fetchPolicies, includeInactive]);

  const handleToggleIncludeInactive = (checked: boolean) => {
    setIncludeInactive(checked);
    void fetchPolicies(checked);
  };

  const sortedPolicies = useMemo(() => sortPolicies(policies ?? []), [policies]);

  const filteredPolicies = useMemo(() => {
    if (categoryFilter === ALL_CATEGORIES) {
      return sortedPolicies;
    }
    return sortedPolicies.filter((p) => p.category === categoryFilter);
  }, [sortedPolicies, categoryFilter]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingPolicy(undefined);
    setModalOpen(true);
  };

  const handleOpenEdit = (policy: PolicyContent) => {
    setModalMode("edit");
    setEditingPolicy(policy);
    setModalOpen(true);
  };

  const handleSubmit = async (
    payload: PolicyContentUpsertRequest
  ): Promise<boolean> => {
    if (modalMode === "edit" && editingPolicy?.id) {
      const updated = await updatePolicyItem(editingPolicy.id, payload);
      return Boolean(updated);
    }

    const created = await addPolicy(payload);
    return Boolean(created);
  };

  const handleRequestToggleStatus = (policy: PolicyContent) => {
    setStatusTarget(policy);
    setStatusConfirmOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) {
      return;
    }

    const next = !statusTarget.isActive;
    const result = await togglePolicyStatus(statusTarget.id, next);
    if (result) {
      setStatusConfirmOpen(false);
      setStatusTarget(null);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2, alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="policy-category-filter-label">Category</InputLabel>
            <Select
              labelId="policy-category-filter-label"
              label="Category"
              value={categoryFilter}
              onChange={(e) => {
                const v = e.target.value;
                if (v === ALL_CATEGORIES) {
                  setCategoryFilter(ALL_CATEGORIES);
                } else {
                  setCategoryFilter(Number(v));
                }
              }}
            >
              <MenuItem value={ALL_CATEGORIES}>All categories</MenuItem>
              {POLICY_CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => handleToggleIncludeInactive(e.target.checked)}
                disabled={loading}
              />
            }
            label="Show inactive"
          />
        </Stack>

        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ ...hoverLiftStyle }}
            className="bg-primary!"
            onClick={handleOpenCreate}
            disabled={loading}
          >
            Add policy content
          </Button>
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Policy contents
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "var(--primary)" }}>
                  <TableCell sx={{ fontWeight: 700 }} align="center">ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Summary</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Order</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Updated at</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPolicies.length > 0 ? (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id} hover>
                      <TableCell align="center">{policy.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {policy.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={getCategoryLabel(policy.category)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Tooltip title={policy.summary || ""} placement="top">
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#555",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {truncate(policy.summary ?? "", 80)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">{policy.displayOrder}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={policy.isActive ? "Active" : "Inactive"}
                          color={policy.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {policy.updatedAt ? formatDateTime(policy.updatedAt) : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEdit(policy)}
                              disabled={loading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={policy.isActive ? "Deactivate" : "Activate"}>
                          <span>
                            <IconButton
                              size="small"
                              color={policy.isActive ? "warning" : "success"}
                              onClick={() => handleRequestToggleStatus(policy)}
                              disabled={loading}
                            >
                              {policy.isActive ? (
                                <ToggleOffIcon fontSize="small" />
                              ) : (
                                <ToggleOnIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#999", textAlign: "center", py: 3 }}
                      >
                        {loading
                          ? "Loading policy contents..."
                          : "No policy contents found. Create one to get started!"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <PolicyContentModal
        open={modalOpen}
        mode={modalMode}
        policy={editingPolicy}
        loading={loading}
        onClose={() => {
          setModalOpen(false);
          setEditingPolicy(undefined);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmActionDialog
        open={statusConfirmOpen}
        title={
          statusTarget?.isActive
            ? "Deactivate policy content"
            : "Activate policy content"
        }
        message={
          statusTarget
            ? statusTarget.isActive
              ? `Are you sure you want to deactivate "${statusTarget.title}"? Users will no longer see this policy.`
              : `Are you sure you want to activate "${statusTarget.title}"? It will become visible to users.`
            : "Are you sure?"
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        confirmColor={statusTarget?.isActive ? "warning" : "success"}
        loading={loading}
        onClose={() => {
          setStatusConfirmOpen(false);
          setStatusTarget(null);
        }}
        onConfirm={handleConfirmToggleStatus}
      />
    </>
  );
}
