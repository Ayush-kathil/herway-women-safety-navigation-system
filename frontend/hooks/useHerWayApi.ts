import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { RouteAnalysisData, SafetyData, SafePlace, CrimeHotspot } from '@/store/useAppStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10s timeout
});

// Interceptor for standardizing error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We could handle global 401s, 429s here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// HOOKS

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await apiClient.get('/health');
      return data;
    },
    retry: 2,
    refetchInterval: 60000, // Background poll every minute
  });
};

export const usePredictSafety = (lat: number | undefined, lng: number | undefined, hour: number) => {
  return useQuery<SafetyData>({
    queryKey: ['predictSafety', lat, lng, hour],
    queryFn: async () => {
      if (lat === undefined || lng === undefined) throw new Error("Missing coordinates");
      const { data } = await apiClient.get(`/predict_safety?lat=${lat}&long=${lng}&hour=${hour}`);
      return data;
    },
    enabled: lat !== undefined && lng !== undefined, // Only run if coords exist
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};

export const useGetSafePlaces = (lat: number | undefined, lng: number | undefined, radius: number = 2000) => {
  return useQuery<{ places: SafePlace[] }>({
    queryKey: ['safePlaces', lat, lng, radius],
    queryFn: async () => {
      if (lat === undefined || lng === undefined) throw new Error("Missing coordinates");
      const { data } = await apiClient.get(`/safe_places?lat=${lat}&lng=${lng}&radius=${radius}`);
      return data;
    },
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
};

export const useGetCrimeHotspots = (lat: number | undefined, lng: number | undefined, hour: number, radius: number = 3000) => {
  return useQuery<{ hotspots: CrimeHotspot[] }>({
    queryKey: ['crimeHotspots', lat, lng, hour, radius],
    queryFn: async () => {
      if (lat === undefined || lng === undefined) throw new Error("Missing coordinates");
      const { data } = await apiClient.get(`/get_crime_hotspots?lat=${lat}&lng=${lng}&radius=${radius}&hour=${hour}`);
      return data;
    },
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 5 * 60 * 1000,
  });
};

// Use Mutation for route analysis because it's a heavy POST request triggered by user action
export const useAnalyzeRoute = () => {
  return useMutation<RouteAnalysisData, Error, { waypoints: [number, number][], hour: number, day_of_week: number }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/analyze_route', payload);
      return data;
    },
  });
};
