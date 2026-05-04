'use client';

import {Chip, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { NurseryDesignTemplateListFilter } from './managerNurseryDesignTemplate.constants';
import { NURSERY_DESIGN_TEMPLATE_LIST_FILTER_OPTIONS } from './managerNurseryDesignTemplate.constants';

interface ManagerNurseryDesignTemplateHeaderProps {
  listFilter: NurseryDesignTemplateListFilter;
  onListFilterChange: (value: NurseryDesignTemplateListFilter) => void;
  activeCount: number;
  inactiveCount: number;
  // loading: boolean;
  // onReload: () => void;
}

export default function ManagerNurseryDesignTemplateHeader({
  listFilter,
  onListFilterChange,
  activeCount,
  inactiveCount,
}: ManagerNurseryDesignTemplateHeaderProps) {
  const handleFilterChange = (event: SelectChangeEvent<NurseryDesignTemplateListFilter>) => {
    onListFilterChange(event.target.value);
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="nursery-design-template-list-filter-label">List filter</InputLabel>
        <Select
          labelId="nursery-design-template-list-filter-label"
          label="List filter"
          value={listFilter}
          onChange={handleFilterChange}
        >
          {NURSERY_DESIGN_TEMPLATE_LIST_FILTER_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Chip label={`Active: ${activeCount}`} color="success" variant="outlined" />
      <Chip label={`Inactive: ${inactiveCount}`} variant="outlined" />
    </Stack>
  );
}
