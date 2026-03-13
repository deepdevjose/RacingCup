/**
 * matchDB.ts
 * Unified wrapper for match and tournament stats operations.
 * Was previously routing between IndexedDB (sandbox) or Firebase based on sandbox mode.
 * Sandbox mode has been removed, so this file now just acts as an alias to avoid breaking imports in components.
 */

import {
    createMatch as fbCreateMatch,
    getMatchesByCategory as fbGetMatchesByCategory,
    getMatchesByEvent as fbGetMatchesByEvent,
    updateMatch as fbUpdateMatch,
    deleteMatch as fbDeleteMatch,
    getTournamentStats as fbGetTournamentStats,
    updateStandingStats as fbUpdateStandingStats,
    getAllTeams as fbGetAllTeams,
    getTeamById as fbGetTeamById,
} from './firebase'
import type { Match, TournamentStats } from './firebase'

// ── Re-export types so components can import from one place ──
export type { Match, TournamentStats }
export type { Team, TeamMember, UserProfile, Event } from './firebase'
export { getTeamById } from './firebase'

// ── Match operations ─────────────────────────────────────────

export async function createMatch(
    match: Omit<Match, 'id' | 'createdAt'>
): Promise<string> {
    return fbCreateMatch(match)
}

export async function getMatchesByCategory(
    eventId: string,
    categoryId: string
): Promise<Match[]> {
    return fbGetMatchesByCategory(eventId, categoryId)
}

export async function getMatchesByEvent(eventId: string): Promise<Match[]> {
    return fbGetMatchesByEvent(eventId)
}

export async function updateMatch(
    matchId: string,
    updates: Partial<Match>
): Promise<void> {
    return fbUpdateMatch(matchId, updates)
}

export async function deleteMatch(matchId: string): Promise<void> {
    return fbDeleteMatch(matchId)
}

// ── Stats operations ──────────────────────────────────────────

export async function getTournamentStats(
    eventId: string,
    categoryId: string
): Promise<TournamentStats[]> {
    return fbGetTournamentStats(eventId, categoryId)
}

export async function updateStandingStats(
    eventId: string,
    categoryId: string
): Promise<void> {
    return fbUpdateStandingStats(eventId, categoryId)
}
