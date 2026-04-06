const getNumberLocale = (locale: string) => {
  if (locale === 'vi' || locale === 'vi-VN') {
    return 'vi-VN';
  }

  return 'en-US';
};

const parseCurrencyInput = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrencyInput = (value: number | string, locale: string): string => {
  const normalized =
    typeof value === 'number'
      ? Number.isFinite(value)
        ? Math.max(0, Math.trunc(value))
        : 0
      : parseCurrencyInput(value);

  return normalized.toLocaleString(getNumberLocale(locale));
};

const formatCurrency = (price: number, locale: string) => {
  const safePrice = Number.isFinite(price) ? Math.max(0, Math.trunc(price)) : 0;
  return `${safePrice.toLocaleString(getNumberLocale(locale))}đ`;
};

export { formatCurrency, formatCurrencyInput, parseCurrencyInput };