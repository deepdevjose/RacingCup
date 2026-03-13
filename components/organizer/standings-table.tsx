'use client'

import React, { useState, useEffect } from 'react'
import { getTournamentStats, type TournamentStats, type Team } from '@/lib/matchDB'

interface StandingsTableProps {
    eventId: string
    categoryId: string
    teams: Team[]
}

export function StandingsTable({ eventId, categoryId, teams }: StandingsTableProps) {
    const [stats, setStats] = useState<TournamentStats[]>([])
    const [loading, setLoading] = useState(true)
    const [filterLevel, setFilterLevel] = useState<string>('all')

    useEffect(() => {
        loadStats()
    }, [eventId, categoryId])

    async function loadStats() {
        setLoading(true)
        try {
            const standings = await getTournamentStats(eventId, categoryId)
            setStats(standings)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTeamLevel = (teamId: string) => teams.find(t => t.id === teamId)?.educationLevel

    const levelsPresent = [...new Set(stats.map(s => getTeamLevel(s.teamId)).filter(Boolean))] as string[]
    const hasLevelFilter = levelsPresent.length > 1

    const visibleStats = filterLevel === 'all'
        ? stats
        : stats.filter(s => getTeamLevel(s.teamId) === filterLevel)

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Cargando posiciones...</div>

    if (stats.length === 0) {
        return (
            <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8' }}>
                    No hay estadísticas aún. Completa partidos de clasificatoria para generar la tabla.
                </p>
            </div>
        )
    }

    return (
        <div>
            {hasLevelFilter && (
                <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.8rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                    {['all', ...levelsPresent].map(lv => (
                        <button
                            key={lv}
                            onClick={() => setFilterLevel(lv)}
                            style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '0.35rem',
                                border: '1px solid',
                                borderColor: filterLevel === lv ? '#E32636' : '#334155',
                                background: filterLevel === lv ? 'rgba(227,38,54,0.1)' : 'transparent',
                                color: filterLevel === lv ? '#F87171' : '#94a3b8',
                                cursor: 'pointer',
                                fontWeight: filterLevel === lv ? 600 : 400
                            }}
                        >
                            {lv === 'all' ? 'Ver Todos' : lv}
                        </button>
                    ))}
                </div>
            )}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                            <th>Equipo</th>
                            <th style={{ textAlign: 'center' }} title="Partidos Jugados">PJ</th>
                            <th style={{ textAlign: 'center' }} title="Ganados">G</th>
                            <th style={{ textAlign: 'center' }} title="Empatados">E</th>
                            <th style={{ textAlign: 'center' }} title="Perdidos">P</th>
                            {(categoryId.toLowerCase().includes('sumo') || categoryId.toLowerCase().includes('mini')) && (
                                <th style={{ textAlign: 'center' }} title="Puntos KO">KO</th>
                            )}
                            {(categoryId.toLowerCase().includes('fut') || categoryId.toLowerCase().includes('bot')) && (
                                <th style={{ textAlign: 'center' }} title="Goles">GL</th>
                            )}
                            {(categoryId.toLowerCase().includes('rc') || categoryId.toLowerCase().includes('car')) && (
                                <th style={{ textAlign: 'center' }} title="Mejor Tiempo">TIEMPO</th>
                            )}
                            <th style={{ textAlign: 'center', color: '#F59E0B' }} title="Puntos Totales">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleStats.map((s, index) => {
                            const team = teams.find(t => t.id === s.teamId)
                            if (!team) return null

                            // Highlight top positions (e.g. top 4 if qualifying)
                            const isTop = index < 4

                            return (
                                <tr key={s.id} style={{ background: isTop ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: isTop ? '#F59E0B' : '#94a3b8' }}>
                                        {index + 1}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{team.name}</span>
                                            {team.educationLevel && (
                                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' }}>
                                                    {team.educationLevel}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{s.played}</td>
                                    <td style={{ textAlign: 'center', color: '#34D399' }}>{s.won}</td>
                                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>{s.draw}</td>
                                    <td style={{ textAlign: 'center', color: '#F87171' }}>{s.lost}</td>
                                    {(categoryId.toLowerCase().includes('sumo') || categoryId.toLowerCase().includes('mini')) && (
                                        <td style={{ textAlign: 'center' }}>{s.koPoints || 0}</td>
                                    )}
                                    {(categoryId.toLowerCase().includes('fut') || categoryId.toLowerCase().includes('bot')) && (
                                        <td style={{ textAlign: 'center' }}>{s.goals || 0}</td>
                                    )}
                                    {(categoryId.toLowerCase().includes('rc') || categoryId.toLowerCase().includes('car')) && (
                                        <td style={{ textAlign: 'center', fontFamily: 'monospace', color: s.totalTime ? '#E2E8F0' : '#475569' }}>
                                            {s.totalTime ? `${(s.totalTime / 1000).toFixed(3)}s` : '--'}
                                        </td>
                                    )}
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', color: '#F59E0B' }}>
                                        {s.points}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
