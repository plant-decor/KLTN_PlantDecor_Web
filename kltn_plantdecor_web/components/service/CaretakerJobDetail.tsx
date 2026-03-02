import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Button,
  Typography,
  TextField,
  Chip,
  Alert,
  Dialog,
  CircularProgress,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Grid,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import { ServiceRegistration } from "@/types/service.types";

interface CaretakerJobDetailProps {
  task: ServiceRegistration | null;
  loading?: boolean;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onUploadEvidence: (photos: File[]) => Promise<void>;
  onSubmitSurvey: (description: string, addOns: AddOnProposal[]) => Promise<void>;
  onBack: () => void;
}

interface AddOnProposal {
  name: string;
  description: string;
  estimatedPrice: number;
}

export const CaretakerJobDetail: React.FC<CaretakerJobDetailProps> = ({
  task,
  loading = false,
  onCheckIn,
  onCheckOut,
  onUploadEvidence,
  onSubmitSurvey,
  onBack,
}) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyDescription, setSurveyDescription] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [addOns, setAddOns] = useState<AddOnProposal[]>([
    { name: "", description: "", estimatedPrice: 0 },
  ]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  if (!task) {
    return (
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Không tìm thấy công việc
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Quay Lại
        </Button>
      </Container>
    );
  }

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await onCheckIn();
      setIsCheckedIn(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await onCheckOut();
      setSurveyOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos([...uploadedPhotos, ...files]);

    // Create preview
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitSurvey = async () => {
    setActionLoading(true);
    try {
      // Upload photos first if any
      if (uploadedPhotos.length > 0) {
        await onUploadEvidence(uploadedPhotos);
      }

      // Submit survey and add-ons
      await onSubmitSurvey(
        surveyDescription,
        addOns.filter((a) => a.name.trim())
      );

      // Reset and go back
      setSurveyOpen(false);
      setSurveyDescription("");
      setAddOns([{ name: "", description: "", estimatedPrice: 0 }]);
      setUploadedPhotos([]);
      setPhotoPreview([]);
      onBack();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddOnChange = (
    index: number,
    field: keyof AddOnProposal,
    value: string | number
  ) => {
    const newAddOns = [...addOns];
    newAddOns[index] = { ...newAddOns[index], [field]: value };
    setAddOns(newAddOns);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button variant="text" onClick={onBack} sx={{ mb: 3 }}>
        ← Quay Lại Danh Sách Công Việc
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Task Info */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
              {task.customer?.name?.charAt(0) || "C"}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {task.customer?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Công việc #{task.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Customer & Service Info */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <PhoneIcon color="primary" />
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
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Giờ Hẹn
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {new Date(task.serviceDate).toLocaleTimeString("vi-VN")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="flex-start" gap={1}>
              <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
              <Box flex={1}>
                <Typography variant="caption" color="textSecondary">
                  Địa Chỉ
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {task.address}
                </Typography>
                <Button
                  size="small"
                  startIcon={<MapIcon />}
                  href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`}
                  target="_blank"
                  sx={{ mt: 1 }}
                >
                  Xem Bản Đồ
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Service Package Info */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          📦 Thông Tin Gói Dịch Vụ
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {task.servicePackage?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              Các công việc cần làm:
            </Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {task.servicePackage?.features.map((feature, idx) => (
                <Chip key={idx} label={feature} size="small" variant="outlined" />
              ))}
            </Box>
            {task.note && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff3e0", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  📝 Ghi chú khách hàng:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {task.note}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        {/* Check-in/out Buttons */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          ✓ Bắt Đầu Công Việc
        </Typography>

        <Box display="flex" gap={2} sx={{ mb: 3 }}>
          {!isCheckedIn ? (
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleCheckIn}
              disabled={actionLoading}
            >
              {actionLoading ? "Đang Xử Lý..." : "Check-in / Bắt Đầu"}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopIcon />}
              onClick={handleCheckOut}
              disabled={actionLoading}
            >
              {actionLoading ? "Đang Xử Lý..." : "Check-out / Kết Thúc"}
            </Button>
          )}
        </Box>

        {isCheckedIn && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              ✓ Bạn đã check-in. Nhấn "Check-out" khi hoàn thành công việc.
            </Alert>

            <Divider sx={{ mb: 3 }} />

            {/* Photo Upload Section */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              📸 Chụp Ảnh Bằng Chứng
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload"
                multiple
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload" style={{ width: "100%" }}>
                <Button
                  component="span"
                  fullWidth
                  variant="outlined"
                  startIcon={<ImageIcon />}
                >
                  Chọn Ảnh
                </Button>
              </label>

              {photoPreview.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  {photoPreview.map((preview, idx) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={idx}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="120"
                          image={preview}
                          alt={`Photo ${idx}`}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemovePhoto(idx)}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bgcolor: "white",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Survey & Add-ons Dialog */}
      <Dialog open={surveyOpen} onClose={() => setSurveyOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            📋 Khảo Sát & Đề Xuất Phát Sinh
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Vui lòng mô tả tình trạng cây hiện tại và đề xuất các dịch vụ phát sinh nếu có.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mô Tả Tình Trạng Cây & Công Việc Đã Làm"
            placeholder="Ví dụ: Cây được tưới nước, vệ sinh lá, kiểm tra sâu bệnh, khuyến nghị thay chậu..."
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            ➕ Đề Xuất Phát Sinh (Tùy Chọn)
          </Typography>

          {addOns.map((addon, idx) => (
            <Box key={idx} sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    placeholder="Tên dịch vụ phát sinh"
                    value={addon.name}
                    onChange={(e) =>
                      handleAddOnChange(idx, "name", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    placeholder="Mô tả"
                    value={addon.description}
                    onChange={(e) =>
                      handleAddOnChange(idx, "description", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="Giá dự kiến"
                    value={addon.estimatedPrice}
                    onChange={(e) =>
                      handleAddOnChange(idx, "estimatedPrice", parseInt(e.target.value) || 0)
                    }
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button
            fullWidth
            variant="outlined"
            onClick={() =>
              setAddOns([
                ...addOns,
                { name: "", description: "", estimatedPrice: 0 },
              ])
            }
            sx={{ mb: 3 }}
          >
            + Thêm Phát Sinh
          </Button>

          <Box display="flex" gap={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSurveyOpen(false)}
              disabled={actionLoading}
            >
              Huỷ
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              onClick={handleSubmitSurvey}
              disabled={actionLoading || !surveyDescription.trim()}
            >
              {actionLoading ? "Đang Gửi..." : "Gửi Báo Cáo"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default CaretakerJobDetail;
