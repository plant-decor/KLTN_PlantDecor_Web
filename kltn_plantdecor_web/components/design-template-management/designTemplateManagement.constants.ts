import type { DesignTemplateRoomTypeOption, DesignTemplateStyleOption } from '@/types/admin-design-template.types';

interface RoomDesignEnumOption {
  value: number;
  name: string;
}

export const DESIGN_TEMPLATE_TIER_ITEM_TYPE_OPTIONS = [
  { value: 1, label: "Plant" },
  { value: 2, label: "Material" },
  { value: 3, label: "Decor" },
];

export const DESIGN_TEMPLATE_TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50];

export const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

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
