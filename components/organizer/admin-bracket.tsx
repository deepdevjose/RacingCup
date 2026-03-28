'use client'

import React, { useState, useEffect } from 'react'
import {
    getMatchesByCategory,
    updateMatch,
    deleteMatch,
    createMatch,
    type Match,
    type Team
} from '@/lib/matchDB'

interface AdminBracketProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onMatchUpdated?: () => void
}

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

export function AdminBracket({ eventId, categoryId, teams, onMatchUpdated }: AdminBracketProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [editingMatch, setEditingMatch] = useState<Match | null>(null)
    const [filterLevel, setFilterLevel] = useState<string>('all')
    const [deletingBracket, setDeletingBracket] = useState(false)

    useEffect(() => {
        loadMatches()
    }, [eventId, categoryId])

    // Auto-select first education level when only one exists
    useEffect(() => {
        if (matches.length > 0 && filterLevel === 'all') {
            const levelsPresent = [...new Set(matches.map(m => m.educationLevel).filter(Boolean))] as string[]
            if (levelsPresent.length === 1) {
                setFilterLevel(levelsPresent[0])
            }
        }
    }, [matches, filterLevel])

    async function loadMatches() {
        setLoading(true)
        try {
            let allMatches = await getMatchesByCategory(eventId, categoryId)
            allMatches = allMatches.filter(m => m.stage === 'bracket')
            setMatches(allMatches)
        } catch (error) {
            console.error('Error loading matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const cleanFirestoreData = (data: Record<string, any>) => {
        const cleaned: Record<string, any> = {}
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) cleaned[key] = value
        }
        return cleaned
    }

    const getTeamName = (teamId?: string) => {
        if (!teamId) return 'TBD'
        return teams.find(t => t.id === teamId)?.name || 'Desconocido'
    }

    const getTeamColor = (teamId?: string) => {
        if (!teamId) return undefined
        return teams.find(t => t.id === teamId)?.color
    }

    // ── Group matches into a bracket structure ──

    const visibleMatches = filterLevel === 'all'
        ? matches
        : matches.filter(m => m.educationLevel === filterLevel)

    const levelsPresent = [...new Set(matches.map(m => m.educationLevel).filter(Boolean))] as string[]
    const hasLevelFilter = levelsPresent.length > 1

    // Group by round and sort
    const roundMap = new Map<number, Match[]>()
    for (const m of visibleMatches) {
        if (!roundMap.has(m.round)) roundMap.set(m.round, [])
        roundMap.get(m.round)!.push(m)
    }
    // Sort matches within each round by matchNumber
    for (const [, roundMatches] of roundMap) {
        roundMatches.sort((a, b) => a.matchNumber - b.matchNumber)
    }

    // Auto-create missing final: if semis are done but no final match exists, create it in Firebase
    const allRoundKeys = [...roundMap.keys()]
    const hasRealFinal = allRoundKeys.some(r => (roundMap.get(r)?.length || 0) === 1)
    const semiRound = allRoundKeys.find(r => (roundMap.get(r)?.length || 0) === 2)
    const needsFinal = !hasRealFinal && semiRound !== undefined
    const semiMatches = needsFinal ? (roundMap.get(semiRound!) || []) : []
    const semisAllDone = needsFinal && semiMatches.every(m => m.status === 'completed' && m.winnerId)

    useEffect(() => {
        if (!semisAllDone || !semiMatches.length) return
        // Create the real final match in Firebase
        const maxRound = Math.max(...visibleMatches.map(m => m.round))
        const maxMatchNum = Math.max(...visibleMatches.map(m => m.matchNumber))
        createMatch({
            eventId,
            categoryId,
            round: maxRound + 1,
            matchNumber: maxMatchNum + 1,
            teamAId: semiMatches[0]?.winnerId || '',
            teamBId: semiMatches[1]?.winnerId || '',
            stage: 'bracket',
            status: 'pending',
            educationLevel: semiMatches[0]?.educationLevel,
        }).then(() => {
            loadMatches() // Refresh to pick up the new match
        }).catch(err => console.error('Error creating final match:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semisAllDone])

    // Sort rounds by descending match count (most matches = first elimination round → fewest = final)
    // Use round number as tiebreaker for equal counts
    const sortedRounds = [...roundMap.keys()].sort((a, b) => {
        const countA = roundMap.get(a)?.length || 0
        const countB = roundMap.get(b)?.length || 0
        if (countA !== countB) return countB - countA
        return a - b // lower round number first for equal counts
    })

    // Final is the round with 1 match (the last in sorted order)
    const finalRound = sortedRounds[sortedRounds.length - 1]
    const finalMatch = finalRound !== undefined ? roundMap.get(finalRound)?.[0] : undefined
    const championId = finalMatch?.winnerId
    const championTeam = championId ? teams.find(t => t.id === championId) : null

    // ── Delete bracket ──

    const handleDeleteBracket = async (level?: string) => {
        const levelText = level ? ` del nivel "${level}"` : ''
        if (!confirm(`¿Eliminar TODOS los partidos de eliminatorias${levelText}?\n\nEsta acción no se puede deshacer.`)) return
        setDeletingBracket(true)
        try {
            let toDelete = matches.filter(m => m.stage === 'bracket')
            if (level && level !== 'all') toDelete = toDelete.filter(m => m.educationLevel === level)
            await Promise.all(toDelete.map(m => m.id ? deleteMatch(m.id) : Promise.resolve()))
            await loadMatches()
            onMatchUpdated?.()
            alert(`✅ Eliminados ${toDelete.length} partidos${levelText}`)
        } catch (error) {
            console.error('Error deleting bracket:', error)
            alert('❌ Error al eliminar')
        } finally {
            setDeletingBracket(false)
        }
    }

    // ── Save match result and advance bracket ──

    const handleSaveMatch = async (match: Match) => {
        if (!match.id) return
        try {
            await updateMatch(match.id, cleanFirestoreData({
                scoreA: match.scoreA,
                scoreB: match.scoreB,
                koPointsA: match.koPointsA,
                koPointsB: match.koPointsB,
                goalsA: match.goalsA,
                goalsB: match.goalsB,
                timeA: match.timeA,
                timeB: match.timeB,
                winnerId: match.winnerId,
                status: 'completed'
            }))

            // Bracket progression: advance winners if not the final
            const currentRoundMatchCount = visibleMatches.filter(
                m => m.round === match.round && m.educationLevel === match.educationLevel
            ).length
            if (match.winnerId && currentRoundMatchCount > 1) {
                // Not the final – check if all matches this round are done
                const currentRoundMatches = visibleMatches.filter(
                    m => m.round === match.round && m.educationLevel === match.educationLevel
                )
                const allComplete = currentRoundMatches.every(
                    m => m.id === match.id ? true : (m.status === 'completed' && m.winnerId)
                )

                if (allComplete) {
                    const sorted = [...currentRoundMatches].sort((a, b) => a.matchNumber - b.matchNumber)
                    const updated = sorted.map(m => m.id === match.id ? match : m)
                    const winners = updated.map(m => m.winnerId as string)

                    const nextRound = match.round + 1
                    const nextRoundMatches = visibleMatches
                        .filter(m => m.round === nextRound && m.educationLevel === match.educationLevel)
                        .sort((a, b) => a.matchNumber - b.matchNumber)

                    let nextMatchNumber = Math.max(...matches.map(m => m.matchNumber)) + 1

                    for (let i = 0; i < winners.length; i += 2) {
                        const targetIdx = i / 2
                        if (nextRoundMatches[targetIdx]) {
                            await updateMatch(nextRoundMatches[targetIdx].id || '', cleanFirestoreData({
                                teamAId: winners[i] || '',
                                teamBId: winners[i + 1] || '',
                                scoreA: 0, scoreB: 0,
                                koPointsA: 0, koPointsB: 0,
                                winnerId: undefined,
                                status: 'pending'
                            }))
                        } else {
                            await createMatch({
                                eventId,
                                categoryId,
                                round: nextRound,
                                matchNumber: nextMatchNumber++,
                                teamAId: winners[i] || '',
                                teamBId: winners[i + 1] || '',
                                stage: 'bracket',
                                status: 'pending',
                                ...(match.educationLevel ? { educationLevel: match.educationLevel } : {})
                            })
                        }
                    }
                }
            } else if (match.winnerId) {
                // Final match completed – set category winner
                const { setCategoryWinner } = await import('@/lib/firebase')
                const runnerUpId = match.teamAId === match.winnerId ? match.teamBId : match.teamAId
                await setCategoryWinner(eventId, categoryId, {
                    firstTeamId: match.winnerId,
                    secondTeamId: runnerUpId,
                    confirmedAt: new Date() as any
                })
            }

            await loadMatches()
            onMatchUpdated?.()
            setEditingMatch(null)
            alert('✅ Resultado guardado')
        } catch (error) {
            console.error('Error saving match:', error)
            alert('Error al guardar resultado')
        }
    }

    // ── Render helpers ──

    const MatchCard = ({ match, roundIdx }: { match: Match; roundIdx: number }) => {
        const isCompleted = match.status === 'completed'
        const winnerA = match.winnerId === match.teamAId
        const winnerB = match.winnerId === match.teamBId
        const colorA = getTeamColor(match.teamAId)
        const colorB = getTeamColor(match.teamBId)

        return (
            <div
                className="bracket-match-card"
                onClick={() => setEditingMatch({ ...match })}
                style={{
                    minWidth: '180px',
                    background: '#1e293b',
                    border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Match Number Badge */}
                <div style={{
                    position: 'absolute', top: '4px', right: '6px',
                    fontSize: '0.65rem', color: '#475569', fontWeight: 600,
                }}>
                    M{match.matchNumber}
                </div>

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
                        color: winnerA ? '#34D399' : (match.teamAId ? '#CBD5E1' : '#475569'),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {getTeamName(match.teamAId)}
                        {winnerA && ' 🏆'}
                    </span>
                    {isCompleted && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: winnerA ? '#34D399' : '#94a3b8', minWidth: '16px', textAlign: 'right' }}>
                            {match.scoreA ?? 0}
                        </span>
                    )}
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

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
                        color: winnerB ? '#34D399' : (match.teamBId ? '#CBD5E1' : '#475569'),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {getTeamName(match.teamBId)}
                        {winnerB && ' 🏆'}
                    </span>
                    {isCompleted && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: winnerB ? '#34D399' : '#94a3b8', minWidth: '16px', textAlign: 'right' }}>
                            {match.scoreB ?? 0}
                        </span>
                    )}
                </div>

                {/* Status indicator */}
                <div style={{
                    padding: '0.2rem 0.6rem',
                    background: isCompleted ? 'rgba(52,211,153,0.06)' : 'rgba(148,163,184,0.04)',
                    textAlign: 'center', fontSize: '0.65rem',
                    color: isCompleted ? '#34D399' : '#64748b',
                }}>
                    {isCompleted ? '✓ Completado' : 'Pendiente — clic para registrar'}
                </div>
            </div>
        )
    }

    // ── Loading / Empty states ──

    if (loading) return (
        <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Cargando bracket...</div>
    )

    if (matches.length === 0) {
        return (
            <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8' }}>
                    No hay partidos de eliminatoria generados. Ve a la pestaña "Gestión" para generar el bracket.
                </p>
            </div>
        )
    }

    const pending = visibleMatches.filter(m => m.status !== 'completed').length
    const done = visibleMatches.filter(m => m.status === 'completed').length

    return (
        <div>
            {/* ── Top Bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', color: '#34D399' }}>
                        ✓ {done} completados
                    </span>
                    <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '0.35rem', color: '#94a3b8' }}>
                        ⏳ {pending} pendientes
                    </span>
                </div>

                {hasLevelFilter && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', fontSize: '0.8rem' }}>
                        {['all', ...levelsPresent].map(lv => (
                            <button
                                key={lv}
                                onClick={() => setFilterLevel(lv)}
                                style={{
                                    padding: '0.25rem 0.6rem', borderRadius: '0.35rem',
                                    border: '1px solid', cursor: 'pointer',
                                    borderColor: filterLevel === lv ? '#E32636' : '#334155',
                                    background: filterLevel === lv ? 'rgba(227,38,54,0.1)' : 'transparent',
                                    color: filterLevel === lv ? '#F87171' : '#94a3b8',
                                }}
                            >
                                {lv === 'all' ? 'Todos' : lv}
                            </button>
                        ))}
                    </div>
                )}

                {matches.some(m => m.stage === 'bracket') && (
                    <div style={{ marginLeft: hasLevelFilter ? '1rem' : 'auto' }}>
                        <button
                            onClick={() => handleDeleteBracket(filterLevel !== 'all' ? filterLevel : undefined)}
                            disabled={deletingBracket}
                            style={{
                                padding: '0.25rem 0.75rem', borderRadius: '0.35rem',
                                border: '1px solid #DC2626', background: 'rgba(220,38,38,0.1)',
                                color: '#F87171', cursor: deletingBracket ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem', fontWeight: 500, opacity: deletingBracket ? 0.6 : 1,
                            }}
                        >
                            {deletingBracket ? 'Eliminando...' : `🗑️ Borrar Bracket${filterLevel !== 'all' ? ` "${filterLevel}"` : ''}`}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Visual Bracket ── */}
            <div style={{
                overflowX: 'auto', padding: '1rem 0',
            }}>
                <div style={{
                    display: 'flex', gap: '0', alignItems: 'stretch', minHeight: '300px',
                }}>
                    {sortedRounds.map((round, roundIdx) => {
                        const roundMatches = roundMap.get(round) || []
                        const matchCount = roundMatches.length
                        const isFinal = roundIdx === sortedRounds.length - 1

                        return (
                            <div key={round} style={{ display: 'flex', alignItems: 'stretch' }}>
                                {/* Round column */}
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    minWidth: '210px', padding: '0 0.5rem',
                                }}>
                                    {/* Round header */}
                                    <div style={{
                                        textAlign: 'center', marginBottom: '1rem',
                                        padding: '0.35rem 0.75rem',
                                        background: isFinal ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.04)',
                                        border: isFinal ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.8rem', fontWeight: 600,
                                        color: isFinal ? '#FCD34D' : '#94a3b8',
                                    }}>
                                        {getRoundLabel(sortedRounds.length - 1 - roundIdx)}
                                    </div>

                                    {/* Match cards with spacing */}
                                    <div style={{
                                        flex: 1, display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-around', gap: '0.5rem',
                                    }}>
                                        {roundMatches.map((match) => (
                                            <MatchCard key={match.id} match={match} roundIdx={roundIdx} />
                                        ))}
                                    </div>
                                </div>

                                {/* Connector lines between rounds (not after the last round) */}
                                {roundIdx < sortedRounds.length - 1 && (
                                    <div style={{
                                        width: '24px', display: 'flex', flexDirection: 'column',
                                        justifyContent: 'space-around', alignItems: 'center',
                                        position: 'relative',
                                    }}>
                                        {roundMatches.map((_, pairIdx) => {
                                            if (pairIdx % 2 !== 0) return null
                                            const pairCount = Math.ceil(matchCount / 2)
                                            // Draw a bracket connector for each pair
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
                                                    {/* Top line */}
                                                    <line x1="0" y1="25%" x2="12" y2="25%"
                                                        stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                                                    {/* Bottom line */}
                                                    <line x1="0" y1="75%" x2="12" y2="75%"
                                                        stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                                                    {/* Vertical connecting line */}
                                                    <line x1="12" y1="25%" x2="12" y2="75%"
                                                        stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                                                    {/* Output to next round */}
                                                    <line x1="12" y1="50%" x2="24" y2="50%"
                                                        stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                                                </svg>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* ── Champion column ── */}
                    {sortedRounds.length > 0 && (
                        <div style={{
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            minWidth: '160px', padding: '0 1rem',
                        }}>
                            {championTeam ? (
                                <div style={{
                                    textAlign: 'center', padding: '1.25rem 1.5rem',
                                    background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.1))',
                                    border: '1px solid rgba(234,179,8,0.4)',
                                    borderRadius: '0.75rem',
                                    animation: 'bracket-champion-glow 2s ease-in-out infinite alternate',
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                                    <div style={{ fontSize: '0.7rem', color: '#FCD34D', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                        Campeón
                                    </div>
                                    <div style={{
                                        fontSize: '1rem', fontWeight: 700, color: '#fff',
                                        borderLeft: `3px solid ${championTeam.color}`,
                                        paddingLeft: '0.5rem',
                                    }}>
                                        {championTeam.name}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center', padding: '1.25rem 1.5rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>🏆</div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                                        Por definir
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Champion Glow Animation ── */}
            <style jsx>{`
                @keyframes bracket-champion-glow {
                    from { box-shadow: 0 0 8px rgba(234,179,8,0.15); }
                    to { box-shadow: 0 0 20px rgba(234,179,8,0.3); }
                }
                .bracket-match-card:hover {
                    border-color: rgba(227,38,54,0.5) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
            `}</style>

            {/* ── Score Entry Modal ── */}
            {editingMatch && (() => {
                const isMinisumo = categoryId.toLowerCase().includes('sumo') || categoryId.toLowerCase().includes('mini')
                const isRCCar = categoryId.toLowerCase().includes('rc') || categoryId.toLowerCase().includes('car')

                const handleMinisumoKOClick = (team: 'A' | 'B', currentKOs: number, newKOs: number) => {
                    let totalA = team === 'A' ? newKOs : (editingMatch.koPointsA ?? 0)
                    let totalB = team === 'B' ? newKOs : (editingMatch.koPointsB ?? 0)
                    totalA = Math.min(2, totalA)
                    totalB = Math.min(2, totalB)
                    if (totalA + totalB > 3) {
                        if (team === 'A') totalB = Math.max(0, 3 - totalA)
                        else totalA = Math.max(0, 3 - totalB)
                    }
                    setEditingMatch({
                        ...editingMatch,
                        koPointsA: totalA, koPointsB: totalB,
                        winnerId: totalA > totalB ? editingMatch.teamAId : (totalB > totalA ? editingMatch.teamBId : undefined)
                    })
                }

                const renderMinisumoCircles = (team: 'A' | 'B', currentKOs: number) => (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {[1, 2].map(num => (
                            <div
                                key={num}
                                onClick={() => handleMinisumoKOClick(team, currentKOs, currentKOs === num ? num - 1 : num)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: `2px solid ${num <= currentKOs ? (team === 'A' ? '#34D399' : '#F87171') : '#475569'}`,
                                    background: num <= currentKOs ? (team === 'A' ? '#34D399' : '#F87171') : 'transparent',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            />
                        ))}
                    </div>
                )

                const getTimeParts = (ms: number) => ({
                    mins: Math.floor(ms / 60000),
                    secs: Math.floor((ms % 60000) / 1000),
                    milli: Math.floor(ms % 1000),
                })

                const handleTimeChange = (team: 'A' | 'B', part: 'mins' | 'secs' | 'milli', val: number) => {
                    const currentParts = getTimeParts(team === 'A' ? (editingMatch.timeA ?? 0) : (editingMatch.timeB ?? 0))
                    currentParts[part] = Math.max(0, val || 0)
                    const totalMs = (currentParts.mins * 60000) + (currentParts.secs * 1000) + currentParts.milli
                    if (team === 'A') setEditingMatch({ ...editingMatch, timeA: totalMs })
                    else setEditingMatch({ ...editingMatch, timeB: totalMs })
                }

                const renderTimeInput = (team: 'A' | 'B') => {
                    const parts = getTimeParts(team === 'A' ? (editingMatch.timeA ?? 0) : (editingMatch.timeB ?? 0))
                    return (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ width: '4rem' }}>
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textAlign: 'center' }}>Min</label>
                                <input type="number" min="0" value={parts.mins} onChange={e => handleTimeChange(team, 'mins', parseInt(e.target.value))} className="admin-input" style={{ padding: '0.2rem', textAlign: 'center' }} />
                            </div>
                            <div style={{ padding: '1rem 0', color: '#64748b' }}>:</div>
                            <div style={{ width: '4rem' }}>
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textAlign: 'center' }}>Seg</label>
                                <input type="number" min="0" max="59" value={parts.secs} onChange={e => handleTimeChange(team, 'secs', parseInt(e.target.value))} className="admin-input" style={{ padding: '0.2rem', textAlign: 'center' }} />
                            </div>
                            <div style={{ padding: '1rem 0', color: '#64748b' }}>.</div>
                            <div style={{ width: '5rem' }}>
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textAlign: 'center' }}>Ms</label>
                                <input type="number" min="0" max="999" value={parts.milli} onChange={e => handleTimeChange(team, 'milli', parseInt(e.target.value))} className="admin-input" style={{ padding: '0.2rem', textAlign: 'center' }} />
                            </div>
                        </div>
                    )
                }

                const handleSave = () => {
                    let matchToSave = { ...editingMatch }

                    if (isMinisumo) {
                        const koA = matchToSave.koPointsA ?? 0
                        const koB = matchToSave.koPointsB ?? 0
                        const winner = koA > koB ? matchToSave.teamAId : (koB > koA ? matchToSave.teamBId : undefined)
                        matchToSave.winnerId = winner
                        matchToSave.scoreA = koA + (winner === matchToSave.teamAId ? 1 : 0)
                        matchToSave.scoreB = koB + (winner === matchToSave.teamBId ? 1 : 0)
                    } else if (isRCCar) {
                        let winner = undefined
                        const tA = matchToSave.timeA || 0
                        const tB = matchToSave.timeB || 0
                        if (tA > 0 && tB > 0) winner = tA < tB ? matchToSave.teamAId : matchToSave.teamBId
                        else if (tA > 0) winner = matchToSave.teamAId
                        else if (tB > 0) winner = matchToSave.teamBId
                        matchToSave.winnerId = winner
                        matchToSave.scoreA = winner === matchToSave.teamAId ? 3 : 0
                        matchToSave.scoreB = winner === matchToSave.teamBId ? 3 : 0
                    }

                    matchToSave.scoreA = matchToSave.scoreA ?? 0
                    matchToSave.scoreB = matchToSave.scoreB ?? 0
                    matchToSave.koPointsA = matchToSave.koPointsA ?? 0
                    matchToSave.koPointsB = matchToSave.koPointsB ?? 0
                    matchToSave.goalsA = matchToSave.goalsA ?? 0
                    matchToSave.goalsB = matchToSave.goalsB ?? 0
                    matchToSave.timeA = matchToSave.timeA ?? 0
                    matchToSave.timeB = matchToSave.timeB ?? 0

                    handleSaveMatch(matchToSave)
                }

                return (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}>
                        <div className="admin-login-card" style={{ maxWidth: '580px', width: '90%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                                    Partido #{editingMatch.matchNumber}
                                    {editingMatch.educationLevel && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '0.35rem', background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', fontWeight: 400 }}>
                                            {editingMatch.educationLevel}
                                        </span>
                                    )}
                                </h2>
                                <button
                                    onClick={() => setEditingMatch(null)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
                                >×</button>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>
                                {getTeamName(editingMatch.teamAId)}
                                <span style={{ color: '#475569', margin: '0 0.75rem' }}>vs</span>
                                {getTeamName(editingMatch.teamBId)}
                            </h3>

                            {isMinisumo ? (
                                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        Marca los círculos (KOs). Máximo 3 en total.<br />
                                        <span style={{ color: '#FCD34D' }}>Puntos = KO + 1 por victoria.</span>
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamAId)}</div>
                                            {renderMinisumoCircles('A', editingMatch.koPointsA ?? 0)}
                                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>{editingMatch.koPointsA ?? 0} KOs</div>
                                        </div>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamBId)}</div>
                                            {renderMinisumoCircles('B', editingMatch.koPointsB ?? 0)}
                                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>{editingMatch.koPointsB ?? 0} KOs</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#CBD5E1', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.35rem' }}>
                                        Resultado: <strong>{(editingMatch.koPointsA ?? 0) + (((editingMatch.koPointsA ?? 0) > (editingMatch.koPointsB ?? 0)) ? 1 : 0)} — {(editingMatch.koPointsB ?? 0) + (((editingMatch.koPointsB ?? 0) > (editingMatch.koPointsA ?? 0)) ? 1 : 0)}</strong>
                                    </div>
                                </div>
                            ) : isRCCar ? (
                                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        Ingresa los tiempos de cada equipo. El menor tiempo gana.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamAId)}</div>
                                            {renderTimeInput('A')}
                                        </div>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamBId)}</div>
                                            {renderTimeInput('B')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                            <label className="admin-label">{getTeamName(editingMatch.teamAId)}</label>
                                            <input type="number" className="admin-input" style={{ textAlign: 'center', fontSize: '1.2rem' }}
                                                value={editingMatch.scoreA ?? 0}
                                                onChange={e => setEditingMatch({ ...editingMatch, scoreA: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'center', color: '#475569', paddingBottom: '0.5rem', fontWeight: 700 }}>—</div>
                                        <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                            <label className="admin-label">{getTeamName(editingMatch.teamBId)}</label>
                                            <input type="number" className="admin-input" style={{ textAlign: 'center', fontSize: '1.2rem' }}
                                                value={editingMatch.scoreB ?? 0}
                                                onChange={e => setEditingMatch({ ...editingMatch, scoreB: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="admin-label">Ganador</label>
                                        <select className="admin-input"
                                            value={editingMatch.winnerId || ''}
                                            onChange={e => setEditingMatch({ ...editingMatch, winnerId: e.target.value || undefined })}
                                        >
                                            <option value="">— Empate / Sin definir —</option>
                                            <option value={editingMatch.teamAId}>{getTeamName(editingMatch.teamAId)}</option>
                                            <option value={editingMatch.teamBId}>{getTeamName(editingMatch.teamBId)}</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn-admin-login"
                                    style={{ flex: 1, background: 'transparent', border: '1px solid #334155' }}
                                    onClick={() => setEditingMatch(null)}
                                >Cancelar</button>
                                <button
                                    className="btn-admin-login"
                                    style={{ flex: 1 }}
                                    onClick={handleSave}
                                >💾 Guardar Resultado</button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
