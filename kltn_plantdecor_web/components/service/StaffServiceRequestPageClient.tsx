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
        const response = await fetch(
          `/api/services/registrations?status=${ServiceRegistrationStatus.PENDING_CONFIRMATION}`
        );
        const data = await response.json();
        setRequests(data.data || []);
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
      const response = await fetch(
        `/api/services/registrations/${selectedRequest.id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mainCaretakerId: caretakerId,
            estimatedDuration,
            status: ServiceRegistrationStatus.CONFIRMED,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to confirm request");
      }

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
      const response = await fetch(
        `/api/services/registrations/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: ServiceRegistrationStatus.REJECTED,
            cancelReason: reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

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
