'use client'

import React, { useState, useEffect } from 'react'
import { createMatch, getConfirmedTeamsByEvent, type Team } from '@/lib/firebase'

interface CustomBracketGeneratorProps {
    eventId: string
    onGenerated: () => void
}

export function CustomBracketGenerator({ eventId, onGenerated }: CustomBracketGeneratorProps) {
    const [bracketSize, setBracketSize] = useState<number>(8)
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [bracketLevel, setBracketLevel] = useState<string>('Media Superior')
    const [availableTeams, setAvailableTeams] = useState<Team[]>([])
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([])
    const [matchups, setMatchups] = useState<Array<{teamA?: Team, teamB?: Team}>>([])
    const [generating, setGenerating] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTeams()
    }, [eventId])

    async function loadTeams() {
        try {
            const teams = await getConfirmedTeamsByEvent(eventId)
            setAvailableTeams(teams)
        } catch (error) {
            console.error("Error loading teams:", error)
        } finally {
            setLoading(false)
        }
    }

    const categories = [...new Set(availableTeams.flatMap(team =>
        team.categories?.map(cat => cat.category) || []
    ))].filter(Boolean)

    const availableTeamsForCategory = availableTeams.filter(team =>
        team.categories?.some(cat => cat.category === selectedCategory)
    )

    const handleTeamToggle = (team: Team) => {
        setSelectedTeams(prev => {
            const isSelected = prev.some(t => t.id === team.id)
            if (isSelected) {
                return prev.filter(t => t.id !== team.id)
            } else if (prev.length < bracketSize) {
                return [...prev, team]
            }
            return prev
        })
    }

    // Update matchups when selected teams change
    useEffect(() => {
        const numMatches = Math.floor(selectedTeams.length / 2)
        const newMatchups: Array<{teamA?: Team, teamB?: Team}> = Array.from({ length: numMatches }, () => ({}))

        // Auto-assign teams to matchups if we have enough teams
        selectedTeams.forEach((team, index) => {
            const matchupIndex = Math.floor(index / 2)
            const isTeamA = index % 2 === 0

            if (matchupIndex < newMatchups.length) {
                if (isTeamA) {
                    newMatchups[matchupIndex].teamA = team
                } else {
                    newMatchups[matchupIndex].teamB = team
                }
            }
        })

        setMatchups(newMatchups)
    }, [selectedTeams])

    const handleMatchupChange = (matchupIndex: number, position: 'teamA' | 'teamB', teamId: string) => {
        const team = selectedTeams.find(t => t.id === teamId)
        if (!team) return

        setMatchups(prev => {
            const newMatchups = [...prev]
            newMatchups[matchupIndex] = {
                ...newMatchups[matchupIndex],
                [position]: team
            }
            return newMatchups
        })
    }

    const getAvailableTeamsForMatchup = (matchupIndex: number, currentPosition: 'teamA' | 'teamB') => {
        const usedTeamIds = new Set<string>()

        // Collect all teams already assigned to other matchups
        matchups.forEach((matchup, index) => {
            if (index !== matchupIndex) {
                if (matchup.teamA?.id) usedTeamIds.add(matchup.teamA.id)
                if (matchup.teamB?.id) usedTeamIds.add(matchup.teamB.id)
            } else {
                // For current matchup, exclude the other position
                if (currentPosition === 'teamA' && matchup.teamB?.id) {
                    usedTeamIds.add(matchup.teamB.id)
                } else if (currentPosition === 'teamB' && matchup.teamA?.id) {
                    usedTeamIds.add(matchup.teamA.id)
                }
            }
        })

        return selectedTeams.filter(team => team.id && !usedTeamIds.has(team.id))
    }

    const handleConfirmRequest = () => {
        if (!selectedCategory) {
            alert('Selecciona una categoría')
            return
        }
        if (selectedTeams.length < 2) {
            alert('Selecciona al menos 2 equipos')
            return
        }

        // Check if all matchups are complete
        const incompleteMatchups = matchups.filter(matchup => !matchup.teamA || !matchup.teamB)
        if (incompleteMatchups.length > 0) {
            alert(`Hay ${incompleteMatchups.length} enfrentamiento(s) incompleto(s). Completa todos los partidos antes de generar.`)
            return
        }

        setShowConfirm(true)
    }

    const executeGeneration = async () => {
        setShowConfirm(false)
        setGenerating(true)
        try {
            // Generate first round matches only
            await generateFirstRoundMatches()
            const totalMatches = getTotalMatches()
            alert(`Bracket personalizado generado con ${matchups.length} partidos iniciales. Las rondas siguientes se generarán automáticamente al completar los partidos.`)
            onGenerated()
        } catch (error) {
            console.error("Error generating custom bracket:", error)
            alert('Error al generar bracket personalizado')
        } finally {
            setGenerating(false)
        }
    }

    const getTotalMatches = () => {
        // Calculate total matches needed for a single-elimination bracket
        return selectedTeams.length - 1
    }

    const getTotalRounds = () => {
        // Calculate number of rounds needed
        let teams = selectedTeams.length
        let rounds = 0
        while (teams > 1) {
            teams = Math.ceil(teams / 2)
            rounds++
        }
        return rounds
    }

    const generateFirstRoundMatches = async () => {
        // Only generate the first round matches, just like the regular BracketGenerator
        // Subsequent rounds will be created automatically when matches are completed
        // (see match-list.tsx handleSaveMatch function)

        let matchNumber = 1

        // Only create first round matches with the configured matchups
        for (let i = 0; i < matchups.length; i++) {
            const matchup = matchups[i]
            if (matchup.teamA && matchup.teamB) {
                await createMatch({
                    eventId,
                    categoryId: selectedCategory,
                    round: 1, // First round
                    matchNumber: matchNumber++,
                    teamAId: matchup.teamA.id!,
                    teamBId: matchup.teamB.id!,
                    stage: 'bracket',
                    status: 'pending',
                    educationLevel: bracketLevel
                })
            }
        }
    }

    if (loading) return <div style={{ color: '#94a3b8' }}>Cargando equipos...</div>

    return (
        <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Generar Bracket Personalizado
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Crea la primera ronda del bracket con enfrentamientos configurados manualmente. Las rondas siguientes se generan automáticamente al completar partidos.
            </p>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Categoría</label>
                <select
                    className="admin-input"
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value)
                        setSelectedTeams([]) // Reset selection when category changes
                    }}
                >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Tamaño del Bracket</label>
                <input
                    type="number"
                    className="admin-input"
                    value={bracketSize}
                    onChange={(e) => setBracketSize(Math.max(2, parseInt(e.target.value) || 2))}
                    min="2"
                    max="32"
                    step="1"
                />
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Nivel Educativo del Bracket</label>
                <select
                    className="admin-input"
                    value={bracketLevel}
                    onChange={(e) => setBracketLevel(e.target.value)}
                >
                    <option value="Media Superior">Media Superior</option>
                    <option value="Superior">Superior</option>
                </select>
            </div>

            {selectedCategory && selectedTeams.length >= 2 && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        Configurar Enfrentamientos Iniciales ({matchups.length} partidos)
                    </p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {matchups.map((matchup, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '80px' }}>
                                    Partido {index + 1}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <select
                                        value={matchup.teamA?.id || ''}
                                        onChange={(e) => handleMatchupChange(index, 'teamA', e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.35rem',
                                            color: '#E2E8F0',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="">Seleccionar equipo...</option>
                                        {getAvailableTeamsForMatchup(index, 'teamA').map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name} ({team.educationLevel})
                                            </option>
                                        ))}
                                    </select>
                                    <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>vs</span>
                                    <select
                                        value={matchup.teamB?.id || ''}
                                        onChange={(e) => handleMatchupChange(index, 'teamB', e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0.35rem',
                                            color: '#E2E8F0',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="">Seleccionar equipo...</option>
                                        {getAvailableTeamsForMatchup(index, 'teamB').map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name} ({team.educationLevel})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '60px', textAlign: 'center' }}>
                                    {matchup.teamA && matchup.teamB ? '✅' : '⏳'}
                                </div>
                            </div>
                        ))}
                    </div>
                    {matchups.some(matchup => !matchup.teamA || !matchup.teamB) && (
                        <p style={{ fontSize: '0.8rem', color: '#F87171', marginTop: '0.5rem' }}>
                            ⚠️ Completa todos los enfrentamientos antes de generar el bracket
                        </p>
                    )}
                </div>
            )}

            {selectedCategory && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Seleccionar Equipos ({selectedTeams.length}/{bracketSize})
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                        Equipos disponibles en {selectedCategory}:
                    </p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                        {availableTeamsForCategory.map(team => {
                            const isSelected = selectedTeams.some(t => t.id === team.id)
                            return (
                                <label
                                    key={team.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem', borderRadius: '0.35rem',
                                        background: isSelected ? 'rgba(227,38,54,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isSelected ? '#E32636' : 'rgba(255,255,255,0.1)'}`,
                                        cursor: selectedTeams.length >= bracketSize && !isSelected ? 'not-allowed' : 'pointer',
                                        opacity: selectedTeams.length >= bracketSize && !isSelected ? 0.5 : 1
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleTeamToggle(team)}
                                        disabled={selectedTeams.length >= bracketSize && !isSelected}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{team.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {team.educationLevel}
                                        </div>
                                    </div>
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}

            {showConfirm ? (
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#93C5FD', fontSize: '0.9rem' }}>Confirmar Generación</h5>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#CBD5E1' }}>
                        ¿Estás seguro de generar un bracket personalizado completo?
                        <br />• Categoría: {selectedCategory}
                        <br />• Nivel: {bracketLevel}
                        <br />• Rondas totales: {getTotalRounds()}
                        <br />• Partidos totales: {getTotalMatches()}
                        <br />
                        <br /><strong>Enfrentamientos iniciales:</strong>
                        {matchups.map((matchup, index) => (
                            <div key={index} style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                                Partido {index + 1}: {matchup.teamA?.name} vs {matchup.teamB?.name}
                            </div>
                        ))}
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
                            {generating ? 'Generando...' : 'Sí, Generar Bracket'}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="btn-admin-login"
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    onClick={handleConfirmRequest}
                    disabled={generating || !selectedCategory || selectedTeams.length < 2 || matchups.some(m => !m.teamA || !m.teamB)}
                >
                    {generating ? 'Generando...' : `🎯 Generar Bracket Completo (${getTotalMatches()} partidos, ${getTotalRounds()} rondas)`}
                </button>
            )}
        </div>
    )
}