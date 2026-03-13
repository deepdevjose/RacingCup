'use client'

import React, { useState, useEffect } from 'react'
import { createMatch, getTournamentStats, type Team, type TournamentStats } from '@/lib/firebase'

interface BracketGeneratorProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onGenerated: () => void
}

export function BracketGenerator({ eventId, categoryId, teams, onGenerated }: BracketGeneratorProps) {
    const [bracketSize, setBracketSize] = useState<4 | 8 | 16 | 32>(8)
    const [separateByEducation, setSeparateByEducation] = useState(false)
    const [stats, setStats] = useState<TournamentStats[]>([])
    const [generating, setGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        loadStats()
    }, [eventId, categoryId])

    async function loadStats() {
        try {
            const standings = await getTournamentStats(eventId, categoryId)
            setStats(standings)
        } catch (error) {
            console.error("Error loading stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const mediaSuperiorStats = stats.filter(s => {
        const team = teams.find(t => t.id === s.teamId)
        return team?.educationLevel === 'Media Superior'
    })
    const superiorStats = stats.filter(s => {
        const team = teams.find(t => t.id === s.teamId)
        return team?.educationLevel === 'Superior'
    })

    const handleConfirmRequest = () => {
        if (!separateByEducation) {
            // Original behavior
            if (stats.length < bracketSize) {
                alert(`Se necesitan al menos ${bracketSize} equipos con estadísticas`)
                return
            }
        } else {
            // Separate by education level
            if (mediaSuperiorStats.length < bracketSize && superiorStats.length < bracketSize) {
                alert(`Se necesitan al menos ${bracketSize} equipos en algún nivel educativo`)
                return
            }
        }
        setShowConfirm(true);
    }

    const executeGeneration = async () => {
        setShowConfirm(false)
        setGenerating(true)
        try {
            let matchNumber = 1

            const generateBracket = async (statsSubset: TournamentStats[], levelLabel?: string) => {
                if (statsSubset.length < bracketSize) return

                const topTeams = statsSubset.slice(0, bracketSize)
                let currentRound = bracketSize / 2

                for (let i = 0; i < bracketSize; i += 2) {
                    await createMatch({
                        eventId,
                        categoryId,
                        round: currentRound,
                        matchNumber: matchNumber++,
                        teamAId: topTeams[i].teamId,
                        teamBId: topTeams[i + 1].teamId,
                        stage: 'bracket',
                        status: 'pending',
                        ...(levelLabel ? { educationLevel: levelLabel } : {})
                    })
                }
            }

            if (separateByEducation) {
                await generateBracket(mediaSuperiorStats, 'Media Superior')
                await generateBracket(superiorStats, 'Superior')
            } else {
                await generateBracket(stats)
            }

            alert(`Bracket(s) generado(s)`)
            onGenerated()
        } catch (error) {
            console.error("Error generating bracket:", error)
            alert('Error al generar bracket')
        } finally {
            setGenerating(false)
        }
    }

    if (loading) return <div style={{ color: '#94a3b8' }}>Cargando estadísticas...</div>

    return (
        <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Generar Bracket Eliminatorio
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Selecciona los mejores equipos de las clasificatorias ({stats.length} equipos con estadísticas)
            </p>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Tamaño del Bracket</label>
                <select
                    className="admin-input"
                    value={bracketSize}
                    onChange={(e) => setBracketSize(parseInt(e.target.value) as typeof bracketSize)}
                >
                    <option value={4}>4 Equipos</option>
                    <option value={8}>8 Equipos</option>
                    <option value={16}>16 Equipos</option>
                    <option value={32}>32 Equipos</option>
                </select>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={separateByEducation}
                        onChange={(e) => setSeparateByEducation(e.target.checked)}
                        style={{ width: '16px', height: '16px' }}
                    />
                    <span>Separar por nivel educativo</span>
                </label>
                {separateByEducation && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>
                        Media Superior: {mediaSuperiorStats.length} equipos<br />
                        Superior: {superiorStats.length} equipos
                    </div>
                )}
            </div>

            {stats.length > 0 && !separateByEducation && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Top {Math.min(bracketSize, stats.length)} Equipos:
                    </p>
                    <ol style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>
                        {stats.slice(0, bracketSize).map((s, i) => {
                            const team = teams.find(t => t.id === s.teamId)
                            return (
                                <li key={s.teamId}>
                                    {team?.name || 'Desconocido'} ({s.points} pts)
                                </li>
                            )
                        })}
                    </ol>
                </div>
            )}

            {showConfirm ? (
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#93C5FD', fontSize: '0.9rem' }}>Confirmar Generación</h5>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#CBD5E1' }}>
                        ¿Estás seguro de generar el bracket eliminatorio?
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={generating}
                            style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', borderRadius: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={executeGeneration}
                            disabled={generating}
                            style={{ flex: 1, padding: '0.5rem', background: '#2563EB', border: '1px solid #3B82F6', color: 'white', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                            {generating ? 'Guardando...' : 'Sí, Generar Bracket'}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="btn-admin-login"
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    onClick={handleConfirmRequest}
                    disabled={generating || stats.length < bracketSize}
                >
                    {generating ? 'Generando...' : `🏆 Generar Bracket (${bracketSize} equipos)`}
                </button>
            )}
        </div>
    )
}
