'use client'

import React, { useState } from 'react'
import { createMatch, type Team } from '@/lib/firebase'

interface QualifiersGeneratorProps {
    eventId: string
    categoryId: string
    teams: Team[]
    onGenerated: () => void
}

export function QualifiersGenerator({ eventId, categoryId, teams, onGenerated }: QualifiersGeneratorProps) {
    const [rounds, setRounds] = useState(1)
    const [separateByEducation, setSeparateByEducation] = useState(false)
    const [generating, setGenerating] = useState(false)

    const handleGenerate = async () => {
        if (teams.length < 2) {
            alert('Se necesitan al menos 2 equipos confirmados')
            return
        }

        let mediaSuperiorTeams: Team[] = []
        let superiorTeams: Team[] = []

        if (separateByEducation) {
            mediaSuperiorTeams = teams.filter(t => t.educationLevel === 'Media Superior')
            superiorTeams = teams.filter(t => t.educationLevel === 'Superior')

            if (mediaSuperiorTeams.length < 2 && superiorTeams.length < 2) {
                alert('Se necesitan al menos 2 equipos en algún nivel educativo')
                return
            }

            const msg = `¿Generar clasificatorias separadas?\n\nMedia Superior: ${mediaSuperiorTeams.length} equipos\nSuperior: ${superiorTeams.length} equipos\n\n${rounds} ronda(s) por nivel`
            if (!confirm(msg)) return
        } else {
            if (!confirm(`¿Generar ${rounds} ronda(s) de clasificatorias con ${teams.length} equipos?`)) return
        }

        setGenerating(true)
        try {
            let matchNumber = 1

            const generateForTeams = async (teamList: Team[], levelLabel?: string) => {
                for (let round = 0; round < rounds; round++) {
                    for (let i = 0; i < teamList.length; i++) {
                        for (let j = i + 1; j < teamList.length; j++) {
                            await createMatch({
                                eventId,
                                categoryId,
                                round: round + 1,
                                matchNumber: matchNumber++,
                                teamAId: teamList[i].id!,
                                teamBId: teamList[j].id!,
                                stage: 'group',
                                status: 'pending',
                                educationLevel: levelLabel
                            })
                        }
                    }
                }
            }

            if (separateByEducation) {
                if (mediaSuperiorTeams.length >= 2) {
                    await generateForTeams(mediaSuperiorTeams, 'Media Superior')
                }
                if (superiorTeams.length >= 2) {
                    await generateForTeams(superiorTeams, 'Superior')
                }
            } else {
                await generateForTeams(teams)
            }

            alert(`${matchNumber - 1} partidos generados`)
            onGenerated()
        } catch (error) {
            console.error("Error generating qualifiers:", error)
            alert('Error al generar clasificatorias')
        } finally {
            setGenerating(false)
        }
    }

    const mediaSuperiorCount = teams.filter(t => t.educationLevel === 'Media Superior').length
    const superiorCount = teams.filter(t => t.educationLevel === 'Superior').length

    return (
        <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Generar Clasificatorias
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Crea partidos round-robin para la fase de grupos ({teams.length} equipos confirmados)
            </p>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
                <label className="admin-label">Número de Rondas</label>
                <input
                    type="number"
                    className="admin-input"
                    min="1"
                    max="5"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                />
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
                        Media Superior: {mediaSuperiorCount} equipos<br />
                        Superior: {superiorCount} equipos
                    </div>
                )}
            </div>

            <button
                className="btn-admin-login"
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={handleGenerate}
                disabled={generating || teams.length < 2}
            >
                {generating ? 'Generando...' : `🎲 Generar Clasificatorias (${rounds} ronda${rounds > 1 ? 's' : ''})`}
            </button>
        </div>
    )
}
