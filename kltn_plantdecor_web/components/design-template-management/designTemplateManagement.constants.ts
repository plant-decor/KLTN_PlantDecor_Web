import type { DesignTemplateRoomTypeOption, DesignTemplateStyleOption } from '@/types/admin-design-template.types';

/** Giới hạn kích thước file ảnh mẫu upload (create / đổi ảnh edit). */
export const DESIGN_TEMPLATE_SAMPLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** MUI disabled TextField làm mờ label + input; giữ đen 100% opacity (form template / tier read-only). */
export const textFieldDisabledBlackInputSx = {
  '& .MuiInputLabel-root.Mui-disabled': {
    color: 'rgb(0, 0, 0)',
    WebkitTextFillColor: 'rgb(0, 0, 0)',
    opacity: 1,
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: 'rgb(0, 0, 0)',
    color: 'rgb(0, 0, 0)',
    opacity: 1,
  },
} as const;

/** Select trong FormControl khi disabled: label, nội dung, icon, Chip đen đầy đủ. */
export const formControlDisabledSelectBlackTextSx = {
  '& .MuiInputLabel-root.Mui-disabled': {
    color: 'rgb(0, 0, 0)',
    WebkitTextFillColor: 'rgb(0, 0, 0)',
    opacity: 1,
  },
  '& .MuiOutlinedInput-root.Mui-disabled': {
    color: 'rgb(0, 0, 0)',
    WebkitTextFillColor: 'rgb(0, 0, 0)',
    opacity: 1,
    '& .MuiSelect-select': {
      color: 'rgb(0, 0, 0)',
      WebkitTextFillColor: 'rgb(0, 0, 0)',
      opacity: 1,
    },
  },
  '& .MuiSelect-icon.Mui-disabled': {
    color: 'rgb(0, 0, 0)',
    opacity: 1,
  },
  '& .MuiChip-root': {
    opacity: 1,
    '& .MuiChip-label': {
      color: 'rgb(0, 0, 0)',
    },
  },
} as const;

/** FormControlLabel + Switch disabled: chữ label không xám. */
export const formControlLabelDisabledBlackTextSx = {
  '&.Mui-disabled': {
    opacity: 1,
  },
  '& .MuiFormControlLabel-label.Mui-disabled': {
    color: 'rgb(0, 0, 0)',
    WebkitTextFillColor: 'rgb(0, 0, 0)',
    opacity: 1,
  },
} as const;

interface RoomDesignEnumOption {
  value: number;
  name: string;
}

export const DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS = [
  { value: 1, label: "Plant" },
  { value: 2, label: "Material" },
];

export const DESIGN_TEMPLATE_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50];

const humanizeEnumName = (value: string) => {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
};

const toTemplateOption = (option: RoomDesignEnumOption) => ({
  value: option.value,
  label: humanizeEnumName(option.name),
});

export const mapRoomTypeOptions = (options: RoomDesignEnumOption[]): DesignTemplateRoomTypeOption[] => {
  return options.map(toTemplateOption);
};

export const mapStyleOptions = (options: RoomDesignEnumOption[]): DesignTemplateStyleOption[] => {
  return options.map(toTemplateOption);
};

export const formatRoomTypes = (roomTypeIds: number[], roomTypeOptions: DesignTemplateRoomTypeOption[]) => {
  return roomTypeIds
    .map((roomTypeId) => roomTypeOptions.find((option) => option.value === roomTypeId)?.label ?? `#${roomTypeId}`)
    .join(", ");
};

export const formatStyle = (styleId: number, styleOptions: DesignTemplateStyleOption[]) => {
  return styleOptions.find((option) => option.value === styleId)?.label ?? `Style ${styleId}`;
};
