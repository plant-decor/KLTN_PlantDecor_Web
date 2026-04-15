const PHONE_NUMBER_10_DIGITS_REGEX = /^\d{10}$/;

export const isValidPhoneNumber10Digits = (phoneNumber: string): boolean => {
  return PHONE_NUMBER_10_DIGITS_REGEX.test(phoneNumber.trim());
};