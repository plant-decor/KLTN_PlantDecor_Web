import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Rating,
  Container,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  CareServicePackage,
  DifficultyLevel,
  ServiceType,
} from "@/types/service.types";

interface ServiceCatalogProps {
  packages: CareServicePackage[];
  loading?: boolean;
  onSelectPackage: (packageId: number) => void;
}

const difficultyColors: Record<DifficultyLevel, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
  [DifficultyLevel.EASY]: "success",
  [DifficultyLevel.MEDIUM]: "info",
  [DifficultyLevel.HARD]: "warning",
  [DifficultyLevel.EXPERT]: "error",
};

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  packages,
  loading = false,
  onSelectPackage,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (packages.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Hiện tại không có gói dịch vụ nào
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Các Gói Dịch Vụ Chăm Sóc Cây
      </Typography>
      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pkg.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={2}
                >
                  <Typography variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
                    {pkg.name}
                  </Typography>
                  <Chip
                    label={
                      pkg.serviceType === ServiceType.ONETIME ? "1 Lần" : "Định Kỳ"
                    }
                    size="small"
                    color={
                      pkg.serviceType === ServiceType.ONETIME ? "primary" : "secondary"
                    }
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {pkg.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Mức độ khó:
                  </Typography>
                  <Chip
                    label={pkg.difficultyLevel}
                    size="small"
                    color={difficultyColors[pkg.difficultyLevel]}
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    ⏱️ Thời gian: {pkg.durationDays} ngày
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    📐 Diện tích tối đa: {pkg.areaLimit} m²
                  </Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption">Các công việc:</Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    {pkg.features.slice(0, 3).map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {pkg.features.length > 3 && (
                      <Chip
                        label={`+${pkg.features.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", pt: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                    {pkg.unitPrice.toLocaleString('vi-VN')} ₫
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSelectPackage(pkg.id)}
                >
                  Đăng Ký
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ServiceCatalog;
