import { useQuery } from "@tanstack/react-query";
import { api, type ApiContent } from "@/lib/api";

export const CONTENT_QUERY_KEY = ["content"] as const;

export function useContent() {
  return useQuery({
    queryKey: CONTENT_QUERY_KEY,
    queryFn: () => api.get<ApiContent>("/content"),
    staleTime: 1000 * 30,
  });
}

export function useSetting(key: string, fallback = ""): string {
  const { data } = useContent();
  return data?.settings[key] ?? fallback;
}
