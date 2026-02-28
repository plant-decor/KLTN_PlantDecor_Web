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
        const response = await fetch("/api/services/packages");
        const data = await response.json();
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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save package");
      }

      const result = await response.json();
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
      const response = await fetch(`/api/services/packages/${packageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete package");
      }

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
      const response = await fetch(`/api/services/packages/${packageId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const result = await response.json();
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
