import React, { useState } from "react";
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
  Badge,
  Avatar,
  Grid,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ServiceRegistration } from "@/types/service.types";

interface ServiceRequestListProps {
  requests: ServiceRegistration[];
  loading?: boolean;
  onSelectRequest: (request: ServiceRegistration) => void;
}

export const ServiceRequestList: React.FC<ServiceRequestListProps> = ({
  requests,
  loading = false,
  onSelectRequest,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          Không có yêu cầu dịch vụ mới
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
        📋 Yêu Cầu Dịch Vụ Chờ Xác Nhận ({requests.length})
      </Typography>

      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid size={{ xs: 12, md: 6 }} key={request.id}>
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
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header with customer info */}
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
                      {request.customer?.name?.charAt(0) || "C"}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {request.customer?.name || "Khách hàng"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {request.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Chờ Xác Nhận"
                    color="warning"
                    size="small"
                    variant="filled"
                  />
                </Box>

                {/* Service package info */}
                <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {request.servicePackage?.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Giá: {request.servicePackage?.unitPrice.toLocaleString('vi-VN')} ₫
                  </Typography>
                </Box>

                {/* Contact info */}
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <PhoneIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="body2">{request.phone}</Typography>
                </Box>

                {/* Address info */}
                <Box display="flex" gap={1} mb={1.5}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "primary.main", mt: 0.5 }} />
                  <Typography variant="body2">{request.address}</Typography>
                </Box>

                {/* Service date */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="body2">
                    {new Date(request.serviceDate).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                {/* Notes */}
                {request.note && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff3e0", borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      📝 Ghi chú khách hàng:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {request.note}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => onSelectRequest(request)}
                >
                  Xem Chi Tiết & Xác Nhận
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ServiceRequestList;
