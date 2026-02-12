'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTeam, createProfile, updateTeamConfirmation, TEAM_ICONS, TEAM_COLORS } from '@/lib/firebase'

export default function TestTeamsPage() {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const [log, setLog] = useState<string[]>([])

    const addLog = (message: string) => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    const generateTestTeams = async () => {
        setGenerating(true)
        setLog([])

        try {
            addLog('Iniciando generación de 40 equipos de prueba...')

            // Necesitas un eventId válido - ajusta esto según tu evento
            const eventId = prompt('Ingresa el ID del evento:')
            if (!eventId) {
                addLog('❌ Se canceló la generación')
                setGenerating(false)
                return
            }

            // Generate 20 Media Superior teams
            addLog('📚 Generando 20 equipos de Media Superior...')
            for (let i = 1; i <= 20; i++) {
                try {
                    // Create fake user profile
                    const userId = `test_ms_user_${i}_${Date.now()}`
                    const gamertag = `MS${String(i).padStart(6, '0')}`

                    await createProfile({
                        userId,
                        email: `test_ms_${i}@test.com`,
                        displayName: `Test MS User ${i}`,
                        gamertag,
                        school: `Escuela Media Superior ${i}`,
                        isTeacher: false,
                        educationLevel: 'Media Superior'
                    })

                    // Create team with minisumo category
                    const teamName = `Equipo MS ${i}`
                    const icon = TEAM_ICONS[i % TEAM_ICONS.length]
                    const color = TEAM_COLORS[i % TEAM_COLORS.length].value
                    const categories = [{ category: 'Mini Sumo', prototypeName: 'Robot MS ' + i }]

                    const teamId = await createTeam(eventId, teamName, userId, icon, color, categories)

                    // Auto-confirm team
                    await updateTeamConfirmation(teamId, true)

                    addLog(`✅ Creado y confirmado: ${teamName}`)
                } catch (error: any) {
                    addLog(`❌ Error en equipo MS ${i}: ${error.message}`)
                }
            }

            // Generate 20 Superior teams
            addLog('🎓 Generando 20 equipos de Superior...')
            for (let i = 1; i <= 20; i++) {
                try {
                    // Create fake user profile
                    const userId = `test_sup_user_${i}_${Date.now()}`
                    const gamertag = `SUP${String(i).padStart(5, '0')}`

                    await createProfile({
                        userId,
                        email: `test_sup_${i}@test.com`,
                        displayName: `Test Superior User ${i}`,
                        gamertag,
                        school: `Universidad Superior ${i}`,
                        isTeacher: false,
                        educationLevel: 'Superior'
                    })

                    // Create team with minisumo category
                    const teamName = `Equipo Superior ${i}`
                    const icon = TEAM_ICONS[(i + 10) % TEAM_ICONS.length]
                    const color = TEAM_COLORS[(i + 3) % TEAM_COLORS.length].value
                    const categories = [{ category: 'Mini Sumo', prototypeName: 'Robot Superior ' + i }]

                    const teamId = await createTeam(eventId, teamName, userId, icon, color, categories)

                    // Auto-confirm team
                    await updateTeamConfirmation(teamId, true)

                    addLog(`✅ Creado y confirmado: ${teamName}`)
                } catch (error: any) {
                    addLog(`❌ Error en equipo Superior ${i}: ${error.message}`)
                }
            }

            addLog('🎉 ¡Generación completada! 40 equipos creados.')
        } catch (error: any) {
            addLog(`❌ Error general: ${error.message}`)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #334155',
                            color: '#94a3b8',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        ← Volver al Dashboard
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Panel de Prueba - Generador de Equipos
                    </h1>
                    <p style={{ color: '#94a3b8' }}>
                        Genera 40 equipos de prueba (20 Media Superior + 20 Superior) para testing
                    </p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Instrucciones</h2>
                    <ol style={{ color: '#94a3b8', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                        <li>Asegúrate de tener un evento creado</li>
                        <li>Copia el ID del evento desde la URL del evento</li>
                        <li>Haz clic en "Generar Equipos de Prueba"</li>
                        <li>Pega el ID del evento cuando se solicite</li>
                        <li>Espera a que se generen los 40 equipos</li>
                    </ol>

                    <button
                        onClick={generateTestTeams}
                        disabled={generating}
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: generating ? '#666' : 'linear-gradient(135deg, #E32636, #C41E3A)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: generating ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {generating ? '⏳ Generando...' : '🚀 Generar Equipos de Prueba'}
                    </button>
                </div>

                {log.length > 0 && (
                    <div style={{
                        background: '#000',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#10B981' }}>
                            📋 Log de Generación
                        </h3>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6' }}>
                            {log.map((line, i) => (
                                <div key={i} style={{ marginBottom: '0.25rem', color: line.includes('❌') ? '#EF4444' : line.includes('✅') ? '#10B981' : '#94a3b8' }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
