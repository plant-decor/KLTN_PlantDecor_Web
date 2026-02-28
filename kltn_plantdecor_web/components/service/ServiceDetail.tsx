import React from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import { CareServicePackage, ServiceType, DifficultyLevel } from "@/types/service.types";

interface ServiceDetailProps {
  package: CareServicePackage | null;
  loading?: boolean;
  onRegister: () => void;
  onBack: () => void;
}

const difficultyColors: Record<DifficultyLevel, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
  [DifficultyLevel.EASY]: "success",
  [DifficultyLevel.MEDIUM]: "info",
  [DifficultyLevel.HARD]: "warning",
  [DifficultyLevel.EXPERT]: "error",
};

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
  package: servicePackage,
  loading = false,
  onRegister,
  onBack,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!servicePackage) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Không tìm thấy gói dịch vụ
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Quay Lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button variant="text" onClick={onBack} sx={{ mb: 3 }}>
        ← Quay Lại Danh Sách
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {servicePackage.name}
            </Typography>
            <Chip
              label={
                servicePackage.serviceType === ServiceType.ONETIME
                  ? "1 Lần"
                  : "Định Kỳ"
              }
              color={
                servicePackage.serviceType === ServiceType.ONETIME
                  ? "primary"
                  : "secondary"
              }
              size="medium"
            />
          </Box>

          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {servicePackage.description}
          </Typography>

          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Key Information */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography variant="overline" color="textSecondary">
                Giá Dịch Vụ
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>
                {servicePackage.unitPrice.toLocaleString('vi-VN')} ₫
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Typography variant="overline" color="textSecondary">
                Mức Độ Khó
              </Typography>
              <Chip
                label={servicePackage.difficultyLevel}
                color={difficultyColors[servicePackage.difficultyLevel]}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimelineIcon color="primary" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Thời Gian
                </Typography>
                <Typography variant="body2">
                  {servicePackage.durationDays} ngày
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <SquareFootIcon color="primary" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Diện Tích Tối Đa
                </Typography>
                <Typography variant="body2">
                  {servicePackage.areaLimit} m²
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {servicePackage.frequency && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
            <Typography variant="overline" color="primary">
              Tần Suất
            </Typography>
            <Typography variant="body2">
              {servicePackage.frequency}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Features List */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Các Công Việc Bao Gồm
          </Typography>
          <List>
            {servicePackage.features.map((feature, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleOutlineIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Installation Status */}
        <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="success" />
            <Typography variant="body2">
              {servicePackage.isActive ? "Gói dịch vụ đang hoạt động" : "Gói dịch vụ không khả dụng"}
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Box display="flex" gap={2} sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={onRegister}
            disabled={!servicePackage.isActive}
          >
            Đăng Ký Ngay
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            onClick={onBack}
          >
            Huỷ
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ServiceDetail;
