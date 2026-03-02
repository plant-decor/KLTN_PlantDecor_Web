"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import CaretakerTaskList from "@/components/service/CaretakerTaskList";
import CaretakerJobDetail from "@/components/service/CaretakerJobDetail";
import {
  ServiceRegistration,
  ServiceRegistrationStatus,
  ServiceProgressAction,
} from "@/types/service.types";

type View = "list" | "detail";

interface AddOnProposal {
  name: string;
  description: string;
  estimatedPrice: number;
}

export const CaretakerTaskPageClient: React.FC = () => {
  const [view, setView] = useState<View>("list");
  const [tasks, setTasks] = useState<ServiceRegistration[]>([]);
  const [selectedTask, setSelectedTask] = useState<ServiceRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's confirmed and in-progress tasks for caretaker
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call - should filter by current caretaker and today's date
        const response = await fetch(
          `/api/services/caretaker/tasks?date=${new Date().toISOString().split('T')[0]}`
        );
        const data = await response.json();
        setTasks(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching tasks";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSelectTask = (task: ServiceRegistration) => {
    setSelectedTask(task);
    setView("detail");
  };

  const handleBackClick = () => {
    setView("list");
    setSelectedTask(null);
  };

  const handleCheckIn = async () => {
    if (!selectedTask) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/services/registrations/${selectedTask.id}/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: ServiceProgressAction.CHECK_IN,
            description: "Caretaker checked in at the location",
            actualStartTime: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check in");
      }

      // Update task status to IN_PROGRESS
      setSelectedTask({
        ...selectedTask,
        status: ServiceRegistrationStatus.IN_PROGRESS,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error checking in";
      setError(message);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedTask) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/services/registrations/${selectedTask.id}/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: ServiceProgressAction.CHECK_OUT,
            description: "Caretaker checked out",
            actualEndTime: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check out");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error checking out";
      setError(message);
    }
  };

  const handleUploadEvidence = async (photos: File[]) => {
    if (!selectedTask) return;

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/services/registrations/${selectedTask.id}/evidence`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload evidence");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error uploading photos";
      setError(message);
      throw err;
    }
  };

  const handleSubmitSurvey = async (
    description: string,
    addOns: AddOnProposal[]
  ) => {
    if (!selectedTask) return;

    try {
      // TODO: Replace with actual API call - submit survey and add-on proposals
      const response = await fetch(
        `/api/services/registrations/${selectedTask.id}/survey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: ServiceProgressAction.SURVEY,
            description,
            addOns,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      // Update task status
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: ServiceRegistrationStatus.COMPLETED }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error submitting survey";
      setError(message);
      throw err;
    }
  };

  if (error) {
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
        <CaretakerTaskList
          tasks={tasks}
          loading={loading}
          onSelectTask={handleSelectTask}
        />
      )}

      {view === "detail" && (
        <CaretakerJobDetail
          task={selectedTask}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onUploadEvidence={handleUploadEvidence}
          onSubmitSurvey={handleSubmitSurvey}
          onBack={handleBackClick}
        />
      )}
    </Box>
  );
};

export default CaretakerTaskPageClient;
