import { create } from 'zustand';

type LoadingState = {
  isLoadingFlag: boolean;
  setIsLoadingFlag: (isLoadingFlag: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoadingFlag: false,
  setIsLoadingFlag: (isLoadingFlag) => set({ isLoadingFlag }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));

// export const useUserStore = create<UserState>((set) => ({
//   user: JSON.parse(localStorage.getItem("user") || "null"),
//   setUser: (user) => {
//     localStorage.setItem("user", JSON.stringify(user));
//     set({ user });
//   },
//   clearUser: () => {
//     set({ user: null });
//   },
//   getToken: () => {
//     const user = JSON.parse(localStorage.getItem("user") || "null");
//     return user?.token || null;
//   },
// }
// ));