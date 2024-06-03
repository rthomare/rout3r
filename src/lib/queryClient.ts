import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24 * 7, // 7 Days
    },
  },
});
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
});
