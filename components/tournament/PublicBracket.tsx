'use client'

import React, { useEffect, useState } from 'react'
import { getMatchesByCategory, type Match, type Team } from '@/lib/firebase'

// Label based on position relative to the final (0 = final, 1 = semis, 2 = quarters…)
function getRoundLabel(roundsFromFinal: number): string {
    switch (roundsFromFinal) {
        case 0: return 'Gran Final'
        case 1: return 'Semifinales'
        case 2: return 'Cuartos de Final'
        case 3: return 'Octavos de Final'
        case 4: return 'Dieciseisavos'
        default: return `Ronda ${roundsFromFinal + 1}`
    }
}

interface PublicBracketProps {
    eventId: string
    categoryId: string
    teams: Team[]
}

export function PublicBracket({ eventId, categoryId, teams }: PublicBracketProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const results = await getMatchesByCategory(eventId, categoryId)
                setMatches(results.filter(m => m.stage === 'bracket'))
            } catch (error) {
                console.error('Error loading bracket:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [eventId, categoryId])

    const getTeamName = (teamId?: string) => {
        if (!teamId) return 'TBD'
        return teams.find(t => t.id === teamId)?.name || 'Desconocido'
    }

    const getTeamColor = (teamId?: string) => {
        if (!teamId) return undefined
        return teams.find(t => t.id === teamId)?.color
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (matches.length === 0) {
        return (
            <div className="empty-state">
                <p>El bracket para esta categoría aún no ha sido generado.</p>
            </div>
        )
    }

    // Group by education level
    const levelMap = new Map<string, Match[]>()
    for (const m of matches) {
        const level = m.educationLevel || 'General'
        if (!levelMap.has(level)) levelMap.set(level, [])
        levelMap.get(level)!.push(m)
    }

    const levels = [...levelMap.keys()]
    const showLevelHeaders = levels.length > 1

    // ── Match card (read-only) ──
    const MatchCard = ({ match }: { match: Match }) => {
        const isCompleted = match.status === 'completed'
        const winnerA = match.winnerId === match.teamAId
        const winnerB = match.winnerId === match.teamBId
        const colorA = getTeamColor(match.teamAId)
        const colorB = getTeamColor(match.teamBId)

        return (
            <div style={{
                minWidth: '170px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '0.5rem',
                overflow: 'hidden',
            }}>
                {/* Team A */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.6rem',
                    borderLeft: colorA ? `3px solid ${colorA}` : '3px solid transparent',
                    background: winnerA ? 'rgba(52,211,153,0.08)' : 'transparent',
                }}>
                    <span style={{
                        flex: 1, fontSize: '0.8rem',
                        fontWeight: winnerA ? 700 : 400,
                        color: winnerA ? '#34D399' : (match.teamAId ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)'),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {getTeamName(match.teamAId)}
                        {winnerA && ' 🏆'}
                    </span>
                    {isCompleted && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: winnerA ? '#34D399' : 'rgba(255,255,255,0.5)', minWidth: '16px', textAlign: 'right' }}>
                            {match.scoreA ?? 0}
                        </span>
                    )}
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                {/* Team B */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.6rem',
                    borderLeft: colorB ? `3px solid ${colorB}` : '3px solid transparent',
                    background: winnerB ? 'rgba(52,211,153,0.08)' : 'transparent',
                }}>
                    <span style={{
                        flex: 1, fontSize: '0.8rem',
                        fontWeight: winnerB ? 700 : 400,
                        color: winnerB ? '#34D399' : (match.teamBId ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)'),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {getTeamName(match.teamBId)}
                        {winnerB && ' 🏆'}
                    </span>
                    {isCompleted && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: winnerB ? '#34D399' : 'rgba(255,255,255,0.5)', minWidth: '16px', textAlign: 'right' }}>
                            {match.scoreB ?? 0}
                        </span>
                    )}
                </div>

                {/* Status bar */}
                <div style={{
                    padding: '0.15rem 0.6rem',
                    background: isCompleted ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.02)',
                    textAlign: 'center', fontSize: '0.6rem',
                    color: isCompleted ? '#34D399' : 'rgba(255,255,255,0.3)',
                }}>
                    {isCompleted ? '✓ Completado' : 'Pendiente'}
                </div>
            </div>
        )
    }

    // ── Render bracket for one education level ──
    const renderLevelBracket = (levelMatches: Match[]) => {
        // Group by round
        const roundMap = new Map<number, Match[]>()
        for (const m of levelMatches) {
            if (!roundMap.has(m.round)) roundMap.set(m.round, [])
            roundMap.get(m.round)!.push(m)
        }
        for (const [, rm] of roundMap) rm.sort((a, b) => a.matchNumber - b.matchNumber)

        // Detect missing final: if no round with 1 match exists, the final is missing
        const allRoundKeys = [...roundMap.keys()]
        const hasRealFinal = allRoundKeys.some(r => (roundMap.get(r)?.length || 0) === 1)
        if (!hasRealFinal) {
            const semiRound = allRoundKeys.find(r => (roundMap.get(r)?.length || 0) === 2)
            if (semiRound !== undefined) {
                const semiMatches = roundMap.get(semiRound) || []
                const allDone = semiMatches.every(m => m.status === 'completed' && m.winnerId)
                const virtualRoundNum = 9999
                const virtualFinal: Match = {
                    id: '__virtual_final__',
                    eventId,
                    categoryId,
                    round: virtualRoundNum,
                    matchNumber: 9999,
                    teamAId: allDone ? (semiMatches[0]?.winnerId || '') : '',
                    teamBId: allDone ? (semiMatches[1]?.winnerId || '') : '',
                    stage: 'bracket',
                    status: 'pending' as const,
                    educationLevel: semiMatches[0]?.educationLevel,
                    createdAt: new Date() as any,
                }
                roundMap.set(virtualRoundNum, [virtualFinal])
            }
        }

        // Sort by descending match count (most matches = first elimination round → fewest = final)
        const sortedRounds = [...roundMap.keys()].sort((a, b) => {
            const countA = roundMap.get(a)?.length || 0
            const countB = roundMap.get(b)?.length || 0
            if (countA !== countB) return countB - countA
            return a - b
        })

        // Champion
        const finalRound = sortedRounds[sortedRounds.length - 1]
        const finalMatch = finalRound !== undefined ? roundMap.get(finalRound)?.[0] : undefined
        const championId = finalMatch?.winnerId
        const championTeam = championId ? teams.find(t => t.id === championId) : null

        return (
            <div style={{ overflowX: 'auto', padding: '1rem 0' }}>
                <div style={{ display: 'flex', gap: '0', alignItems: 'stretch', minHeight: '250px' }}>
                    {sortedRounds.map((round, roundIdx) => {
                        const roundMatches = roundMap.get(round) || []
                        const matchCount = roundMatches.length
                        const isFinal = roundIdx === sortedRounds.length - 1

                        return (
                            <div key={round} style={{ display: 'flex', alignItems: 'stretch' }}>
                                {/* Round column */}
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    minWidth: '200px', padding: '0 0.5rem',
                                }}>
                                    {/* Round header */}
                                    <div style={{
                                        textAlign: 'center', marginBottom: '0.75rem',
                                        padding: '0.3rem 0.6rem',
                                        background: isFinal ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: isFinal ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        color: isFinal ? '#FCD34D' : 'rgba(255,255,255,0.5)',
                                    }}>
                                        {getRoundLabel(sortedRounds.length - 1 - roundIdx)}
                                    </div>

                                    {/* Match cards */}
                                    <div style={{
                                        flex: 1, display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-around', gap: '0.5rem',
                                    }}>
                                        {roundMatches.map((match) => (
                                            <MatchCard key={match.id} match={match} />
                                        ))}
                                    </div>
                                </div>

                                {/* Connector lines */}
                                {roundIdx < sortedRounds.length - 1 && (
                                    <div style={{
                                        width: '24px', display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-around', alignItems: 'center',
                                    }}>
                                        {roundMatches.map((_, pairIdx) => {
                                            if (pairIdx % 2 !== 0) return null
                                            const pairCount = Math.ceil(matchCount / 2)
                                            return (
                                                <svg
                                                    key={pairIdx}
                                                    viewBox="0 0 24 60"
                                                    style={{
                                                        width: '24px',
                                                        flex: `1 1 ${100 / pairCount}%`,
                                                        overflow: 'visible',
                                                    }}
                                                    preserveAspectRatio="none"
                                                >
                                                    <line x1="0" y1="25%" x2="12" y2="25%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                                                    <line x1="0" y1="75%" x2="12" y2="75%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                                                    <line x1="12" y1="25%" x2="12" y2="75%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                                                    <line x1="12" y1="50%" x2="24" y2="50%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                                                </svg>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Champion column */}
                    {sortedRounds.length > 0 && (
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            minWidth: '140px', padding: '0 0.75rem',
                        }}>
                            {championTeam ? (
                                <div style={{
                                    textAlign: 'center', padding: '1.25rem 1.25rem',
                                    background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(249,115,22,0.08))',
                                    border: '1px solid rgba(234,179,8,0.35)',
                                    borderRadius: '0.75rem',
                                    animation: 'public-bracket-glow 2s ease-in-out infinite alternate',
                                }}>
                                    <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>🏆</div>
                                    <div style={{ fontSize: '0.65rem', color: '#FCD34D', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                        Campeón
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                                        borderLeft: `3px solid ${championTeam.color}`,
                                        paddingLeft: '0.5rem', textAlign: 'left',
                                    }}>
                                        {championTeam.name}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center', padding: '1rem 1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px dashed rgba(255,255,255,0.08)',
                                    borderRadius: '0.75rem',
                                }}>
                                    <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem', opacity: 0.25 }}>🏆</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                                        Por definir
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {levels.map(level => (
                <div key={level}>
                    {showLevelHeaders && (
                        <h4 style={{
                            fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)',
                            marginBottom: '0.75rem', paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            textAlign: 'center',
                        }}>
                            📚 {level}
                        </h4>
                    )}
                    {renderLevelBracket(levelMap.get(level)!)}
                </div>
            ))}

            <style jsx>{`
                @keyframes public-bracket-glow {
                    from { box-shadow: 0 0 6px rgba(234,179,8,0.1); }
                    to { box-shadow: 0 0 16px rgba(234,179,8,0.25); }
                }
            `}</style>
        </div>
    )
}
