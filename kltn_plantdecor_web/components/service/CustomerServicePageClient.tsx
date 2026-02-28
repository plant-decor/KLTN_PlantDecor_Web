"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import ServiceCatalog from "@/components/service/ServiceCatalog";
import ServiceDetail from "@/components/service/ServiceDetail";
import ServiceRegistrationForm from "@/components/service/ServiceRegistrationForm";
import {
  CareServicePackage,
  ServiceRegistrationFormData,
} from "@/types/service.types";

type View = "catalog" | "detail" | "registration";

export const CustomerServicePageClient: React.FC = () => {
  const [view, setView] = useState<View>("catalog");
  const [packages, setPackages] = useState<CareServicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CareServicePackage | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch care service packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch("/api/services/packages");
        const data = await response.json();
        setPackages(data.data || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        // TODO: Show error toast/notification
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPackage = (packageId: number) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
      setView("detail");
    }
  };

  const handleRegisterClick = () => {
    setView("registration");
  };

  const handleBackClick = () => {
    setView("catalog");
    setSelectedPackage(null);
  };

  const handleSubmitRegistration = async (data: ServiceRegistrationFormData) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/services/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to register service");
      }

      const result = await response.json();
      
      // TODO: Show success notification and redirect to confirmation page
      console.log("Registration successful:", result);
      
      // Redirect or show success message
      setView("catalog");
      setSelectedPackage(null);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
  };

  if (loading && view === "catalog") {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {view === "catalog" && (
        <ServiceCatalog
          packages={packages}
          loading={loading}
          onSelectPackage={handleSelectPackage}
        />
      )}

      {view === "detail" && (
        <ServiceDetail
          package={selectedPackage}
          onRegister={handleRegisterClick}
          onBack={handleBackClick}
        />
      )}

      {view === "registration" && selectedPackage && (
        <ServiceRegistrationForm
          package={selectedPackage}
          onSubmit={handleSubmitRegistration}
          onCancel={handleBackClick}
        />
      )}
    </Box>
  );
};

export default CustomerServicePageClient;
