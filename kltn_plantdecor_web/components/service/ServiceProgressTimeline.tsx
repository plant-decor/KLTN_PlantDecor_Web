import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { ServiceRegistration, ServiceProgress } from "@/types/service.types";
import { formatDateTime } from "@/lib/utils/dateUtils";

interface ServiceProgressTimelineProps {
  registration: ServiceRegistration;
  progressLogs: ServiceProgress[];
  onSelectRegistration: (registration: ServiceRegistration) => void;
  back?: boolean;
}

export const ServiceProgressTimeline: React.FC<ServiceProgressTimelineProps> = ({
  registration,
  progressLogs,
  onSelectRegistration,
}) => {
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CHECK_IN: "Check-in",
      SURVEY: "Survey",
      WORK_IN_PROGRESS: "In progress",
      PHOTO_EVIDENCE: "Photo Evidence",
      ADDON_PROPOSAL: "Add-on Proposal",
      CHECK_OUT: "Check-out",
      COMPLETED: "Completed",
    };
    return labels[action] || action;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            📋 #{registration.id} - {registration.customer?.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {registration.servicePackage?.name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSelectRegistration(registration)}
        >
          View Details
        </Button>
      </Box>

      {progressLogs.length === 0 ? (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary">
            No progress updates available for this service registration yet. Please check back later or contact support for more information.
          </Typography>
        </Card>
      ) : (
        <Timeline>
          {progressLogs.map((log, index) => (
            <TimelineItem key={log.id}>
              <TimelineSeparator>
                <TimelineDot
                  color={
                    log.action === "COMPLETED"
                      ? "success"
                      : log.action === "CHECK_IN"
                        ? "primary"
                        : "inherit"
                  }
                >
                  {log.action === "COMPLETED" ? (
                    <CheckCircleIcon />
                  ) : (
                    <PendingIcon />
                  )}
                </TimelineDot>
                {index < progressLogs.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: 2 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {getActionLabel(log.action)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.createdAt ? formatDateTime(log.createdAt) : '-'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary">
                      {log.description}
                    </Typography>

                    {log.actualStartTime && (
                      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                        {log.actualStartTime ? formatDateTime(log.actualStartTime) : '-'}
                        {log.actualEndTime && ` - ${log.actualEndTime ? formatDateTime(log.actualEndTime) : '-'}`}
                      </Typography>
                    )}

                    {log.evidenceImageUrl && (
                      <Box mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          Photo Evidence
                        </Typography>
                        <Box
                          component="img"
                          src={log.evidenceImageUrl}
                          alt="Evidence"
                          sx={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 150,
                            borderRadius: 1,
                            mt: 1,
                            cursor: "pointer",
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
};

export default ServiceProgressTimeline;
