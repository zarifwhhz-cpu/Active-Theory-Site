import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ME_KEY = ["auth", "me"] as const;

export function useAuth() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.get<{ authenticated: boolean }>("/auth/me"),
    staleTime: 1000 * 60,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => api.post<{ ok: true }>("/auth/login", { password }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true }>("/auth/logout"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEY }),
  });
}
