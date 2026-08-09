import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// QueryClient - Stores all queries, mutations, and cache.
// QueryClientProvider - Makes that QueryClient available to every component.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes ,  TanStack Query considers cached data fresh for 5 minutes before refetching. 
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
}); // Every useQuery() and useMutation() uses this same client.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);