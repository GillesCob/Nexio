import { ReactNode, useEffect, useState } from "react";
import { apiClient } from "@/lib/axiosClient";
import { useAuthStore } from "@/store/authStore";
import { IAuthResponse } from "@/types/auth";

interface IAuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({ children }: IAuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    apiClient
      .post<IAuthResponse>("/auth/refresh")
      .then(({ data }) => {
        setAuth(data.accessToken, data.user);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
