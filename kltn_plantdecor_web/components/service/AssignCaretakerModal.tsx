import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Rating,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import { CaretakerInfo } from "@/types/service.types";
import { get } from '@/lib/api/apiService';

interface AssignCaretakerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (caretakerId: number, estimatedDuration: number) => Promise<void>;
  loading?: boolean;
}

export const AssignCaretakerModal: React.FC<AssignCaretakerModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [caretakers, setCaretakers] = useState<CaretakerInfo[]>([]);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState(120);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available caretakers
  useEffect(() => {
    if (!open) return;

    const fetchCaretakers = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        const data = await get<CaretakerInfo[]>('/api/services/caretakers/available', undefined, false);
        setCaretakers(data.data || []);
        
        if (data.data && data.data.length > 0) {
          setSelectedCaretakerId(data.data[0].id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching caretakers";
        setError(message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchCaretakers();
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedCaretakerId) {
      setError("Vui lòng chọn một nhân viên chăm sóc");
      return;
    }

    try {
      await onSubmit(selectedCaretakerId, estimatedDuration);
      setSelectedCaretakerId(null);
      setEstimatedDuration(120);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Phân Công Nhân Viên Chăm Sóc</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Chọn một nhân viên chăm sóc khả dụng từ danh sách dưới đây.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {fetchLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : caretakers.length === 0 ? (
          <Alert severity="warning">
            Hiện tại không có nhân viên chăm sóc khả dụng
          </Alert>
        ) : (
          <Box>
            <RadioGroup
              value={selectedCaretakerId?.toString() || ""}
              onChange={(e) => setSelectedCaretakerId(parseInt(e.target.value))}
            >
              {caretakers.map((caretaker) => (
                <Box key={caretaker.id} sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <FormControlLabel
                    value={caretaker.id.toString()}
                    control={<Radio />}
                    label=""
                    sx={{ margin: 0 }}
                  />
                  <Card
                    sx={{
                      flex: 1,
                      bgcolor: selectedCaretakerId === caretaker.id ? "primary.lighter" : "white",
                      border:
                        selectedCaretakerId === caretaker.id
                          ? "2px solid"
                          : "1px solid",
                      borderColor:
                        selectedCaretakerId === caretaker.id ? "primary.main" : "#e0e0e0",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedCaretakerId(caretaker.id)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon color="primary" />
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {caretaker.name}
                          </Typography>
                        </Box>
                        <Chip
                          label="Rảnh"
                          color="success"
                          size="small"
                          variant="filled"
                        />
                      </Box>

                      <Typography variant="caption" color="textSecondary">
                        Email: {caretaker.email}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Rating
                          value={caretaker.rating}
                          readOnly
                          size="small"
                        />
                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                          {caretaker.rating} / 5
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                        ✓ Hoàn thành {caretaker.totalCompletedServices} dịch vụ
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </RadioGroup>

            <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                Thời Gian Thực Hiện Dự Kiến (phút)
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Math.max(30, parseInt(e.target.value) || 0))}
                inputProps={{ min: 30, step: 15 }}
                helperText="Nhập thời gian dự kiến (tối thiểu 30 phút)"
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading || fetchLoading}>
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || fetchLoading || !selectedCaretakerId || caretakers.length === 0}
        >
          {loading ? "Đang Xử Lý..." : "Phân Công"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCaretakerModal;
