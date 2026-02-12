'use client'

import React, { useState, useEffect } from 'react'
import {
    getMatchesByCategory,
    updateMatch,
    getTeamById,
    updateStandingStats,
    type Match,
    type Team
} from '@/lib/firebase'

interface MatchListProps {
    eventId: string
    categoryId: string
    teams: Team[]
    filterStage?: 'group' | 'bracket'
    viewMode?: 'list' | 'bracket'
}

export function MatchList({ eventId, categoryId, teams, filterStage, viewMode = 'list' }: MatchListProps) {
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [editingMatch, setEditingMatch] = useState<Match | null>(null)

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
            console.error("Error loading matches:", error)
        } finally {
            setLoading(false)
        }
    }

    const getTeamName = (teamId?: string) => {
        if (!teamId) return 'TBD'
        const team = teams.find(t => t.id === teamId)
        return team?.name || 'Desconocido'
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

            // Update standings if it's a group stage match
            if (match.stage === 'group') {
                await updateStandingStats(eventId, categoryId)
            }

            await loadMatches()
            setEditingMatch(null)
            alert('Resultado guardado')
        } catch (error) {
            console.error("Error saving match:", error)
            alert('Error al guardar resultado')
        }
    }

    if (loading) return <div className="p-4 text-white">Cargando partidos...</div>

    if (matches.length === 0) {
        return (
            <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8' }}>
                    No hay partidos generados para esta {filterStage === 'group' ? 'fase clasificatoria' : 'fase eliminatoria'}.
                </p>
            </div>
        )
    }

    return (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Equipo A</th>
                        <th>Resultado</th>
                        <th>Equipo B</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match) => (
                        <tr key={match.id}>
                            <td><strong>M{match.matchNumber}</strong></td>
                            <td>{getTeamName(match.teamAId)}</td>
                            <td>
                                {match.status === 'completed' ? (
                                    <span style={{ fontWeight: 'bold' }}>
                                        {match.scoreA || 0} - {match.scoreB || 0}
                                    </span>
                                ) : (
                                    <span style={{ color: '#94a3b8' }}>vs</span>
                                )}
                            </td>
                            <td>{getTeamName(match.teamBId)}</td>
                            <td>
                                <span className={`status-badge ${match.status === 'completed' ? 'success' :
                                        match.status === 'in_progress' ? 'warning' : 'secondary'
                                    }`}>
                                    {match.status === 'completed' ? 'Completado' :
                                        match.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="action-btn"
                                    onClick={() => setEditingMatch(match)}
                                >
                                    {match.status === 'completed' ? 'Editar' : 'Registrar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Match Modal */}
            {editingMatch && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '600px', width: '90%' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                            Partido #{editingMatch.matchNumber}
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                                {getTeamName(editingMatch.teamAId)} vs {getTeamName(editingMatch.teamBId)}
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="admin-form-group">
                                <label className="admin-label">Puntos {getTeamName(editingMatch.teamAId)}</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={editingMatch.scoreA || 0}
                                    onChange={(e) => setEditingMatch({
                                        ...editingMatch,
                                        scoreA: parseInt(e.target.value) || 0
                                    })}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Puntos {getTeamName(editingMatch.teamBId)}</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={editingMatch.scoreB || 0}
                                    onChange={(e) => setEditingMatch({
                                        ...editingMatch,
                                        scoreB: parseInt(e.target.value) || 0
                                    })}
                                />
                            </div>
                        </div>

                        {/* Category-specific fields */}
                        {categoryId.toLowerCase().includes('minisumo') && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">KO Points A</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={editingMatch.koPointsA || 0}
                                        onChange={(e) => setEditingMatch({
                                            ...editingMatch,
                                            koPointsA: parseInt(e.target.value) || 0
                                        })}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">KO Points B</label>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={editingMatch.koPointsB || 0}
                                        onChange={(e) => setEditingMatch({
                                            ...editingMatch,
                                            koPointsB: parseInt(e.target.value) || 0
                                        })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">Ganador</label>
                            <select
                                className="admin-input"
                                value={editingMatch.winnerId || ''}
                                onChange={(e) => setEditingMatch({
                                    ...editingMatch,
                                    winnerId: e.target.value || undefined
                                })}
                            >
                                <option value="">-- Empate --</option>
                                <option value={editingMatch.teamAId}>{getTeamName(editingMatch.teamAId)}</option>
                                <option value={editingMatch.teamBId}>{getTeamName(editingMatch.teamBId)}</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-admin-login"
                                style={{ background: 'transparent', border: '1px solid #94a3b8', flex: 1 }}
                                onClick={() => setEditingMatch(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-admin-login"
                                style={{ flex: 1 }}
                                onClick={() => handleSaveMatch(editingMatch)}
                            >
                                Guardar Resultado
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
