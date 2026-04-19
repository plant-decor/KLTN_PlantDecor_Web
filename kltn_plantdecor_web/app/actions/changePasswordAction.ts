// 'use server';

// import axios from 'axios';
// import * as apiServer from '@/lib/api/apiService.server';
// import { cookies } from 'next/headers';

// interface ChangePasswordResponse {
//   success: boolean;
//   message?: string;
// }

// /**
//  * Server Action: Đổi mật khẩu
//  *
//  * Luồng:
//  * 1. Nhận oldPassword, newPassword từ client
//  * 3. Gọi API C# để đổi mật khẩu
//  * 4. Trả về success/error
//  */
// export async function changePasswordAction(
//   currentPassword: string,
//   newPassword: string,
//   confirmNewPassword: string,
// ): Promise<ChangePasswordResponse> {
//   try {
//     const response = await apiServer.post<ChangePasswordResponse>(
//       '/User/change-password',
//       {
//         currentPassword,
//         newPassword,
//         confirmNewPassword,
//       }
//     );

//     if (response.success === false) {
//       return {
//         success: false,
//         message: response.message || 'Đổi mật khẩu thất bại',
//       };
//     }

//     const cookieStore = await cookies();
//     cookieStore.delete('accessToken');
//     cookieStore.delete('authToken');
//     cookieStore.delete('refreshToken');
//     cookieStore.delete('userRole');

//     return {
//       success: true,
//       message: response.message || 'Mật khẩu đã được thay đổi thành công',
//     };
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       return {
//         success: false,
//         message:
//           (error.response?.data as { message?: string } | undefined)?.message ||
//           error.message ||
//           'Đổi mật khẩu thất bại',
//       };
//     }

//     console.error('Change password error:', error);
//     return {
//       success: false,
//       message: 'Lỗi server khi đổi mật khẩu',
//     };
//   }
// }

