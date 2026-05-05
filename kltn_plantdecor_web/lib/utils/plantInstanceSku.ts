/**
 * SKU gợi ý phía client.
 * Định dạng: {chữ cái đầu tên cây, tối đa 4}-{chữ cái đầu tên Manager, tối đa 3}-{6 chữ số ngẫu nhiên}
 */
const stripCombiningMarks = (value: string): string => {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
};

const initialsFromName = (name: string, maxChars: number): string => {
  const normalized = stripCombiningMarks(name).trim();
  if (!normalized) {
    return '';
  }

  const parts = normalized.split(/[\s\-_/]+/).filter(Boolean);
  let result = '';

  for (const part of parts) {
    const match = part.match(/[\p{L}\p{N}]/u) ?? part.match(/[A-Za-z0-9]/);
    if (match) {
      result += match[0].toUpperCase();
    }
    if (result.length >= maxChars) {
      break;
    }
  }

  return result.slice(0, maxChars);
};

const randomNumericSuffix = (digitCount: number): string => {
  const max = 10 ** digitCount;
  const n = Math.floor(Math.random() * max);
  return String(n).padStart(digitCount, '0');
};

export interface GeneratePlantInstanceSkuParams {
  plantName: string;
  /** Tên manager (ví dụ từ ManagerNursery.managerName) */
  managerName: string;
}

export function generatePlantInstanceSku(params: GeneratePlantInstanceSkuParams): string {
  const plantPart = initialsFromName(params.plantName, 4) || 'PL';
  const managerPart = initialsFromName(params.managerName, 3) || 'MGR';
  const suffix = randomNumericSuffix(6);
  return `${plantPart}-${managerPart}-${suffix}`;
}
