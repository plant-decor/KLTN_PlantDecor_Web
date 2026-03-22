"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import ServiceRequestList from "@/components/service/ServiceRequestList";
import ServiceRequestDetail from "@/components/service/ServiceRequestDetail";
import {
  ServiceRegistration,
  ServiceRegistrationStatus,
} from "@/types/service.types";
import { get, post } from '@/lib/api/apiService';

type View = "list" | "detail";

export const StaffServiceRequestPageClient: React.FC = () => {
  const [view, setView] = useState<View>("list");
  const [requests, setRequests] = useState<ServiceRegistration[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending service requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        const data = await get<ServiceRegistration[]>(
          '/api/services/registrations',
          { status: ServiceRegistrationStatus.PENDING_CONFIRMATION },
          false
        );
        setRequests(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching requests";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleSelectRequest = (request: ServiceRegistration) => {
    setSelectedRequest(request);
    setView("detail");
  };

  const handleBackClick = () => {
    setView("list");
    setSelectedRequest(null);
  };

  const handleConfirmRequest = async (caretakerId: number, estimatedDuration: number) => {
    if (!selectedRequest) return;

    try {
      // TODO: Replace with actual API call
      await post(`/api/services/registrations/${selectedRequest.id}/confirm`, {
        mainCaretakerId: caretakerId,
        estimatedDuration,
        status: ServiceRegistrationStatus.CONFIRMED,
      }, false);

      // Remove from list and go back
      setRequests((prev) =>
        prev.filter((r) => r.id !== selectedRequest.id)
      );
      setView("list");
      setSelectedRequest(null);
    } catch (err) {
      throw err;
    }
  };

  const handleRejectRequest = async (reason: string) => {
    if (!selectedRequest) return;

    try {
      // TODO: Replace with actual API call
      await post(`/api/services/registrations/${selectedRequest.id}/reject`, {
        status: ServiceRegistrationStatus.REJECTED,
        cancelReason: reason,
      }, false);

      // Remove from list and go back
      setRequests((prev) =>
        prev.filter((r) => r.id !== selectedRequest.id)
      );
      setView("list");
      setSelectedRequest(null);
    } catch (err) {
      throw err;
    }
  };

  if (error && view === "list") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {view === "list" && (
        <ServiceRequestList
          requests={requests}
          loading={loading}
          onSelectRequest={handleSelectRequest}
        />
      )}

      {view === "detail" && (
        <ServiceRequestDetail
          request={selectedRequest}
          onConfirm={handleConfirmRequest}
          onReject={handleRejectRequest}
          onBack={handleBackClick}
        />
      )}
    </Box>
  );
};

export default StaffServiceRequestPageClient;
