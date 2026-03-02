import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CareServicePackage,
  CareServicePackageFormData,
  ServiceType,
  DifficultyLevel,
} from "@/types/service.types";

interface CarePackageFormProps {
  open: boolean;
  package?: CareServicePackage;
  onSubmit: (data: CareServicePackageFormData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const CarePackageForm: React.FC<CarePackageFormProps> = ({
  open,
  package: editingPackage,
  onSubmit,
  onClose,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CareServicePackageFormData>({
    defaultValues: {
      name: "",
      description: "",
      features: [],
      serviceType: ServiceType.ONETIME,
      frequency: "",
      durationDays: 1,
      difficultyLevel: DifficultyLevel.EASY,
      areaLimit: 100,
      unitPrice: 0,
      isActive: true,
    },
  });

  const [features, setFeatures] = React.useState<string[]>([]);

  const serviceType = watch("serviceType");

  useEffect(() => {
    if (editingPackage) {
      reset(editingPackage);
      setFeatures(editingPackage.features || []);
    } else {
      reset({
        name: "",
        description: "",
        features: [],
        serviceType: ServiceType.ONETIME,
        frequency: "",
        durationDays: 1,
        difficultyLevel: DifficultyLevel.EASY,
        areaLimit: 100,
        unitPrice: 0,
        isActive: true,
      });
      setFeatures([]);
    }
  }, [editingPackage, reset, open]);

  const onFormSubmit = async (data: CareServicePackageFormData) => {
    try {
      await onSubmit({ ...data, features });
      reset();
      setFeatures([]);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingPackage ? "Chỉnh Sửa Gói Dịch Vụ" : "Tạo Gói Dịch Vụ Mới"}
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Box component="form" sx={{ pt: 2 }}>
          {/* Thông Tin Chung */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            Thông Tin Chung
          </Typography>

          <Controller
            name="name"
            control={control}
            rules={{ required: "Tên gói là bắt buộc" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Gói Dịch Vụ"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: "Mô tả là bắt buộc" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mô Tả Chi Tiết"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          {/* Cấu Hình Dịch Vụ */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            Cấu Hình Dịch Vụ
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Loại Dịch Vụ</InputLabel>
                    <Select {...field} label="Loại Dịch Vụ">
                      <MenuItem value={ServiceType.ONETIME}>1 Lần</MenuItem>
                      <MenuItem value={ServiceType.PERIODIC}>Định Kỳ</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {serviceType === ServiceType.PERIODIC && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tần Suất"
                      placeholder="Ví dụ: Hàng tuần, Hàng tháng"
                    />
                  )}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="durationDays"
                control={control}
                rules={{
                  required: "Thời gian là bắt buộc",
                  min: { value: 1, message: "Phải ≥ 1 ngày" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Thời Gian (Ngày)"
                    type="number"
                    error={!!errors.durationDays}
                    helperText={errors.durationDays?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="difficultyLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Mức Độ Khó</InputLabel>
                    <Select {...field} label="Mức Độ Khó">
                      <MenuItem value={DifficultyLevel.EASY}>Dễ</MenuItem>
                      <MenuItem value={DifficultyLevel.MEDIUM}>Trung Bình</MenuItem>
                      <MenuItem value={DifficultyLevel.HARD}>Khó</MenuItem>
                      <MenuItem value={DifficultyLevel.EXPERT}>Chuyên Gia</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Giới Hạn & Giá */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            Giới Hạn & Giá Cả
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="areaLimit"
                control={control}
                rules={{
                  required: "Diện tích là bắt buộc",
                  min: { value: 1, message: "Phải > 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Diện Tích Tối Đa (m²)"
                    type="number"
                    error={!!errors.areaLimit}
                    helperText={errors.areaLimit?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="unitPrice"
                control={control}
                rules={{
                  required: "Giá là bắt buộc",
                  min: { value: 0, message: "Giá phải ≥ 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Giá Cơ Bản (₫)"
                    type="number"
                    error={!!errors.unitPrice}
                    helperText={errors.unitPrice?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Tính Năng */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            Các Công Việc Bao Gồm
          </Typography>

          <Box sx={{ mb: 3 }}>
            {features.map((feature, index) => (
              <Box key={index} display="flex" gap={1} mb={1}>
                <TextField
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[index] = e.target.value;
                    setFeatures(newFeatures);
                  }}
                  fullWidth
                  placeholder="Ví dụ: Tưới nước, kiểm tra sâu bệnh"
                  size="small"
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                  sx={{ minWidth: "auto" }}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setFeatures([...features, ""])}
            >
              Thêm Công Việc
            </Button>
          </Box>

          {/* Trạng Thái */}
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} />}
                label="Gói dịch vụ hoạt động"
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting || loading}>
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? <CircularProgress size={20} /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarePackageForm;
