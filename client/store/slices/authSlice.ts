import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "STUDENT" | "HOD" | "LAB_INCHARGE" | "ADMIN" | null;

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  email: null,
  name: null,
  role: null,
  isLoading: true, // Start with loading true to check auth on mount
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        name: string;
        role: UserRole;
      }>,
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isLoading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.email = null;
      state.name = null;
      state.role = null;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
