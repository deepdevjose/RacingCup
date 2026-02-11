'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../../dashboard.css'
import '../eventos.css'
import './evento-detail.css'
import { useAuth } from '@/lib/auth-context'
import {
    getEventById,
    getConfirmedTeamsByEvent,
    getUserTeamInEvent,
    type Event,
    type Team,
    PLAYER_ICONS
} from '@/lib/firebase'
import { Scoreboard } from '@/components/tournament/Scoreboard'
import { LiveBracket } from '@/components/tournament/LiveBracket'

export default function EventoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string
    const { user, profile, loading: authLoading } = useAuth()

    const [event, setEvent] = useState<Event | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [userTeam, setUserTeam] = useState<Team | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('detalles')

    const containerRef = useRef(null)

    // Icons helper (identical to main eventos page)
    const profileIcons = [
        <svg key="0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        <svg key="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
        <svg key="2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M14 12h4"></path><path d="M8 8v8"></path><path d="M16 8v8"></path></svg>,
        <svg key="3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
        <svg key="4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
    ]

    const getIconIdx = (iconStr: string | undefined) => {
        if (!iconStr) return 0
        const idx = PLAYER_ICONS.indexOf(iconStr as any)
        return idx !== -1 ? idx % 5 : 0
    }

    useEffect(() => {
        async function loadData() {
            if (!eventId) return
            try {
                const eventData = await getEventById(eventId)
                setEvent(eventData)
                if (eventData) {
                    const confirmedTeams = await getConfirmedTeamsByEvent(eventId)
                    setTeams(confirmedTeams)
                }
            } catch (error) {
                console.error("Error loading event detail:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [eventId])

    useEffect(() => {
        async function checkUserTeam() {
            if (user && eventId) {
                const team = await getUserTeamInEvent(user.uid, eventId)
                setUserTeam(team)
            }
        }
        if (!authLoading && user) {
            checkUserTeam()
        }
    }, [user, authLoading, eventId])

    useGSAP(() => {
        if (loading || authLoading || !event) return
        gsap.from('.evento-hero-banner, .evento-title-section, .participate-section, .evento-tabs', {
            y: 20,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out'
        })
    }, { scope: containerRef, dependencies: [loading, authLoading, event] })

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            registro_abierto: "Registro Abierto",
            cerrado: "Cerrado",
            en_curso: "En Curso",
            finalizado: "Finalizado"
        }
        return labels[status!] || status
    }

    const getStatusClass = (status: string) => {
        if (status === 'registro_abierto') return 'status-open'
        if (status === 'cerrado') return 'status-limited'
        return 'status-coming'
    }

    if (!event && !loading) {
        return (
            <div className="dashboard-layout" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Evento no encontrado</h1>
                <Link href="/dashboard/eventos" className="btn-primary" style={{ textDecoration: 'none' }}>Volver a eventos</Link>
            </div>
        )
    }

    const eventDate = event ? new Date(event.date) : new Date()

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="/dashboard" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>
                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link active">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>
                    {profile && (
                        <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                            <div style={{ color: profile.playerColor || 'inherit', display: 'flex' }}>
                                {profileIcons[getIconIdx(profile.playerIcon || 'user')]}
                            </div>
                            <div className="pill-content">
                                <span className="pill-gamertag">{profile.gamertag}</span>
                                <span className="pill-subtitle">Ver mi perfil</span>
                            </div>
                        </Link>
                    )}
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                {loading || authLoading || !event ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        {/* Back Link */}
                        <Link href="/dashboard/eventos" className="back-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Todos los eventos
                        </Link>

                        {/* Hero Banner */}
                        <div className="evento-hero-banner">
                            <div className="evento-hero-gradient"></div>
                            <div className="evento-hero-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Event Title Section */}
                        <div className="evento-title-section">
                            <h1 className="evento-title">
                                {event.name}
                                <span className={`categoria-status ${getStatusClass(event.status)}`}>
                                    {getStatusLabel(event.status)}
                                </span>
                            </h1>
                            <p className="evento-description">{event.description}</p>
                            <div className="evento-meta">
                                <span className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {eventDate.toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {event.location}
                                </span>
                            </div>
                        </div>

                        {/* Participate Section */}
                        <div className="participate-section">
                            {userTeam ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
                                    <div className="participate-info">
                                        <h3 style={{ color: '#E32636' }}>¡Ya estás registrado!</h3>
                                        <p>Eres parte del equipo <strong>{userTeam.name}</strong></p>
                                    </div>
                                    <Link href={`/dashboard/equipos/${userTeam.id}`} className="btn-primary">
                                        Ver mi equipo
                                    </Link>
                                </div>
                            ) : event.status === 'registro_abierto' ? (
                                <>
                                    <div className="participate-info">
                                        <h3>Participa en este evento</h3>
                                        <p>Crea un equipo o únete a uno existente con un código de invitación</p>
                                    </div>
                                    <div className="participate-actions">
                                        <Link href={`/dashboard/eventos/${eventId}/unirse`} className="btn-secondary">
                                            Unirse con código
                                        </Link>
                                        <Link href={`/dashboard/eventos/${eventId}/crear-equipo`} className="btn-primary">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                            Crear equipo
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="participate-info" style={{ opacity: 0.6 }}>
                                    <h3>Registro Cerrado</h3>
                                    <p>El periodo de registro para este evento ha finalizado.</p>
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="evento-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'detalles' ? 'active' : ''}`}
                                onClick={() => setActiveTab('detalles')}
                            >
                                Detalles
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'eliminatorias' ? 'active' : ''}`}
                                onClick={() => setActiveTab('eliminatorias')}
                            >
                                Eliminatorias
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'tabla' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tabla')}
                            >
                                Tabla de Puntos
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'equipos' ? 'active' : ''}`}
                                onClick={() => setActiveTab('equipos')}
                            >
                                Equipos
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'detalles' && (
                            <div className="tab-content">
                                <div className="details-grid">
                                    <div className="detail-card">
                                        <h4 className="detail-card-title">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E32636" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            Requisitos de equipo
                                        </h4>
                                        <ul className="requirements-list">
                                            <li>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Mínimo {event.minTeamSize} integrantes
                                            </li>
                                            <li>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Máximo {event.maxTeamSize} integrantes
                                            </li>
                                            <li>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Formato: {event.format}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="detail-card">
                                        <h4 className="detail-card-title">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E32636" strokeWidth="2">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                            </svg>
                                            Categorías
                                        </h4>
                                        <div className="categories-tags">
                                            {event.categories.map((cat, i) => (
                                                <span key={i} className="category-tag">{cat}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'eliminatorias' && (
                            <div className="tab-content">
                                {event.categories.map(cat => (
                                    <div key={cat} style={{ marginBottom: '3rem' }}>
                                        <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#E32636' }}>
                                            🎯 Bracket: {cat}
                                        </h3>
                                        <LiveBracket event={event} categoryId={cat} teams={teams} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'tabla' && (
                            <div className="tab-content">
                                {event.categories.map(cat => (
                                    <div key={cat} style={{ marginBottom: '3rem' }}>
                                        <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#E32636' }}>
                                            📊 Tabla de Puntos: {cat}
                                        </h3>
                                        <Scoreboard eventId={event.id!} categoryId={cat} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'equipos' && (
                            <div className="tab-content">
                                <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                    Equipos Confirmados ({teams.length})
                                </h3>
                                {teams.length === 0 ? (
                                    <div className="empty-state">
                                        <p>Aún no hay equipos confirmados para este evento.</p>
                                    </div>
                                ) : (
                                    <div className="equipos-grid">
                                        {teams.map(team => (
                                            <div key={team.id} className="equipo-card">
                                                <div className="equipo-header">
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: (team.color || '#E32636') + '20',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: team.color || '#E32636',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        🏎️
                                                    </div>
                                                    <div className="equipo-info">
                                                        <h4 className="equipo-name">{team.name}</h4>
                                                        <span className="equipo-status confirmed">Confirmado</span>
                                                    </div>
                                                </div>
                                                <div className="equipo-members">
                                                    <span>Seed: #{team.seed || 'Por asignar'}</span>
                                                </div>
                                                <div className="equipo-categories">
                                                    <div className="category-label">Prototipos:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                        {team.categories?.map((c, i) => (
                                                            <span key={i} className="category-item">{c.category}: {c.prototypeName}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
