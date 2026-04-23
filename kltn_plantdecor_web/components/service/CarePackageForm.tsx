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
  Grid,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CareServicePackage,
  CareServicePackageFormData,
  ServiceType,
  DifficultyLevel,
} from "@/types/service.types";
import { CustomLoading } from "../CustomLoading";

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

  const serviceType = useWatch({ control, name: "serviceType" });

  useEffect(() => {
    if (editingPackage) {
      reset(editingPackage);
      queueMicrotask(() => {
        setFeatures(editingPackage.features || []);
      });
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
      queueMicrotask(() => {
        setFeatures([]);
      });
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
        {editingPackage ? "Edit Package" : "Create Package"}
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
            rules={{ required: "Package name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Package Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Description"
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
                    <InputLabel>Service Type</InputLabel>
                    <Select {...field} label="Service Type">
                      <MenuItem value={ServiceType.ONETIME}>One Time</MenuItem>
                      <MenuItem value={ServiceType.PERIODIC}>Periodic</MenuItem>
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
                      label="Frequency"
                      placeholder="e.g., Weekly, Monthly"
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
                  required: "Duration is required",
                  min: { value: 1, message: "Must be ≥ 1 day" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Duration (Days)"
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
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select {...field} label="Difficulty Level">
                      <MenuItem value={DifficultyLevel.EASY}>Easy</MenuItem>
                      <MenuItem value={DifficultyLevel.MEDIUM}>Medium</MenuItem>
                      <MenuItem value={DifficultyLevel.HARD}>Hard</MenuItem>
                      <MenuItem value={DifficultyLevel.EXPERT}>Expert</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          {/* Giới Hạn & Giá */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            Space & Pricing
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="areaLimit"
                control={control}
                rules={{
                  required: "Area limit is required",
                  min: { value: 1, message: "Must be > 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Area Limit (m²)"
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
                  required: "Unit price is required",
                  min: { value: 0, message: "Unit price must be ≥ 0" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Base Price (₫)"
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
            Features
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
                  placeholder="e.g., Watering, Pest Inspection"
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
              Add Feature
            </Button>
          </Box>

          {/* Trạng Thái */}
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} />}
                label="Service Package is Active"
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting || loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          color="primary"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? <CustomLoading size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarePackageForm;
