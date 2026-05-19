// ─── useQueries — React Query hooks for ICPokerTrainer backend ──────────────

import { createActor } from "@/backend";
import type { SessionData, UserProfile } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Ensure Profile (called once on login) ────────────────────────────────────

export function useEnsureProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.ensureProfile();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Save Session ─────────────────────────────────────────────────────────────

export function useSaveSession() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SessionData) => {
      if (!actor) throw new Error("Not authenticated");
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("saveSession timeout after 30s")),
          30_000,
        ),
      );
      await Promise.race([actor.saveSession(data), timeout]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      console.error("[useSaveSession] failed:", error);
    },
  });
}

export type { SessionData, UserProfile };
