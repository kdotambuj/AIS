"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { setCredentials, setLoading, logout } from "@/store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        if (data.success && data.data) {
          dispatch(
            setCredentials({
              userId: data.data.id,
              email: data.data.email,
              name: data.data.name,
              role: data.data.role,
            }),
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}
