'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    getEventById,
    getConfirmedTeamsByEvent,
    type Event,
    type Team
} from '@/lib/firebase'
import { MatchList } from '@/components/organizer/match-list'
import { BracketGenerator } from '@/components/organizer/bracket-generator'
import { QualifiersGenerator } from '@/components/organizer/qualifiers-generator'

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedTab, setSelectedTab] = useState<'management' | 'qualifiers' | 'bracket'>('management')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        loadData()
    }, [eventId])

    async function loadData() {
        setLoading(true)
        try {
            const [eventData, teamsData] = await Promise.all([
                getEventById(eventId),
                getConfirmedTeamsByEvent(eventId)
            ])

            if (!eventData) {
                router.push('/admin/dashboard/eventos')
                return
            }

            setEvent(eventData)
            setTeams(teamsData)

            // Set first category as default
            if (eventData.categories.length > 0 && !selectedCategory) {
                setSelectedCategory(eventData.categories[0])
            }
        } catch (error) {
            console.error("Error loading event:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-white">Cargando evento...</div>

    if (!event) return null

    // Filter teams by selected category
    const categoryTeams = teams.filter(t =>
        t.categories?.some(c => c.category === selectedCategory) ||
        (event.categories.length === 1) // Fallback for single-category events
    )

    return (
        <div>
            <header className="admin-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <Link
                        href="/admin/dashboard/eventos"
                        style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '0.5rem', display: 'inline-block' }}
                    >
                        ← Volver a Eventos
                    </Link>
                    <h1 className="admin-title">{event.name}</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                        Gestión de Torneo • {teams.length} equipos confirmados
                    </p>
                </div>
            </header>

            {/* Winner Banner */}
            {event.winnersConfirmed && event.categoryWinners && selectedCategory && event.categoryWinners[selectedCategory] && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1))',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    borderRadius: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#EAB308',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            🏆
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#EAB308' }}>
                                ¡Torneo Finalizado!
                            </h3>
                            <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                                Ganador: <strong style={{ color: '#fff' }}>
                                    {teams.find(t => t.id === event.categoryWinners![selectedCategory].firstTeamId)?.name || 'Cargando...'}
                                </strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            {event.categories.length > 1 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {event.categories.map(cat => (
                        <button
                            key={cat}
                            className={selectedCategory === cat ? 'btn-admin-login' : ''}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                background: selectedCategory === cat ? undefined : 'transparent',
                                border: selectedCategory === cat ? undefined : '1px solid #334155',
                                color: selectedCategory === cat ? undefined : '#94a3b8',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Management Tabs */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155' }}>
                {(['management', 'qualifiers', 'bracket'] as const).map(tab => (
                    <button
                        key={tab}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.9rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: selectedTab === tab ? '2px solid #E32636' : '2px solid transparent',
                            color: selectedTab === tab ? '#fff' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: selectedTab === tab ? 600 : 400
                        }}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab === 'management' ? 'Gestión' :
                            tab === 'qualifiers' ? 'Clasificatorias' : 'Eliminatorias'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'management' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="admin-card" style={{ padding: '1.5rem' }}>
                        <QualifiersGenerator
                            eventId={eventId}
                            categoryId={selectedCategory}
                            teams={categoryTeams}
                            onGenerated={() => setRefreshKey(prev => prev + 1)}
                        />
                    </div>
                    <div className="admin-card" style={{ padding: '1.5rem' }}>
                        <BracketGenerator
                            eventId={eventId}
                            categoryId={selectedCategory}
                            teams={categoryTeams}
                            onGenerated={() => setRefreshKey(prev => prev + 1)}
                        />
                    </div>
                </div>
            )}

            {selectedTab === 'qualifiers' && (
                <MatchList
                    key={`qual-${selectedCategory}-${refreshKey}`}
                    eventId={eventId}
                    categoryId={selectedCategory}
                    teams={categoryTeams}
                    filterStage="group"
                    viewMode="list"
                />
            )}

            {selectedTab === 'bracket' && (
                <MatchList
                    key={`brack-${selectedCategory}-${refreshKey}`}
                    eventId={eventId}
                    categoryId={selectedCategory}
                    teams={categoryTeams}
                    filterStage="bracket"
                    viewMode="list"
                />
            )}
        </div>
    )
}
