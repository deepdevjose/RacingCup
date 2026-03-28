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
    const [bracketSize, setBracketSize] = useState<number>(8)
    const [generateMediaSuperior, setGenerateMediaSuperior] = useState(true)
    const [generateSuperior, setGenerateSuperior] = useState(true)
    const [stats, setStats] = useState<TournamentStats[]>([])
    const [generating, setGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showConfirm, setShowConfirm] = useState(false)

    // Bracket size options - powers of 2 for clean tournament structure
    const bracketSizeOptions = [2, 4, 8, 16, 32]

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

    // Calculate optimal bracket size based on available teams
    const getOptimalBracketSize = (teamCount: number) => {
        if (teamCount <= 2) return 2
        if (teamCount <= 4) return 4
        if (teamCount <= 8) return 8
        if (teamCount <= 16) return 16
        return 32 // Maximum supported
    }

    // Get available bracket sizes for a given team count
    const getAvailableBracketSizes = (teamCount: number) => {
        return bracketSizeOptions.filter(size => size <= teamCount && size >= 2)
    }

    // Auto-adjust bracket size when stats change
    useEffect(() => {
        const maxTeams = Math.max(mediaSuperiorStats.length, superiorStats.length)
        if (maxTeams > 0) {
            const optimalSize = getOptimalBracketSize(maxTeams)
            if (bracketSize > maxTeams) {
                setBracketSize(optimalSize)
            }
        }
    }, [stats, mediaSuperiorStats.length, superiorStats.length])

    const handleConfirmRequest = () => {
        if (bracketSize < 2) {
            alert('El tamaño del bracket debe ser al menos 2 equipos')
            return
        }
        
        const willGenerateMedia = generateMediaSuperior && mediaSuperiorStats.length >= bracketSize
        const willGenerateSuperior = generateSuperior && superiorStats.length >= bracketSize
        
        if (!willGenerateMedia && !willGenerateSuperior) {
            alert(`Se necesitan al menos ${bracketSize} equipos en los niveles seleccionados`)
            return
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
                let currentRound = 1 // First round

                // Create first round matches
                for (let i = 0; i < topTeams.length; i += 2) {
                    if (i + 1 < topTeams.length) {
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
            }

            if (generateMediaSuperior && mediaSuperiorStats.length >= bracketSize) {
                await generateBracket(mediaSuperiorStats, 'Media Superior')
            }
            
            if (generateSuperior && superiorStats.length >= bracketSize) {
                await generateBracket(superiorStats, 'Superior')
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
                Generar Brackets Eliminatorios
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Selecciona los mejores equipos de las clasificatorias y elige qué brackets generar ({stats.length} equipos con estadísticas)
                {getAvailableBracketSizes(Math.max(mediaSuperiorStats.length, superiorStats.length)).length === 0 && (
                    <span style={{ color: '#ef4444', display: 'block', marginTop: '0.25rem' }}>
                        ⚠️ No hay suficientes equipos para generar brackets (mínimo 2 equipos requeridos)
                    </span>
                )}
            </p>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Número de Equipos en el Bracket</label>
                <select
                    className="admin-input"
                    value={bracketSize}
                    onChange={(e) => setBracketSize(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.35rem', color: '#CBD5E1' }}
                >
                    {getAvailableBracketSizes(Math.max(mediaSuperiorStats.length, superiorStats.length)).map(size => (
                        <option key={size} value={size} style={{ background: '#1e293b', color: '#CBD5E1' }}>
                            {size} equipos
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Seleccionar niveles educativos para generar brackets:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={generateMediaSuperior}
                            onChange={(e) => setGenerateMediaSuperior(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span>Media Superior ({mediaSuperiorStats.length} equipos)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={generateSuperior}
                            onChange={(e) => setGenerateSuperior(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span>Superior ({superiorStats.length} equipos)</span>
                    </label>
                </div>
            </div>

            {generateMediaSuperior && mediaSuperiorStats.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Top {Math.min(bracketSize, mediaSuperiorStats.length)} Equipos - Media Superior:
                    </p>
                    <ol style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>
                        {mediaSuperiorStats.slice(0, bracketSize).map((s, i) => {
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

            {generateSuperior && superiorStats.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Top {Math.min(bracketSize, superiorStats.length)} Equipos - Superior:
                    </p>
                    <ol style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>
                        {superiorStats.slice(0, bracketSize).map((s, i) => {
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
                        ¿Estás seguro de generar el/los bracket(s) eliminatorio(s)?
                        {generateMediaSuperior && mediaSuperiorStats.length >= bracketSize && (
                            <div style={{ marginTop: '0.25rem' }}>- Media Superior: {Math.min(bracketSize, mediaSuperiorStats.length)} equipos</div>
                        )}
                        {generateSuperior && superiorStats.length >= bracketSize && (
                            <div style={{ marginTop: '0.25rem' }}>- Superior: {Math.min(bracketSize, superiorStats.length)} equipos</div>
                        )}
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
                    disabled={generating || 
                             (!generateMediaSuperior && !generateSuperior) || 
                             (generateMediaSuperior && mediaSuperiorStats.length < bracketSize && 
                              generateSuperior && superiorStats.length < bracketSize) ||
                             (generateMediaSuperior && mediaSuperiorStats.length < bracketSize && 
                              !generateSuperior) ||
                             (!generateMediaSuperior && superiorStats.length < bracketSize)}
                >
                    {generating ? 'Generando...' : `🏆 Generar Bracket (${bracketSize} equipos)`}
                </button>
            )}
        </div>
    )
}
