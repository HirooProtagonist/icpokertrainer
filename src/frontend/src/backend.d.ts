import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IcmContext {
    stacks: Array<number>;
    heroIndex?: bigint;
    stage?: string;
    playersRemaining: bigint;
    payoutType?: string;
    payouts: Array<number>;
}
export interface SpotStat {
    attempts: bigint;
    mistakes: bigint;
}
export type Time = bigint;
export interface SessionSummary {
    completedAt: Time;
    mistakeCount: bigint;
    mode?: string;
    handsPlayed: bigint;
    scenario: string;
    correctCount: bigint;
    acceptableCount: bigint;
    stackRange: string;
}
export interface UserProfile {
    principal: Principal;
    mistakeCount: bigint;
    totalHands: bigint;
    isPremium: boolean;
    spotStats: Array<[string, SpotStat]>;
    createdAt: Time;
    sessions: Array<SessionSummary>;
    correctCount: bigint;
    acceptableCount: bigint;
    totalSessions: bigint;
}
export interface SessionData {
    completedAt: Time;
    mistakeCount: bigint;
    mode?: string;
    handsPlayed: bigint;
    spotResults: Array<[string, string]>;
    icmContext?: IcmContext;
    scenario: string;
    correctCount: bigint;
    acceptableCount: bigint;
    stackRange: string;
}
export interface backendInterface {
    ensureProfile(): Promise<void>;
    getProfile(): Promise<UserProfile | null>;
    saveSession(data: SessionData): Promise<void>;
}
