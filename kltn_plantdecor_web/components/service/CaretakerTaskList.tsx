import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Button,
  Chip,
  Container,
  CircularProgress,
  Avatar,
  Badge,
  LinearProgress,
  Grid,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import { ServiceRegistration, ServiceRegistrationStatus } from "@/types/service.types";

interface CaretakerTaskListProps {
  tasks: ServiceRegistration[];
  loading?: boolean;
  onSelectTask: (task: ServiceRegistration) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
    [ServiceRegistrationStatus.CONFIRMED]: "info",
    [ServiceRegistrationStatus.IN_PROGRESS]: "warning",
    [ServiceRegistrationStatus.COMPLETED]: "success",
  };
  return colors[status] || "default";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    [ServiceRegistrationStatus.CONFIRMED]: "Sắp Thực Hiện",
    [ServiceRegistrationStatus.IN_PROGRESS]: "Đang Thực Hiện",
    [ServiceRegistrationStatus.COMPLETED]: "Hoàn Thành",
  };
  return labels[status] || status;
};

export const CaretakerTaskList: React.FC<CaretakerTaskListProps> = ({
  tasks,
  loading = false,
  onSelectTask,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Hôm nay không có công việc
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        📅 Lịch Trình Hôm Nay ({tasks.length} công việc)
      </Typography>

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid size={{ xs: 12, md: 6 }} key={task.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                borderLeft: `4px solid ${
                  task.status === ServiceRegistrationStatus.IN_PROGRESS
                    ? "#ff9800"
                    : task.status === ServiceRegistrationStatus.COMPLETED
                    ? "#4caf50"
                    : "#2196f3"
                }`,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Badge
                      badgeContent={task.id}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#2196f3",
                          color: "#2196f3",
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {task.customer?.name?.charAt(0) || "C"}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {task.customer?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {task.servicePackage?.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={getStatusLabel(task.status)}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </Box>

                {/* Progress bar for in-progress tasks */}
                {task.status === ServiceRegistrationStatus.IN_PROGRESS && (
                  <LinearProgress
                    variant="determinate"
                    value={65}
                    sx={{ mb: 2, borderRadius: 1 }}
                  />
                )}

                {/* Time */}
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: "warning.main" }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Thời Gian
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {new Date(task.serviceDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* Location */}
                <Box display="flex" alignItems="flex-start" gap={1} mb={1.5}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "error.main", mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Địa Chỉ
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {task.address.split(",")[0]}
                    </Typography>
                  </Box>
                </Box>

                {/* Phone */}
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon sx={{ fontSize: 18, color: "success.main" }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Số Điện Thoại
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", cursor: "pointer", color: "primary.main" }}
                    >
                      {task.phone}
                    </Typography>
                  </Box>
                </Box>

                {/* Notes */}
                {task.note && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff3e0", borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      📝 Ghi chú:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {task.note.substring(0, 80)}...
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color={
                    task.status === ServiceRegistrationStatus.IN_PROGRESS
                      ? "warning"
                      : "primary"
                  }
                  onClick={() => onSelectTask(task)}
                >
                  {task.status === ServiceRegistrationStatus.IN_PROGRESS
                    ? "Tiếp Tục Công Việc"
                    : "Chi Tiết & Bắt Đầu"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CaretakerTaskList;
