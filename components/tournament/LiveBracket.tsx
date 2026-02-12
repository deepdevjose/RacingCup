"use client"

import React, { useEffect, useState } from 'react'
import { getMatchesByCategory, getTeamById, type Match, type Team } from '@/lib/firebase'

interface LiveBracketProps {
    event: any
    categoryId: string
    teams: Team[]
}

export function LiveBracket({ event, categoryId, teams: allTeams }: LiveBracketProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [teamMap, setTeamMap] = useState<Record<string, Team>>({})

    useEffect(() => {
        async function loadData() {
            try {
                const results = await getMatchesByCategory(event.id, categoryId)
                setMatches(results)

                // Build a team map for quick access
                const map: Record<string, Team> = {}
                for (const t of allTeams) {
                    if (t.id) map[t.id] = t
                }
                setTeamMap(map)
            } catch (error) {
                console.error("Error loading bracket:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [event.id, categoryId, allTeams])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="loading-spinner" style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    if (matches.length === 0) {
        return (
            <div className="empty-state">
                <p>El eliminatorio para esta categoría aún no ha sido generado.</p>
            </div>
        )
    }

    // Helper to get match by round and relative index in that round
    const getMatch = (round: number, indexInRound: number) => {
        const roundMatches = matches.filter(m => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber)
        return roundMatches[indexInRound]
    }

    const TeamSlot = ({ teamId, placeholder }: { teamId?: string, placeholder: string }) => {
        const team = teamId ? teamMap[teamId] : null
        return (
            <div className={`team ${!team ? 'empty' : ''}`} style={{ borderLeft: team ? `3px solid ${team.color}` : 'none' }}>
                {team ? (
                    <span className="team-name truncate" style={{ flex: 1 }}>{team.name}</span>
                ) : (
                    <span>{placeholder}</span>
                )}
            </div>
        )
    }

    const MatchItem = ({ match, placeholderA = "TBD", placeholderB = "TBD" }: { match?: Match, placeholderA?: string, placeholderB?: string }) => (
        <div className="match">
            <TeamSlot teamId={match?.teamAId} placeholder={placeholderA} />
            <TeamSlot teamId={match?.teamBId} placeholder={placeholderB} />
        </div>
    )

    return (
        <div className="bracket-container">
            {/* Left Side */}
            <div className="bracket-side bracket-left">
                <div className="bracket-round round-16">
                    <div className="round-label">Octavos</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(1, 0)} />
                        <MatchItem match={getMatch(1, 1)} />
                    </div>
                    <div className="match-group">
                        <MatchItem match={getMatch(1, 2)} />
                        <MatchItem match={getMatch(1, 3)} />
                    </div>
                </div>

                <div className="bracket-round round-8">
                    <div className="round-label">Cuartos</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(2, 0)} />
                    </div>
                    <div className="match-group">
                        <MatchItem match={getMatch(2, 1)} />
                    </div>
                </div>

                <div className="bracket-round round-4">
                    <div className="round-label">Semifinal</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(3, 0)} />
                    </div>
                </div>
            </div>

            {/* Final */}
            <div className="bracket-final">
                <div className="final-trophy">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                </div>
                <div className="round-label">Gran Final</div>
                <div className="match final-match">
                    <TeamSlot teamId={getMatch(4, 0)?.teamAId} placeholder="Finalista 1" />
                    <div className="vs-badge">VS</div>
                    <TeamSlot teamId={getMatch(4, 0)?.teamBId} placeholder="Finalista 2" />
                </div>
                {getMatch(4, 0)?.winnerId && teamMap[getMatch(4, 0)!.winnerId!] && (
                    <div className="champion-slot">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                        {teamMap[getMatch(4, 0)!.winnerId!]?.name}
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="bracket-side bracket-right">
                <div className="bracket-round round-4">
                    <div className="round-label">Semifinal</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(3, 1)} />
                    </div>
                </div>

                <div className="bracket-round round-8">
                    <div className="round-label">Cuartos</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(2, 2)} />
                    </div>
                    <div className="match-group">
                        <MatchItem match={getMatch(2, 3)} />
                    </div>
                </div>

                <div className="bracket-round round-16">
                    <div className="round-label">Octavos</div>
                    <div className="match-group">
                        <MatchItem match={getMatch(1, 4)} />
                        <MatchItem match={getMatch(1, 5)} />
                    </div>
                    <div className="match-group">
                        <MatchItem match={getMatch(1, 6)} />
                        <MatchItem match={getMatch(1, 7)} />
                    </div>
                </div>
            </div>
        </div>
    )
}
