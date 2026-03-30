const formatCurrency = (price: number, locale: string) => {
    const numberLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    return `${price.toLocaleString(numberLocale)}đ`;
  };

export { formatCurrency };