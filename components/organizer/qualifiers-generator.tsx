'use client'

import React, { useState } from 'react'
import { createMatch, type Team } from '@/lib/matchDB'

interface QualifiersGeneratorProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onGenerated: () => void
}

export function QualifiersGenerator({ eventId, categoryId, teams, onGenerated }: QualifiersGeneratorProps) {
    const [rounds, setRounds] = useState(1)
    const [separateByEducation, setSeparateByEducation] = useState(false)
    const [generateMediaSuperior, setGenerateMediaSuperior] = useState(true)
    const [generateSuperior, setGenerateSuperior] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const mediaSuperiorTeams = teams.filter(t => t.educationLevel === 'Media Superior')
    const superiorTeams = teams.filter(t => t.educationLevel === 'Superior')

    /** Random matchmaking: n/2 matches per round (rounded down). 1 team rests if odd. */
    const matchCount = (n: number) => Math.floor(n / 2)

    let previewTotal = 0
    if (separateByEducation) {
        if (generateMediaSuperior) previewTotal += matchCount(mediaSuperiorTeams.length) * rounds
        if (generateSuperior) previewTotal += matchCount(superiorTeams.length) * rounds
    } else {
        previewTotal = matchCount(teams.length) * rounds
    }

    const canGenerate = separateByEducation
        ? (generateMediaSuperior || generateSuperior) && previewTotal > 0
        : teams.length >= 2

    const handleConfirmRequest = () => {
        if (!canGenerate) {
            alert('No hay suficientes equipos seleccionados para generar partidos.')
            return
        }
        setShowConfirm(true)
    }

    const handleGenerate = async () => {
        setShowConfirm(false)
        setGenerating(true)
        try {
            let matchNumber = 1

            const generateForTeams = async (teamList: Team[], levelLabel?: string) => {
                for (let round = 0; round < rounds; round++) {
                    // Shuffle array for random matchmaking
                    const shuffled = [...teamList].sort(() => Math.random() - 0.5)

                    for (let i = 0; i < shuffled.length - 1; i += 2) {
                        await createMatch({
                            eventId,
                            categoryId,
                            round: round + 1,
                            matchNumber: matchNumber++,
                            teamAId: shuffled[i].id!,
                            teamBId: shuffled[i + 1].id!,
                            stage: 'group',
                            status: 'pending',
                            ...(levelLabel ? { educationLevel: levelLabel } : {})
                        })
                    }
                }
            }

            if (separateByEducation) {
                if (generateMediaSuperior && mediaSuperiorTeams.length >= 2) {
                    await generateForTeams(mediaSuperiorTeams, 'Media Superior')
                }
                if (generateSuperior && superiorTeams.length >= 2) {
                    await generateForTeams(superiorTeams, 'Superior')
                }
            } else {
                await generateForTeams(teams)
            }

            alert(`✅ ${matchNumber - 1} partidos generados correctamente`)
            onGenerated()
        } catch (error) {
            console.error('Error generating qualifiers:', error)
            alert('Error al generar clasificatorias')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                🎲 Generar Clasificatorias
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Formato: Emparejamiento Aleatorio. ({teams.length} equipos totales)
            </p>

            {/* Rounds */}
            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Número de Rondas (Oportunidades)</label>
                <input
                    type="number"
                    className="admin-input"
                    min={1}
                    max={10}
                    value={rounds}
                    onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ maxWidth: '120px' }}
                />
            </div>

            {/* Separate by education */}
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', marginBottom: separateByEducation ? '0.75rem' : 0 }}>
                    <input
                        type="checkbox"
                        checked={separateByEducation}
                        onChange={(e) => setSeparateByEducation(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#E32636' }}
                    />
                    <span style={{ fontWeight: 600 }}>Separar por nivel educativo</span>
                </label>

                {separateByEducation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{
                            padding: '0.5rem',
                            background: generateMediaSuperior ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                            border: `1px solid ${generateMediaSuperior ? '#334155' : 'transparent'}`,
                            borderRadius: '0.35rem',
                            opacity: generateMediaSuperior ? 1 : 0.6,
                            transition: 'all 0.2s'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={generateMediaSuperior}
                                    onChange={(e) => setGenerateMediaSuperior(e.target.checked)}
                                    style={{ accentColor: '#3B82F6' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#CBD5E1', fontSize: '0.85rem' }}>Media Superior</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                        {mediaSuperiorTeams.length} equipos → {matchCount(mediaSuperiorTeams.length) * rounds} partidos
                                        {mediaSuperiorTeams.length % 2 !== 0 && <span style={{ marginLeft: '0.5rem', color: '#FCD34D' }}>*1 descansa</span>}
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div style={{
                            padding: '0.5rem',
                            background: generateSuperior ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                            border: `1px solid ${generateSuperior ? '#334155' : 'transparent'}`,
                            borderRadius: '0.35rem',
                            opacity: generateSuperior ? 1 : 0.6,
                            transition: 'all 0.2s'
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={generateSuperior}
                                    onChange={(e) => setGenerateSuperior(e.target.checked)}
                                    style={{ accentColor: '#8B5CF6' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#CBD5E1', fontSize: '0.85rem' }}>Superior</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                        {superiorTeams.length} equipos → {matchCount(superiorTeams.length) * rounds} partidos
                                        {superiorTeams.length % 2 !== 0 && <span style={{ marginLeft: '0.5rem', color: '#FCD34D' }}>*1 descansa</span>}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Match count preview */}
            <div style={{
                marginBottom: '1rem', padding: '0.6rem 0.75rem',
                background: canGenerate ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${canGenerate ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '0.5rem', fontSize: '0.85rem'
            }}>
                {canGenerate
                    ? <span style={{ color: '#34D399' }}>✓ Se generarán <strong>{previewTotal} partidos nuevos</strong></span>
                    : <span style={{ color: '#FCA5A5' }}>⚠ Selecciona niveles con al menos 2 equipos</span>
                }
                {(!separateByEducation && teams.length % 2 !== 0) && (
                    <div style={{ color: '#FCD34D', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        *Al ser un número impar de equipos, 1 equipo pasará directo a la siguiente ronda (descansa) por cada ronda generada.
                    </div>
                )}
            </div>

            {showConfirm ? (
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#93C5FD', fontSize: '0.9rem' }}>Confirmar Generación</h5>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#CBD5E1' }}>
                        ¿Estás seguro de generar <strong>{previewTotal} partidos</strong> aleatorios?
                        Esta acción guardará los partidos en la base de datos automáticamente.
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
                            onClick={handleGenerate}
                            disabled={generating}
                            style={{ flex: 1, padding: '0.5rem', background: '#2563EB', border: '1px solid #3B82F6', color: 'white', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                            {generating ? 'Guardando...' : 'Sí, Generar Partidos'}
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className="btn-admin-login"
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    onClick={handleConfirmRequest}
                    disabled={generating || !canGenerate}
                >
                    {generating ? '⏳ Mezclando y Generando...' : `🎲 Generar Emparejamientos`}
                </button>
            )}
        </div>
    )
}
