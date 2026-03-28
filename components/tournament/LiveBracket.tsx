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

    // Group matches by education level
    const groupedMatches = matches.reduce<Record<string, Match[]>>((acc, match) => {
        const level = match.educationLevel || 'General'
        if (!acc[level]) acc[level] = []
        acc[level].push(match)
        return acc
    }, {})

    // Calculate bracket size based on matches
    const calculateBracketSize = (levelMatches: Match[]) => {
        const bracketMatches = levelMatches.filter(m => m.stage === 'bracket')
        if (bracketMatches.length === 0) return 0

        // Find all unique rounds
        const rounds = [...new Set(bracketMatches.map(m => m.round))]

        if (rounds.length === 0) return 0

        // The highest round number represents the first round of the complete bracket
        const firstRound = Math.max(...rounds)

        // Bracket size is firstRound * 2
        // Round 8 = 16 teams, Round 4 = 8 teams, Round 2 = 4 teams, Round 1 = 2 teams
        return firstRound * 2
    }

    // Generate round structure for dynamic bracket
    const generateBracketRounds = (bracketSize: number) => {
        const rounds = []
        let currentSize = bracketSize

        while (currentSize >= 2) {
            rounds.unshift({
                size: currentSize,
                round: currentSize / 2,
                label: currentSize === 2 ? 'Final' :
                       currentSize === 4 ? 'Semifinal' :
                       currentSize === 8 ? 'Cuartos' :
                       currentSize === 16 ? 'Octavos' :
                       currentSize === 32 ? 'Dieciseisavos' :
                       `Ronda ${currentSize / 2}`
            })
            currentSize /= 2
        }

        return rounds
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {Object.entries(groupedMatches).map(([level, levelMatches]) => {
                const bracketSize = calculateBracketSize(levelMatches)
                const bracketRounds = generateBracketRounds(bracketSize)

                // Helper to get match by round and relative index in that round FOR THIS SPECIFIC LEVEL
                const getMatch = (round: number, indexInRound: number) => {
                    const roundMatches = levelMatches.filter(m => m.round === round).sort((a, b) => a.matchNumber - b.matchNumber)
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

                // Dynamic bracket rendering
                let bracketContent

                if (bracketSize === 2) {
                    // Simple final match
                    bracketContent = (
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
                                <TeamSlot teamId={getMatch(1, 0)?.teamAId} placeholder="Finalista 1" />
                                <div className="vs-badge">VS</div>
                                <TeamSlot teamId={getMatch(1, 0)?.teamBId} placeholder="Finalista 2" />
                            </div>
                            {getMatch(1, 0)?.winnerId && teamMap[getMatch(1, 0)!.winnerId!] && (
                                <div className="champion-slot">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                    {teamMap[getMatch(1, 0)!.winnerId!]?.name}
                                </div>
                            )}
                        </div>
                    )
                } else {
                    // For larger brackets, create a balanced layout
                    const leftRounds: Array<{size: number, round: number, label: string}> = []
                    const rightRounds: Array<{size: number, round: number, label: string}> = []

                    // Distribute rounds: put earlier rounds on left, later rounds on right
                    // For example: 16-team: Left[16,8,4], Right[4,8,16] but reversed visually
                    bracketRounds.forEach((round, index) => {
                        if (index < Math.floor(bracketRounds.length / 2)) {
                            leftRounds.push(round)
                        } else {
                            rightRounds.unshift(round) // Add to beginning for visual order
                        }
                    })

                    bracketContent = (
                        <div className="bracket-container">
                            {/* Left Side */}
                            <div className="bracket-side bracket-left">
                                {leftRounds.map((round) => (
                                    <div key={`left-${round.size}`} className={`bracket-round round-${round.size}`}>
                                        <div className="round-label">{round.label}</div>
                                        {Array.from({ length: round.size / 4 }, (_, groupIndex) => (
                                            <div key={`left-${round.size}-group-${groupIndex}`} className="match-group">
                                                {Array.from({ length: Math.min(2, round.size / 2 - groupIndex * 2) }, (_, matchIndex) => (
                                                    <MatchItem
                                                        key={`left-${round.size}-group-${groupIndex}-match-${matchIndex}`}
                                                        match={getMatch(round.round, groupIndex * 2 + matchIndex)}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
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
                                    <TeamSlot teamId={getMatch(1, 0)?.teamAId} placeholder="Finalista 1" />
                                    <div className="vs-badge">VS</div>
                                    <TeamSlot teamId={getMatch(1, 0)?.teamBId} placeholder="Finalista 2" />
                                </div>
                                {getMatch(1, 0)?.winnerId && teamMap[getMatch(1, 0)!.winnerId!] && (
                                    <div className="champion-slot">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                            <path d="M4 22h16"></path>
                                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                        </svg>
                                        {teamMap[getMatch(1, 0)!.winnerId!]?.name}
                                    </div>
                                )}
                            </div>

                            {/* Right Side */}
                            <div className="bracket-side bracket-right">
                                {rightRounds.map((round) => (
                                    <div key={`right-${round.size}`} className={`bracket-round round-${round.size}`}>
                                        <div className="round-label">{round.label}</div>
                                        {Array.from({ length: round.size / 4 }, (_, groupIndex) => (
                                            <div key={`right-${round.size}-group-${groupIndex}`} className="match-group">
                                                {Array.from({ length: Math.min(2, round.size / 2 - groupIndex * 2) }, (_, matchIndex) => {
                                                    // For right side, offset by half the round size
                                                    const rightOffset = round.size / 2
                                                    return (
                                                        <MatchItem
                                                            key={`right-${round.size}-group-${groupIndex}-match-${matchIndex}`}
                                                            match={getMatch(round.round, rightOffset + groupIndex * 2 + matchIndex)}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                return (
                    <div key={level}>
                        {Object.keys(groupedMatches).length > 1 && (
                            <h4 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', textAlign: 'center' }}>
                                Nivel: {level} ({bracketSize} equipos)
                            </h4>
                        )}
                        {bracketContent}
                    </div>
                )
            })}
        </div>
    )
}
