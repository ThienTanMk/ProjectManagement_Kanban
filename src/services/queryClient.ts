import { QueryClient } from "@tanstack/react-query";
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 1,
    },
    mutations: {
      retry: 1,
    },
  },
};
export const queryClient = new QueryClient(queryClientConfig);
