"use client";

import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormControlLabel,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import type { AdvancedFilters } from "@/components/ai-chatbot/aiChatbot.ui-types";

interface AdvancedFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onChange: (next: AdvancedFilters) => void;
  fengShuiOptions: string[];
  roomTypeOptions: string[];
  onReset: () => void;
}

export function AdvancedFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  fengShuiOptions,
  roomTypeOptions,
  onReset,
}: AdvancedFilterDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
    >
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
            Advanced filter
          </Typography>
          <Button onClick={onClose} color="inherit" variant="text">
            Close
          </Button>
        </Stack>

        <Typography sx={{ mt: 0.5, fontSize: 13, color: "#64748b" }}>
          These settings will be included when you send messages.
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="fengshui-label">FengShuiElement</InputLabel>
            <Select
              labelId="fengshui-label"
              label="FengShuiElement"
              value={filters.fengShuiElement}
              onChange={(e) =>
                onChange({ ...filters, fengShuiElement: String(e.target.value) })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {fengShuiOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="preferred-rooms-label">Preferred rooms</InputLabel>
            <Select
              multiple
              labelId="preferred-rooms-label"
              label="Preferred rooms"
              value={filters.preferredRooms}
              onChange={(e) =>
                onChange({
                  ...filters,
                  preferredRooms:
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value,
                })
              }
              renderValue={(selected) => (selected as string[]).join(", ")}
            >
              {roomTypeOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel shrink htmlFor="room-desc">
              Room description
            </InputLabel>
            <InputBase
              id="room-desc"
              value={filters.roomDescription}
              onChange={(e) =>
                onChange({ ...filters, roomDescription: e.target.value })
              }
              placeholder="Describe your room (light, size, style, etc.)"
              sx={{
                mt: 3,
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid rgba(15,23,42,0.08)",
                fontSize: 14,
              }}
              multiline
              minRows={3}
            />
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="maxBudget">
                Max budget
              </InputLabel>
              <InputBase
                id="maxBudget"
                value={filters.maxBudget}
                onChange={(e) =>
                  onChange({ ...filters, maxBudget: e.target.value })
                }
                placeholder="450000"
                sx={{
                  mt: 3,
                  px: 1.5,
                  py: 1.05,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.08)",
                  fontSize: 14,
                }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="limit">
                Limit
              </InputLabel>
              <InputBase
                id="limit"
                value={filters.limit}
                onChange={(e) => onChange({ ...filters, limit: e.target.value })}
                placeholder="3"
                sx={{
                  mt: 3,
                  px: 1.5,
                  py: 1.05,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.08)",
                  fontSize: 14,
                }}
              />
            </FormControl>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={filters.petSafe}
                onChange={(e) => onChange({ ...filters, petSafe: e.target.checked })}
              />
            }
            label="Pet safe"
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.childSafe}
                onChange={(e) =>
                  onChange({ ...filters, childSafe: e.target.checked })
                }
              />
            }
            label="Child safe"
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.onlyPurchasable}
                onChange={(e) =>
                  onChange({ ...filters, onlyPurchasable: e.target.checked })
                }
              />
            }
            label="Only purchasable"
          />

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" onClick={onReset}>
              Reset
            </Button>
            <Button variant="contained" onClick={onClose}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

