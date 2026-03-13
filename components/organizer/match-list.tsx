'use client'

import React, { useState, useEffect } from 'react'
import {
    getMatchesByCategory,
    updateMatch,
    updateStandingStats,
    type Match,
    type Team
} from '@/lib/matchDB'

interface MatchListProps {
    eventId: string
    categoryId: string
    teams: Team[]
    filterStage?: 'group' | 'bracket'
    viewMode?: 'list' | 'bracket'
}

const BRACKET_ROUND_LABELS: Record<number, string> = {
    1: 'Gran Final',
    2: 'Semifinales',
    4: 'Cuartos de Final',
    8: 'Octavos de Final',
    16: 'Dieciseisavos',
}

export function MatchList({ eventId, categoryId, teams, filterStage, viewMode = 'list' }: MatchListProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [editingMatch, setEditingMatch] = useState<Match | null>(null)
    const [filterLevel, setFilterLevel] = useState<string>('all')

    // RC Timer States
    const [rcTimerStart, setRcTimerStart] = useState<number | null>(null)
    const [rcTimerCurrent, setRcTimerCurrent] = useState<number>(0)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (rcTimerStart !== null) {
            interval = setInterval(() => {
                setRcTimerCurrent(Date.now() - rcTimerStart)
            }, 50)
        }
        return () => clearInterval(interval)
    }, [rcTimerStart])

    useEffect(() => {
        loadMatches()
    }, [eventId, categoryId, filterStage])

    async function loadMatches() {
        setLoading(true)
        try {
            let allMatches = await getMatchesByCategory(eventId, categoryId)
            if (filterStage) {
                allMatches = allMatches.filter(m => m.stage === filterStage)
            }
            setMatches(allMatches)
        } catch (error) {
            console.error('Error loading matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTeamName = (teamId?: string) => {
        if (!teamId) return 'TBD'
        return teams.find(t => t.id === teamId)?.name || 'Desconocido'
    }

    const getTeamLevel = (teamId?: string) => {
        if (!teamId) return undefined
        return teams.find(t => t.id === teamId)?.educationLevel
    }

    const handleSaveMatch = async (match: Match) => {
        if (!match.id) return
        try {
            await updateMatch(match.id, {
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
            })

            if (match.stage === 'group') {
                await updateStandingStats(eventId, categoryId)
            } else if (match.stage === 'bracket' && match.winnerId && match.round > 1) {
                // Bracket progression: check if all matches for this round and level are complete
                const currentRoundMatches = matches.filter(m => m.stage === 'bracket' && m.round === match.round && m.educationLevel === match.educationLevel);

                // Verify all are completed (considering the one we just saved is now completed in DB)
                const allComplete = currentRoundMatches.every(m => m.id === match.id ? true : m.status === 'completed' && m.winnerId);

                if (allComplete) {
                    const sortedRoundMatches = [...currentRoundMatches].sort((a, b) => a.matchNumber - b.matchNumber);
                    const updatedRoundMatches = sortedRoundMatches.map(m => m.id === match.id ? match : m);
                    const winners = updatedRoundMatches.map(m => m.winnerId as string);

                    const nextRound = match.round / 2; // e.g., 4 (cuartos) -> 2 (semis) -> 1 (final)
                    const nextRoundMatches = matches.filter(m => m.stage === 'bracket' && m.round === nextRound && m.educationLevel === match.educationLevel).sort((a, b) => a.matchNumber - b.matchNumber);

                    let nextMatchNumber = Math.max(...matches.map(m => m.matchNumber)) + 1;

                    for (let i = 0; i < winners.length; i += 2) {
                        const targetMatchIndex = i / 2;

                        if (nextRoundMatches[targetMatchIndex]) {
                            // Match already exists, just update the participants (in case they changed previous round results)
                            await updateMatch(nextRoundMatches[targetMatchIndex].id || "", {
                                teamAId: winners[i] || "",
                                teamBId: winners[i + 1] || "",
                                // Reset score if we are overriding an existing match with new teams
                                scoreA: 0,
                                scoreB: 0,
                                koPointsA: 0,
                                koPointsB: 0,
                                winnerId: undefined,
                                status: 'pending'
                            });
                        } else {
                            // Match doesn't exist, create it
                            const { createMatch } = await import('@/lib/matchDB');
                            await createMatch({
                                eventId,
                                categoryId,
                                round: nextRound,
                                matchNumber: nextMatchNumber++,
                                teamAId: winners[i] || "",
                                teamBId: winners[i + 1] || "",
                                stage: 'bracket',
                                status: 'pending',
                                ...(match.educationLevel ? { educationLevel: match.educationLevel } : {})
                            });
                        }
                    }
                }
            }

            await loadMatches()
            setEditingMatch(null)
            alert('✅ Resultado guardado')
        } catch (error) {
            console.error('Error saving match:', error)
            alert('Error al guardar resultado')
        }
    }

    if (loading) return (
        <div style={{ padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>Cargando partidos...</div>
    )

    // Determine education levels present in these matches
    const levelsPresent = [...new Set(matches.map(m => m.educationLevel).filter(Boolean))] as string[]
    const hasLevelFilter = levelsPresent.length > 1

    // Filter by education level
    const visibleMatches = filterLevel === 'all'
        ? matches
        : matches.filter(m => m.educationLevel === filterLevel || (!m.educationLevel && filterLevel === 'all'))

    // Group matches
    const grouped = visibleMatches.reduce<Record<string, Match[]>>((acc, m) => {
        let key: string
        if (filterStage === 'group') {
            const level = m.educationLevel ? ` — ${m.educationLevel}` : ''
            key = `Ronda ${m.round}${level}`
        } else {
            key = BRACKET_ROUND_LABELS[m.round] || `Ronda ${m.round}`
            if (m.educationLevel) key += ` (${m.educationLevel})`
        }
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
    }, {})

    const pending = visibleMatches.filter(m => m.status !== 'completed').length
    const done = visibleMatches.filter(m => m.status === 'completed').length

    if (visibleMatches.length === 0 && matches.length === 0) {
        return (
            <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8' }}>
                    No hay partidos generados para esta {filterStage === 'group' ? 'fase clasificatoria' : 'fase eliminatoria'}.
                </p>
            </div>
        )
    }

    return (
        <div>
            {/* Summary Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', color: '#34D399' }}>
                        ✓ {done} completados
                    </span>
                    <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '0.35rem', color: '#94a3b8' }}>
                        ⏳ {pending} pendientes
                    </span>
                </div>

                {/* Education level filter */}
                {hasLevelFilter && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', fontSize: '0.8rem' }}>
                        {['all', ...levelsPresent].map(lv => (
                            <button
                                key={lv}
                                onClick={() => setFilterLevel(lv)}
                                style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '0.35rem',
                                    border: '1px solid',
                                    borderColor: filterLevel === lv ? '#E32636' : '#334155',
                                    background: filterLevel === lv ? 'rgba(227,38,54,0.1)' : 'transparent',
                                    color: filterLevel === lv ? '#F87171' : '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                {lv === 'all' ? 'Todos' : lv}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Matches grouped by round */}
            {Object.entries(grouped).map(([roundLabel, roundMatches]) => (
                <div key={roundLabel} style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        padding: '0.4rem 0.75rem', marginBottom: '0.5rem',
                        background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid #E32636',
                        fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', borderRadius: '0 0.35rem 0.35rem 0'
                    }}>
                        {roundLabel}
                        <span style={{ marginLeft: '0.5rem', color: '#64748b', fontWeight: 400 }}>
                            ({roundMatches.length} partidos)
                        </span>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Equipo A</th>
                                    <th style={{ textAlign: 'center' }}>Resultado</th>
                                    <th>Equipo B</th>
                                    <th style={{ width: '100px' }}>Estado</th>
                                    <th style={{ width: '90px' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roundMatches.map(match => {
                                    const levelA = getTeamLevel(match.teamAId)
                                    const isCompleted = match.status === 'completed'
                                    const winnerA = match.winnerId === match.teamAId
                                    const winnerB = match.winnerId === match.teamBId
                                    return (
                                        <tr key={match.id}>
                                            <td><strong style={{ color: '#64748b' }}>M{match.matchNumber}</strong></td>
                                            <td>
                                                <span style={{ fontWeight: winnerA ? 700 : 400, color: winnerA ? '#34D399' : undefined }}>
                                                    {getTeamName(match.teamAId)}
                                                    {winnerA && ' 🏆'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {isCompleted ? (
                                                    <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>
                                                        {match.scoreA ?? 0} — {match.scoreB ?? 0}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#475569', fontSize: '0.8rem' }}>vs</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: winnerB ? 700 : 400, color: winnerB ? '#34D399' : undefined }}>
                                                    {getTeamName(match.teamBId)}
                                                    {winnerB && ' 🏆'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${isCompleted ? 'success' :
                                                    match.status === 'in_progress' ? 'warning' : 'secondary'}`}>
                                                    {isCompleted ? 'Listo' : match.status === 'in_progress' ? 'En Curso' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => setEditingMatch({ ...match })}
                                                >
                                                    {isCompleted ? 'Editar' : 'Registrar'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Score Entry Modal */}
            {editingMatch && (() => {
                const isMinisumo = categoryId.toLowerCase().includes('sumo') || categoryId.toLowerCase().includes('mini')
                const isRCCar = categoryId.toLowerCase().includes('rc') || categoryId.toLowerCase().includes('car')

                // For Minisumo: max 3 KOs combined
                const handleMinisumoKOClick = (team: 'A' | 'B', currentKOs: number, newKOs: number) => {
                    let totalA = team === 'A' ? newKOs : (editingMatch.koPointsA ?? 0);
                    let totalB = team === 'B' ? newKOs : (editingMatch.koPointsB ?? 0);

                    // Cap individual KOs at 2
                    totalA = Math.min(2, totalA);
                    totalB = Math.min(2, totalB);

                    // Cap total combined KOs at 3
                    if (totalA + totalB > 3) {
                        if (team === 'A') totalB = Math.max(0, 3 - totalA);
                        else totalA = Math.max(0, 3 - totalB);
                    }

                    setEditingMatch({
                        ...editingMatch,
                        koPointsA: totalA,
                        koPointsB: totalB,
                        winnerId: totalA > totalB ? editingMatch.teamAId : (totalB > totalA ? editingMatch.teamBId : undefined)
                    });
                };

                const renderMinisumoCircles = (team: 'A' | 'B', currentKOs: number) => {
                    return (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            {[1, 2].map(num => (
                                <div
                                    key={num}
                                    onClick={() => handleMinisumoKOClick(team, currentKOs, currentKOs === num ? num - 1 : num)}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        border: `2px solid ${num <= currentKOs ? (team === 'A' ? '#34D399' : '#F87171') : '#475569'}`,
                                        background: num <= currentKOs ? (team === 'A' ? '#34D399' : '#F87171') : 'transparent',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    )
                }

                // Time parser helpers for RC
                const getTimeParts = (ms: number) => {
                    const mins = Math.floor(ms / 60000)
                    const secs = Math.floor((ms % 60000) / 1000)
                    const milli = Math.floor(ms % 1000)
                    return { mins, secs, milli }
                }

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

                // Wrap save to auto-calculate totals before sending
                const handleSave = () => {
                    let matchToSave = { ...editingMatch }

                    if (isMinisumo) {
                        const koA = matchToSave.koPointsA ?? 0;
                        const koB = matchToSave.koPointsB ?? 0;
                        const winner = koA > koB ? matchToSave.teamAId : (koB > koA ? matchToSave.teamBId : undefined);

                        matchToSave.winnerId = winner;
                        // Score calculation: 1 pt per KO + 1 pt for winning
                        matchToSave.scoreA = koA + (winner === matchToSave.teamAId ? 1 : 0);
                        matchToSave.scoreB = koB + (winner === matchToSave.teamBId ? 1 : 0);
                    } else if (isRCCar) {
                        // Winner gets 3 pts, loser 0. Tiebreaker is time
                        let winner = undefined
                        const tA = matchToSave.timeA || 0;
                        const tB = matchToSave.timeB || 0;
                        if (tA > 0 && tB > 0) {
                            winner = tA < tB ? matchToSave.teamAId : matchToSave.teamBId
                        } else if (tA > 0) {
                            winner = matchToSave.teamAId
                        } else if (tB > 0) {
                            winner = matchToSave.teamBId
                        }
                        matchToSave.winnerId = winner
                        matchToSave.scoreA = winner === matchToSave.teamAId ? 3 : 0
                        matchToSave.scoreB = winner === matchToSave.teamBId ? 3 : 0
                    }

                    // Fallbacks for undefined to satisfy Firebase
                    matchToSave.scoreA = matchToSave.scoreA ?? 0;
                    matchToSave.scoreB = matchToSave.scoreB ?? 0;
                    matchToSave.koPointsA = matchToSave.koPointsA ?? 0;
                    matchToSave.koPointsB = matchToSave.koPointsB ?? 0;
                    matchToSave.goalsA = matchToSave.goalsA ?? 0;
                    matchToSave.goalsB = matchToSave.goalsB ?? 0;
                    matchToSave.timeA = matchToSave.timeA ?? 0;
                    matchToSave.timeB = matchToSave.timeB ?? 0;

                    handleSaveMatch(matchToSave);
                };

                return (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
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
                                >
                                    ×
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>
                                {getTeamName(editingMatch.teamAId)}
                                <span style={{ color: '#475569', margin: '0 0.75rem' }}>vs</span>
                                {getTeamName(editingMatch.teamBId)}
                            </h3>

                            {isMinisumo ? (
                                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        Marca los círculos (KOs) para cada equipo. Máximo 3 en total.<br />
                                        <span style={{ color: '#FCD34D' }}>Los puntos totales se calcularán automáticamente (KO + 1 por victoria).</span>
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamAId)}</div>
                                            {renderMinisumoCircles('A', editingMatch.koPointsA ?? 0)}
                                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {editingMatch.koPointsA ?? 0} KOs
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamBId)}</div>
                                            {renderMinisumoCircles('B', editingMatch.koPointsB ?? 0)}
                                            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {editingMatch.koPointsB ?? 0} KOs
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview points */}
                                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#CBD5E1', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.35rem' }}>
                                        Resultado Final: <strong>{(editingMatch.koPointsA ?? 0) + (((editingMatch.koPointsA ?? 0) > (editingMatch.koPointsB ?? 0)) ? 1 : 0)} — {(editingMatch.koPointsB ?? 0) + (((editingMatch.koPointsB ?? 0) > (editingMatch.koPointsA ?? 0)) ? 1 : 0)}</strong> en puntos totales.
                                    </div>
                                </div>
                            ) : isRCCar ? (
                                <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                        Presiona <strong>Empezar</strong> para iniciar el cronómetro. Haz clic en el círculo de un equipo cuando cruce la meta para asignar su tiempo.
                                    </p>

                                    {/* Stopwatch Controls */}
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                                        <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', color: '#E2E8F0', marginBottom: '1rem' }}>
                                            {String(Math.floor(rcTimerCurrent / 60000)).padStart(2, '0')}:
                                            {String(Math.floor((rcTimerCurrent % 60000) / 1000)).padStart(2, '0')}.
                                            {String(Math.floor((rcTimerCurrent % 1000) / 10)).padStart(2, '0')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                            <button
                                                className="admin-btn secondary"
                                                onClick={() => {
                                                    setRcTimerStart(null)
                                                    setRcTimerCurrent(0)
                                                    setEditingMatch({ ...editingMatch, timeA: 0, timeB: 0, winnerId: undefined })
                                                }}
                                            >
                                                Reiniciar
                                            </button>
                                            <button
                                                className="admin-btn primary"
                                                style={{ background: rcTimerStart !== null ? '#F59E0B' : '#34D399', borderColor: rcTimerStart !== null ? '#F59E0B' : '#34D399', width: '100px' }}
                                                onClick={() => {
                                                    if (rcTimerStart !== null) {
                                                        // Pause
                                                        setRcTimerStart(null)
                                                    } else {
                                                        // Play
                                                        setRcTimerStart(Date.now() - rcTimerCurrent)
                                                    }
                                                }}
                                            >
                                                {rcTimerStart !== null ? 'Pausar' : rcTimerCurrent > 0 ? 'Reanudar' : 'Empezar'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        {/* Team A */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamAId)}</div>
                                            <div
                                                onClick={() => {
                                                    if (rcTimerStart === null && rcTimerCurrent === 0) return; // Ignore if timer never started
                                                    const newTime = rcTimerStart ? rcTimerCurrent : (editingMatch.timeA || 0)

                                                    const updatedMatch = { ...editingMatch, timeA: newTime }
                                                    if ((updatedMatch.timeA || 0) > 0 && (updatedMatch.timeB || 0) > 0) {
                                                        // Both finished! Stop timer automatically
                                                        setRcTimerStart(null)
                                                    }
                                                    setEditingMatch(updatedMatch)
                                                }}
                                                style={{
                                                    width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: `2px solid ${(editingMatch.timeA || 0) > 0 ? '#34D399' : '#475569'}`,
                                                    background: (editingMatch.timeA || 0) > 0 ? 'rgba(52,211,153,0.1)' : 'transparent',
                                                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.5rem', position: 'relative'
                                                }}
                                            >
                                                {(editingMatch.timeA || 0) > 0 ? '🏁' : '🏎️'}
                                            </div>
                                            <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: (editingMatch.timeA || 0) > 0 ? '#34D399' : '#64748b', fontFamily: 'monospace' }}>
                                                {(editingMatch.timeA || 0) > 0 ? `${Math.floor((editingMatch.timeA || 0) / 60000)}:${String(Math.floor(((editingMatch.timeA || 0) % 60000) / 1000)).padStart(2, '0')}.${String((editingMatch.timeA || 0) % 1000).padStart(3, '0')}` : 'Sin tiempo'}
                                            </span>
                                        </div>

                                        {/* Team B */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#CBD5E1' }}>{getTeamName(editingMatch.teamBId)}</div>
                                            <div
                                                onClick={() => {
                                                    if (rcTimerStart === null && rcTimerCurrent === 0) return;
                                                    const newTime = rcTimerStart ? rcTimerCurrent : (editingMatch.timeB || 0)

                                                    const updatedMatch = { ...editingMatch, timeB: newTime }
                                                    if ((updatedMatch.timeA || 0) > 0 && (updatedMatch.timeB || 0) > 0) {
                                                        // Both finished! Stop timer automatically
                                                        setRcTimerStart(null)
                                                    }
                                                    setEditingMatch(updatedMatch)
                                                }}
                                                style={{
                                                    width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    border: `2px solid ${(editingMatch.timeB || 0) > 0 ? '#F87171' : '#475569'}`,
                                                    background: (editingMatch.timeB || 0) > 0 ? 'rgba(248,113,113,0.1)' : 'transparent',
                                                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.5rem', position: 'relative'
                                                }}
                                            >
                                                {(editingMatch.timeB || 0) > 0 ? '🏁' : '🏎️'}
                                            </div>
                                            <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: (editingMatch.timeB || 0) > 0 ? '#F87171' : '#64748b', fontFamily: 'monospace' }}>
                                                {(editingMatch.timeB || 0) > 0 ? `${Math.floor((editingMatch.timeB || 0) / 60000)}:${String(Math.floor(((editingMatch.timeB || 0) % 60000) / 1000)).padStart(2, '0')}.${String((editingMatch.timeB || 0) % 1000).padStart(3, '0')}` : 'Sin tiempo'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#cbd5e1' }}>
                                        Al guardar, el equipo con el menor tiempo asignado será el ganador (3 pts).
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Generic Score row */}
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

                                    {/* Winner Selector */}
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
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-admin-login"
                                    style={{ flex: 1 }}
                                    onClick={handleSave}
                                >
                                    💾 Guardar Resultado
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
