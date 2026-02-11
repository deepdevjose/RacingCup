"use client"

import React, { useEffect, useState } from 'react'
import { getTournamentStats, type TournamentStats, type Team, getTeamById } from '@/lib/firebase'

interface ScoreboardProps {
    eventId: string
    categoryId: string
}

interface TeamStats extends TournamentStats {
    team?: Team
}

export function Scoreboard({ eventId, categoryId }: ScoreboardProps) {
    const [stats, setStats] = useState<TeamStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const results = await getTournamentStats(eventId, categoryId)

                // Fetch team details for names and icons
                const statsWithTeams = await Promise.all(results.map(async (s) => {
                    const team = await getTeamById(s.teamId)
                    return { ...s, team: team || undefined }
                }))

                setStats(statsWithTeams)
            } catch (error) {
                console.error("Error loading scoreboard:", error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [eventId, categoryId])

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

    if (stats.length === 0) {
        return (
            <div className="empty-state">
                <p>Aún no hay resultados registrados para esta categoría.</p>
            </div>
        )
    }

    return (
        <div className="scoreboard-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <th style={{ padding: '0 1rem' }}>Pos</th>
                        <th style={{ padding: '0 1rem' }}>Equipo</th>
                        <th style={{ padding: '0 1rem', textAlign: 'center' }}>PJ</th>
                        <th style={{ padding: '0 1rem', textAlign: 'center' }}>V</th>
                        <th style={{ padding: '0 1rem', textAlign: 'center' }}>Pts</th>
                        <th style={{ padding: '0 1rem', textAlign: 'right' }}>Extra</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((row, index) => {
                        const isTop3 = index < 3
                        const medalColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'

                        return (
                            <tr key={row.id || index} style={{
                                background: 'linear-gradient(145deg, rgba(21, 21, 37, 0.8), rgba(13, 13, 26, 0.8))',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '10px'
                            }}>
                                <td style={{ padding: '1rem', borderRadius: '10px 0 0 10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: isTop3 ? medalColor : 'rgba(255,255,255,0.6)',
                                            fontSize: isTop3 ? '1.1rem' : '0.9rem'
                                        }}>
                                            #{index + 1}
                                        </span>
                                        {index === 0 && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                                <path d="M4 22h16"></path>
                                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                            </svg>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: (row.team?.color || '#E32636') + '20',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: row.team?.color || '#E32636'
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#fff' }}>{row.team?.name || 'Equipo'}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Seed #{row.team?.seed || '?'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '500' }}>{row.played}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', color: '#22c55e', fontWeight: '600' }}>{row.won}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', color: '#E32636', fontWeight: 'bold', fontSize: '1.1rem' }}>{row.points}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                                    {categoryId.toLowerCase().includes('sumo') ? (
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{row.koPoints || 0} KO</span>
                                    ) : categoryId.toLowerCase().includes('fut') ? (
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{row.goals || 0} G</span>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{row.totalTime ? (row.totalTime / 1000).toFixed(2) + 's' : '-'}</span>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <style jsx>{`
                tr { transition: transform 0.2s ease; }
                tr:hover { transform: translateX(5px); background: rgba(227, 38, 54, 0.05) !important; }
            `}</style>
        </div >
    )
}
