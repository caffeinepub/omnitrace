// React Query hook for fetching backend build info with manual refetch support and resilient error handling
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BuildInfo } from '../backend';

export function useBuildInfo() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BuildInfo>({
    queryKey: ['buildInfo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBuildInfo();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes - allows refetch on mount/focus after this period
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for this duration
    refetchOnWindowFocus: true, // Refetch when user returns to tab (if stale)
    refetchOnMount: true, // Refetch on component mount (if stale)
    retry: 2,
  });
}
