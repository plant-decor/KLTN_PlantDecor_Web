import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { CareServicePackage, ServiceRegistrationFormData } from "@/types/service.types";

interface ServiceRegistrationFormProps {
  package: CareServicePackage;
  onSubmit: (data: ServiceRegistrationFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const steps = ["Xác Nhận Gói Dịch Vụ", "Thông Tin Liên Hệ", "Lịch Hẹn & Ghi Chú"];

export const ServiceRegistrationForm: React.FC<ServiceRegistrationFormProps> = ({
  package: servicePackage,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [submission, setSubmission] = useState({ loading: false, error: null as string | null });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceRegistrationFormData>({
    defaultValues: {
      servicePackageId: servicePackage.id,
      address: "",
      phone: "",
      serviceDate: "",
      note: "",
    },
  });

  const formData = watch();

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const onFormSubmit = async (data: ServiceRegistrationFormData) => {
    setSubmission({ loading: true, error: null });
    try {
      await onSubmit(data);
    } catch (error) {
      setSubmission({
        loading: false,
        error: error instanceof Error ? error.message : "Có lỗi xảy ra",
      });
    }
  };

  const isStepValid = () => {
    if (activeStep === 1) {
      return formData.phone && formData.address && !errors.phone && !errors.address;
    } else if (activeStep === 2) {
      return formData.serviceDate && !errors.serviceDate;
    }
    return true;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          Đăng Ký Dịch Vụ Chăm Sóc Cây
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {submission.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submission.error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Box minHeight={300}>
            {/* Step 1: Package Confirmation */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Xác Nhận Gói Dịch Vụ Của Bạn
                </Typography>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {servicePackage.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {servicePackage.unitPrice.toLocaleString('vi-VN')} ₫
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {servicePackage.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Thời gian: {servicePackage.durationDays} ngày | Mức độ:{" "}
                      {servicePackage.difficultyLevel}
                    </Typography>
                  </CardContent>
                </Card>
                <Typography variant="body2" color="textSecondary">
                  Các công việc bao gồm: {servicePackage.features.join(", ")}
                </Typography>
              </Box>
            )}

            {/* Step 2: Contact Information */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Thông Tin Liên Hệ
                </Typography>

                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Số điện thoại là bắt buộc",
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số Điện Thoại"
                      type="tel"
                      placeholder="0123456789"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  rules={{
                    required: "Địa chỉ là bắt buộc",
                    minLength: { value: 10, message: "Địa chỉ phải có ít nhất 10 ký tự" },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa Chỉ Thực Hiện Dịch Vụ"
                      placeholder="Ví dụ: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      sx={{ mb: 3 }}
                    />
                  )}
                />
              </Box>
            )}

            {/* Step 3: Service Date & Notes */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Lịch Hẹn & Ghi Chú Tình Trạng Cây
                </Typography>

                <Controller
                  name="serviceDate"
                  control={control}
                  rules={{
                    required: "Ngày dự kiến là bắt buộc",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ngày & Giờ Mong Muốn"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.serviceDate}
                      helperText={errors.serviceDate?.message}
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ghi Chú Tình Trạng Cây"
                      placeholder="Ví dụ: Cây bị héo, có sâu bệnh, cần thay chậu, v.v..."
                      multiline
                      rows={4}
                      helperText="Những ghi chú sẽ giúp nhân viên chăm sóc chuẩn bị tốt hơn"
                      sx={{ mb: 3 }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onCancel}
              disabled={submission.loading}
            >
              Huỷ
            </Button>

            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={submission.loading}
              >
                Quay Lại
              </Button>
            )}

            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid() || submission.loading}
              >
                Tiếp Tục
              </Button>
            )}

            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="success"
                type="submit"
                disabled={submission.loading}
                startIcon={submission.loading && <CircularProgress size={20} />}
              >
                {submission.loading ? "Đang Xử Lý..." : "Hoàn Thành Đăng Ký"}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ServiceRegistrationForm;
