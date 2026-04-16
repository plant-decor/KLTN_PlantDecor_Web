type TranslationFn = ((key: string) => string) & {
  has?: (key: string) => boolean;
};

export type RoomDesignEnumName = 'RoomType' | 'RoomStyle' | 'LightRequirement';

const ROOM_DESIGN_KEYS: Record<RoomDesignEnumName, Record<string, string>> = {
  RoomType: {
    livingroom: 'roomType.livingRoom',
    bedroom: 'roomType.bedroom',
    kitchen: 'roomType.kitchen',
    bathroom: 'roomType.bathroom',
    homeoffice: 'roomType.homeOffice',
    office: 'roomType.office',
    balcony: 'roomType.balcony',
    corridor: 'roomType.corridor',
    diningroom: 'roomType.diningRoom',
    outdoor: 'roomType.outdoor',
    garden: 'roomType.garden',
  },
  RoomStyle: {
    minimalist: 'roomStyle.minimalist',
    scandinavian: 'roomStyle.scandinavian',
    tropical: 'roomStyle.tropical',
    industrial: 'roomStyle.industrial',
    bohemian: 'roomStyle.bohemian',
    modern: 'roomStyle.modern',
    japanese: 'roomStyle.japanese',
    mediterranean: 'roomStyle.mediterranean',
    rustic: 'roomStyle.rustic',
    classic: 'roomStyle.classic',
    contemporary: 'roomStyle.contemporary',
  },
  LightRequirement: {
    lowlight: 'lightRequirement.lowLight',
    mediumlight: 'lightRequirement.mediumLight',
    highlight: 'lightRequirement.highLight',
    directsunlight: 'lightRequirement.directSunlight',
    indirectlight: 'lightRequirement.indirectLight',
    brightindirectlight: 'lightRequirement.brightIndirectLight',
    partialshade: 'lightRequirement.partialShade',
    shade: 'lightRequirement.shade',
    fullsun: 'lightRequirement.fullSun',
  },
};

const normalizeToken = (value: string): string => {
  return value.replace(/[_\s-]/g, '').toLowerCase();
};

const humanizeEnumToken = (value: string): string => {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
};

const getTranslationKey = (value: string, enumName?: RoomDesignEnumName): string | null => {
  const normalizedValue = normalizeToken(value);

  if (enumName) {
    return ROOM_DESIGN_KEYS[enumName][normalizedValue] ?? null;
  }

  for (const group of Object.values(ROOM_DESIGN_KEYS)) {
    const key = group[normalizedValue];
    if (key) {
      return key;
    }
  }

  return null;
};

export const localizeRoomDesignEnumLabel = (
  value: string | number | null | undefined,
  tRoomDesignEnum: TranslationFn,
  enumName?: RoomDesignEnumName
): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  const key = getTranslationKey(value, enumName);
  if (key && (!tRoomDesignEnum.has || tRoomDesignEnum.has(key))) {
    return tRoomDesignEnum(key);
  }

  return humanizeEnumToken(value);
};
