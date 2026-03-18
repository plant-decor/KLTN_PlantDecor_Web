"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import ServiceProgressTimeline from "@/components/service/ServiceProgressTimeline";
import ServiceProgressDetail from "@/components/service/ServiceProgressDetail";
import {
  ServiceRegistration,
  ServiceRegistrationStatus,
  ServiceProgress,
  AddOnService,
} from "@/types/service.types";
import { get, post } from '@/lib/api/apiService';

type View = "timeline" | "detail";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const StaffServiceProgressPageClient: React.FC = () => {
  const [view, setView] = useState<View>("timeline");
  const [inProgressServices, setInProgressServices] = useState<ServiceRegistration[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceRegistration | null>(null);
  const [progressLogs, setProgressLogs] = useState<ServiceProgress[]>([]);
  const [addOns, setAddOns] = useState<AddOnService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch in-progress services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        const data = await get<ServiceRegistration[]>(
          '/api/services/registrations',
          { status: ServiceRegistrationStatus.IN_PROGRESS },
          false
        );
        setInProgressServices(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching services";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelectService = async (service: ServiceRegistration) => {
    try {
      setSelectedService(service);
      setView("detail");

      // Fetch progress logs and add-ons for this service
      const [progressData, addOnsData] = await Promise.all([
        get<ServiceProgress[]>(`/api/services/registrations/${service.id}/progress`, undefined, false),
        get<AddOnService[]>(`/api/services/registrations/${service.id}/addons`, undefined, false),
      ]);

      setProgressLogs(progressData.data || []);
      setAddOns(addOnsData.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching service details";
      setError(message);
    }
  };

  const handleBackClick = () => {
    setView("timeline");
    setSelectedService(null);
    setProgressLogs([]);
    setAddOns([]);
  };

  const handleApproveAddOn = async (addOnId: number) => {
    try {
      // TODO: Replace with actual API call
      await post(`/api/services/addons/${addOnId}/approve`);

      // Update local state
      setAddOns((prev) =>
        prev.map((a) =>
          a.id === addOnId ? { ...a, status: "APPROVED" } : a
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error approving add-on";
      setError(message);
    }
  };

  const handleRejectAddOn = async (addOnId: number, reason: string) => {
    try {
      // TODO: Replace with actual API call
      await post(`/api/services/addons/${addOnId}/reject`, { reason });

      // Update local state
      setAddOns((prev) =>
        prev.map((a) =>
          a.id === addOnId ? { ...a, status: "REJECTED" } : a
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error rejecting add-on";
      setError(message);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedService) return;

    try {
      // TODO: Replace with actual API call
      await post(`/api/services/registrations/${selectedService.id}/invoice`);

      // Update service status to COMPLETED
      setInProgressServices((prev) =>
        prev.map((s) =>
          s.id === selectedService.id
            ? { ...s, status: ServiceRegistrationStatus.COMPLETED }
            : s
        )
      );

      setView("timeline");
      setSelectedService(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error generating invoice";
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {view === "timeline" && (
        <>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label={`Đang Thực Hiện (${inProgressServices.length})`} />
            <Tab label="Hướng Dẫn" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : inProgressServices.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <p>Không có dịch vụ nào đang thực hiện</p>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {inProgressServices.map((service) => (
                  <Box key={service.id}>
                    <ServiceProgressTimeline
                      registration={service}
                      progressLogs={[]}
                      onSelectRegistration={handleSelectService}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <h3>Hướng Dẫn Theo Dõi Tiến Độ</h3>
              <ul>
                <li>Click "Xem Chi Tiết" để xem chi tiết từng dịch vụ</li>
                <li>Xem các update tiến độ từ nhân viên chăm sóc</li>
                <li>Duyệt hoặc từ chối dịch vụ phát sinh</li>
                <li>Tạo hóa đơn khi hoàn thành</li>
              </ul>
            </Box>
          </TabPanel>
        </>
      )}

      {view === "detail" && (
        <ServiceProgressDetail
          registration={selectedService}
          progressLogs={progressLogs}
          addOns={addOns}
          onApproveAddOn={handleApproveAddOn}
          onRejectAddOn={handleRejectAddOn}
          onGenerateInvoice={handleGenerateInvoice}
          onBack={handleBackClick}
        />
      )}
    </Container>
  );
};

export default StaffServiceProgressPageClient;
