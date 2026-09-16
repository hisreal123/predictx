"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { api, authApi, ApiError } from "./client";
import { queryKeys } from "./keys";
import type {
  AdEvent,
  AdminUpdatePredictionPayload,
  CreateSubscriptionPayload,
  Fixture,
  FixtureFilters,
  FixtureListItem,
  GoogleLoginPayload,
  LoginPayload,
  Paginated,
  Prediction,
  RegisterPayload,
  SavedPrediction,
  Subscription,
  UnlockEvent,
  UnlockPayload,
  User,
} from "./types";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => (await api.get<User>("/v1/me")).data,
    // A logged-out visitor is an expected state, not a failure worth retrying.
    retry: (failureCount, error) =>
      error instanceof ApiError && error.isUnauthorized ? false : failureCount < 2,
  });
}

/** Resets cached data on login/logout so no state leaks between accounts. */
function useAuthTransition() {
  const queryClient = useQueryClient();
  return (user: User | undefined) => {
    queryClient.clear();
    if (user) queryClient.setQueryData(queryKeys.me, user);
  };
}

export function useLogin(
  options?: UseMutationOptions<User, ApiError, LoginPayload>,
) {
  const onAuthChange = useAuthTransition();
  return useMutation({
    mutationFn: async (payload: LoginPayload) =>
      (await authApi.post<{ user: User }>("/login", payload)).data.user,
    ...options,
    onSuccess: (user, ...rest) => {
      onAuthChange(user);
      options?.onSuccess?.(user, ...rest);
    },
  });
}

export function useRegister(
  options?: UseMutationOptions<User, ApiError, RegisterPayload>,
) {
  const onAuthChange = useAuthTransition();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) =>
      (await authApi.post<{ user: User }>("/register", payload)).data.user,
    ...options,
    onSuccess: (user, ...rest) => {
      onAuthChange(user);
      options?.onSuccess?.(user, ...rest);
    },
  });
}

export function useGoogleLogin(
  options?: UseMutationOptions<User, ApiError, GoogleLoginPayload>,
) {
  const onAuthChange = useAuthTransition();
  return useMutation({
    mutationFn: async (payload: GoogleLoginPayload) =>
      (await authApi.post<{ user: User }>("/google", payload)).data.user,
    ...options,
    onSuccess: (user, ...rest) => {
      onAuthChange(user);
      options?.onSuccess?.(user, ...rest);
    },
  });
}

export function useLogout(options?: UseMutationOptions<void, ApiError, void>) {
  const onAuthChange = useAuthTransition();
  return useMutation({
    mutationFn: async () => {
      await authApi.post("/logout");
    },
    ...options,
    onSuccess: (...args) => {
      onAuthChange(undefined);
      options?.onSuccess?.(...args);
    },
  });
}

export function useFixtures(filters: FixtureFilters = {}) {
  return useQuery({
    queryKey: queryKeys.fixtures.list(filters),
    queryFn: async () =>
      (await api.get<Paginated<FixtureListItem>>("/v1/fixtures", { params: filters }))
        .data,
    // Kickoff times and live status go stale quickly.
    staleTime: 30_000,
  });
}

export function useFixture(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fixtures.detail(id),
    queryFn: async () => (await api.get<Fixture>(`/v1/fixtures/${id}`)).data,
    enabled: enabled && Number.isFinite(id),
  });
}

export function useFixturePrediction(fixtureId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fixtures.prediction(fixtureId),
    queryFn: async () =>
      (await api.get<Prediction>(`/v1/fixtures/${fixtureId}/prediction`)).data,
    enabled: enabled && Number.isFinite(fixtureId),
  });
}

export function useSharedPrediction(token: string) {
  return useQuery({
    queryKey: queryKeys.shared(token),
    queryFn: async () => (await api.get<Prediction>(`/v1/shared/${token}`)).data,
    enabled: token.length > 0,
  });
}

export function useUnlockPrediction(predictionId: number) {
  const queryClient = useQueryClient();
  return useMutation<UnlockEvent, ApiError, UnlockPayload>({
    mutationFn: async (payload) =>
      (await api.post<UnlockEvent>(`/v1/predictions/${predictionId}/unlock`, payload))
        .data,
    onSuccess: () => {
      // The prediction now carries its rationale, so every view of it is stale.
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.saved.all });
    },
  });
}

export function useStartAdEvent() {
  return useMutation<AdEvent, ApiError, { prediction_id: number }>({
    mutationFn: async (payload) =>
      (await api.post<AdEvent>("/v1/ad-events", payload)).data,
  });
}

export function useCompleteAdEvent() {
  return useMutation<AdEvent, ApiError, number>({
    mutationFn: async (adEventId) =>
      (await api.patch<AdEvent>(`/v1/ad-events/${adEventId}/complete`)).data,
  });
}

export function useSharePrediction() {
  return useMutation<{ share_token: string }, ApiError, number>({
    mutationFn: async (predictionId) =>
      (await api.post<{ share_token: string }>(`/v1/predictions/${predictionId}/share`))
        .data,
  });
}

export function useSavedPredictions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.saved.list(),
    queryFn: async () =>
      (await api.get<Paginated<SavedPrediction>>("/v1/predictions/saved")).data,
    // Requires auth — skip entirely for signed-out visitors so the panel
    // doesn't fire a guaranteed 401 on every fixture page.
    enabled,
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    ApiError,
    { predictionId: number; saved: boolean }
  >({
    mutationFn: async ({ predictionId, saved }) => {
      const path = `/v1/predictions/${predictionId}/save`;
      if (saved) {
        await api.delete(path);
      } else {
        await api.post(path);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saved.all });
    },
  });
}

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: async () =>
      (await api.get<Subscription[]>("/v1/subscriptions")).data,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, ApiError, CreateSubscriptionPayload>({
    mutationFn: async (payload) =>
      (await api.post<Subscription>("/v1/subscriptions", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      // Premium changes `user.subscribed` and unlocks every prediction.
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures.all });
    },
  });
}

export function useAdminPredictions(page = 1) {
  return useQuery({
    queryKey: queryKeys.admin.predictions(page),
    queryFn: async () =>
      (await api.get<Paginated<Prediction>>("/v1/admin/predictions", {
        params: { page },
      })).data,
  });
}

export function useAdminUpdatePrediction() {
  const queryClient = useQueryClient();
  return useMutation<
    Prediction,
    ApiError,
    { id: number; payload: AdminUpdatePredictionPayload }
  >({
    mutationFn: async ({ id, payload }) =>
      (await api.patch<Prediction>(`/v1/admin/predictions/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixtures.all });
    },
  });
}
