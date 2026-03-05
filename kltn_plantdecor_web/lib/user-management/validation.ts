import type { SampleUser } from '@/data/sampledata';

export type UserFormData = Omit<SampleUser, 'id' | 'createAt' | 'updateAt'>;

export interface ValidationErrors {
  [key: string]: string;
}

export const DEFAULT_FORM_DATA: UserFormData = {
  role: 'user',
  email: '',
  phoneNumber: '',
  password: '',
  userName: '',
  avatarUrl: '',
  status: 'active',
};

export const validateUserForm = (formData: UserFormData, isEditing: boolean = false): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // Username validation
  if (!formData.userName) {
    errors.userName = 'Username is required';
  }

  // Phone validation
  if (!formData.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  }

  // Password validation (only required when creating new user)
  if (!isEditing) {
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
  } else if (formData.password && formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};
