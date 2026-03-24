'use server';

import {
  confirmEmailAction as confirmEmailActionImpl,
  resendVerificationEmailAction as resendVerificationEmailActionImpl,
} from './authenticationActions';

export async function resendVerificationEmailAction(email: string) {
  return resendVerificationEmailActionImpl(email);
}

export async function confirmEmailAction(email: string, token: string) {
  return confirmEmailActionImpl(email, token);
}
