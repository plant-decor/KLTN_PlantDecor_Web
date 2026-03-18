"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CarePackageManagementTable from "@/components/service/CarePackageManagementTable";
import CarePackageForm from "@/components/service/CarePackageForm";
import {
  CareServicePackage,
  CareServicePackageFormData,
} from "@/types/service.types";
import { del, get, patch, post, put } from '@/lib/api/apiService';

export const AdminCarePackagePageClient: React.FC = () => {
  const [packages, setPackages] = useState<CareServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CareServicePackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch care packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        const data = await get<CareServicePackage[]>('/api/services/packages', undefined, false);
        setPackages(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching packages";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleOpenForm = (pkg?: CareServicePackage) => {
    if (pkg) {
      setSelectedPackage(pkg);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedPackage(null);
  };

  const handleSubmitForm = async (data: CareServicePackageFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const url = selectedPackage
        ? `/api/services/packages/${selectedPackage.id}`
        : "/api/services/packages";
      
      const method = selectedPackage ? "PUT" : "POST";

      const result = method === 'PUT'
        ? await put<CareServicePackage>(url, data)
        : await post<CareServicePackage>(url, data);
      const message = selectedPackage ? "Cập nhật gói thành công" : "Tạo gói thành công";
      
      setSuccess(message);
      setFormOpen(false);
      setSelectedPackage(null);

      // Refresh list
      setPackages((prev) =>
        selectedPackage
          ? prev.map((p) => (p.id === selectedPackage.id ? result.data : p))
          : [...prev, result.data]
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (packageId: number) => {
    try {
      // TODO: Replace with actual API call
      await del(`/api/services/packages/${packageId}`);

      setPackages((prev) => prev.filter((p) => p.id !== packageId));
      setSuccess("Xoá gói thành công");
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error deleting package";
      setError(message);
    }
  };

  const handleStatusToggle = async (packageId: number, isActive: boolean) => {
    try {
      // TODO: Replace with actual API call
      const result = await patch<CareServicePackage>(`/api/services/packages/${packageId}/status`, { isActive });
      setPackages((prev) =>
        prev.map((p) => (p.id === packageId ? result.data : p))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error updating status";
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Quản Lý Gói Dịch Vụ
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Tạo Gói Mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <CarePackageManagementTable
          packages={packages}
          loading={loading}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
          onStatusToggle={handleStatusToggle}
        />
      )}

      <CarePackageForm
        open={formOpen}
        package={selectedPackage || undefined}
        onSubmit={handleSubmitForm}
        onClose={handleCloseForm}
        loading={submitting}
      />
    </Container>
  );
};

export default AdminCarePackagePageClient;
