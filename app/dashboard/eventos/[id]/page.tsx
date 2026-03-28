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
    getMatchesByEvent,
    type Event,
    type Team,
    type Match
} from '@/lib/firebase'
import { Scoreboard } from '@/components/tournament/Scoreboard'
import { PublicBracket } from '@/components/tournament/PublicBracket'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'

export default function EventoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string
    const { user, profile, loading: authLoading } = useAuth()

    const [event, setEvent] = useState<Event | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [matches, setMatches] = useState<Match[]>([])
    const [userTeam, setUserTeam] = useState<Team | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('detalles')

    // Match Tab State
    const [activeMatchTab, setActiveMatchTab] = useState<'programados' | 'finalizados'>('programados')
    const [matchCategoryFilter, setMatchCategoryFilter] = useState<string>('all')
    const [matchUserTeamFilter, setMatchUserTeamFilter] = useState(false)

    const containerRef = useRef(null)



    useEffect(() => {
        async function loadData() {
            if (!eventId) return
            try {
                const eventData = await getEventById(eventId)
                setEvent(eventData)
                if (eventData) {
                    const confirmedTeams = await getConfirmedTeamsByEvent(eventId)
                    setTeams(confirmedTeams)
                    const eventMatches = await getMatchesByEvent(eventId)
                    setMatches(eventMatches)
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
            <DashboardNavbar />

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

                        {/* Hero Banner with Integrated Info */}
                        <div className="evento-hero-banner">
                            <div className="evento-hero-gradient"></div>


                            <div className="evento-hero-content">
                                <div className="evento-hero-main">
                                    <div className="evento-info-wrapper">
                                        <span className={`evento-status-badge ${getStatusClass(event.status)}`}>
                                            {getStatusLabel(event.status)}
                                        </span>
                                        <h1 className="evento-title">{event.name}</h1>
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

                                    <div className="evento-stats-grid">
                                        <div className="evento-stat-card">
                                            <div className="stat-icon" style={{ color: '#E32636' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                </svg>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{teams.length}</div>
                                                <div className="stat-label">Equipos</div>
                                            </div>
                                        </div>

                                        <div className="evento-stat-card">
                                            <div className="stat-icon" style={{ color: '#3B82F6' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                                </svg>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{event.categories.length}</div>
                                                <div className="stat-label">Categorías</div>
                                            </div>
                                        </div>

                                        <div className="evento-stat-card">
                                            <div className="stat-icon" style={{ color: '#10B981' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                                    <path d="M6 12h4"></path>
                                                    <path d="M14 12h4"></path>
                                                    <path d="M8 8v8"></path>
                                                    <path d="M16 8v8"></path>
                                                </svg>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{event.format}</div>
                                                <div className="stat-label">Formato</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                                onClick={() => setActiveTab('matches')}
                            >
                                Matches
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'tabla' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tabla')}
                            >
                                Tabla de Puntos
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'eliminatorias' ? 'active' : ''}`}
                                onClick={() => setActiveTab('eliminatorias')}
                            >
                                Eliminatorias
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
                                            Requisitos del evento
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

                                    <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
                                        <h4 className="detail-card-title">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E32636" strokeWidth="2">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                            </svg>
                                            Categorías y Ganadores
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                            {event.categories.map((cat, i) => {
                                                // Get all bracket matches for this category
                                                const categoryMatches = matches.filter(m => m.categoryId === cat && m.stage === 'bracket');
                                                
                                                // Group by education level
                                                const matchesByLevel = categoryMatches.reduce<Record<string, Match[]>>((acc, match) => {
                                                    const level = match.educationLevel || 'General';
                                                    if (!acc[level]) acc[level] = [];
                                                    acc[level].push(match);
                                                    return acc;
                                                }, {});
                                                
                                                const finalsByLevel: Record<string, Match> = {};
                                                for (const [level, levelMatches] of Object.entries(matchesByLevel)) {
                                                    const roundMap = new Map<number, Match[]>();
                                                    for (const m of levelMatches) {
                                                        if (!roundMap.has(m.round)) roundMap.set(m.round, []);
                                                        roundMap.get(m.round)!.push(m);
                                                    }
                                                    
                                                    const sortedRounds = [...roundMap.keys()].sort((a, b) => {
                                                        const countA = roundMap.get(a)?.length || 0;
                                                        const countB = roundMap.get(b)?.length || 0;
                                                        if (countA !== countB) return countB - countA;
                                                        return a - b;
                                                    });
                                                    
                                                    const finalRound = sortedRounds[sortedRounds.length - 1];
                                                    const finalMatch = finalRound !== undefined ? roundMap.get(finalRound)?.[0] : undefined;
                                                    
                                                    if (finalMatch && finalMatch.status === 'completed' && finalMatch.winnerId) {
                                                        finalsByLevel[level] = finalMatch;
                                                    }
                                                }

                                                const hasWinners = Object.keys(finalsByLevel).length > 0;

                                                return (
                                                    <div key={i} style={{
                                                        background: 'rgba(255, 255, 255, 0.03)',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '0.75rem',
                                                        padding: '1.5rem',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: hasWinners ? '1.5rem' : '0'
                                                    }}>
                                                        <h5 style={{ fontSize: '1.1rem', color: '#fff', margin: 0, borderBottom: hasWinners ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: hasWinners ? '0.5rem' : '1rem' }}>
                                                            {cat}
                                                        </h5>

                                                        {hasWinners ? (
                                                            Object.entries(finalsByLevel).map(([level, finalMatch]) => {
                                                                const firstId = finalMatch.winnerId;
                                                                const secondId = firstId === finalMatch.teamAId ? finalMatch.teamBId : finalMatch.teamAId;
                                                                const firstPlaceTeam = teams.find(t => t.id === firstId);
                                                                const secondPlaceTeam = teams.find(t => t.id === secondId);

                                                                return (
                                                                    <div key={level} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                                        {Object.keys(finalsByLevel).length > 1 && (
                                                                            <h6 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                                {level}
                                                                            </h6>
                                                                        )}

                                                                        {firstPlaceTeam && (
                                                                            <>
                                                                                {/* 1st Place */}
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                                    <div style={{
                                                                                        width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
                                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.5rem', boxShadow: '0 0 15px rgba(255,215,0,0.4)', flexShrink: 0
                                                                                    }}>
                                                                                        🏆
                                                                                    </div>
                                                                                    <div>
                                                                                        <div style={{ fontSize: '0.8rem', color: '#FFD700', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>1er Lugar</div>
                                                                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{firstPlaceTeam.name}</div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* 2nd Place */}
                                                                                {secondPlaceTeam && (
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', opacity: 0.9 }}>
                                                                                        <div style={{
                                                                                            width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
                                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '1.1rem', flexShrink: 0
                                                                                        }}>
                                                                                            🥈
                                                                                        </div>
                                                                                        <div>
                                                                                            <div style={{ fontSize: '0.7rem', color: '#C0C0C0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>2do Lugar</div>
                                                                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{secondPlaceTeam.name}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', flexDirection: 'column', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.9rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                                                                Torneo en curso <br /> Ganadores por definirse
                                                            </div>
                                                        )}

                                                        {hasWinners && (
                                                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'matches' && (
                            <div className="tab-content">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Matches Sub-tabs & Filters */}
                                    <div className="matches-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {/* Sub-tabs */}
                                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '0.5rem', width: 'fit-content' }}>
                                            <button
                                                onClick={() => setActiveMatchTab('programados')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.35rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    background: activeMatchTab === 'programados' ? '#E32636' : 'transparent',
                                                    color: activeMatchTab === 'programados' ? '#fff' : 'rgba(255,255,255,0.6)',
                                                    transition: 'all 0.2s ease',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Programados
                                            </button>
                                            <button
                                                onClick={() => setActiveMatchTab('finalizados')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.35rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    background: activeMatchTab === 'finalizados' ? '#10B981' : 'transparent',
                                                    color: activeMatchTab === 'finalizados' ? '#fff' : 'rgba(255,255,255,0.6)',
                                                    transition: 'all 0.2s ease',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Finalizados
                                            </button>
                                        </div>

                                        {/* Filters */}
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Categoría:</span>
                                                <select
                                                    value={matchCategoryFilter}
                                                    onChange={(e) => setMatchCategoryFilter(e.target.value)}
                                                    className="category-filter-select"
                                                >
                                                    <option value="all">Todas</option>
                                                    {event.categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {userTeam && (
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={matchUserTeamFilter}
                                                        onChange={(e) => setMatchUserTeamFilter(e.target.checked)}
                                                        style={{ accentColor: '#E32636' }}
                                                    />
                                                    <span style={{ fontSize: '0.85rem', color: matchUserTeamFilter ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                                                        Ver solo mi equipo ({userTeam.name})
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    {/* Matches List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {(() => {
                                            // Filter Logic
                                            let filteredMatches = matches.filter(m => {
                                                // Assuming match object has teamAId, teamBId, scoreA, scoreB, status, winnerId
                                                const isFinished = m.status === 'completed' || !!m.winnerId;
                                                const matchesTab = activeMatchTab === 'finalizados' ? isFinished : !isFinished;
                                                const matchesCategory = matchCategoryFilter === 'all' || m.categoryId === matchCategoryFilter;
                                                const matchesTeam = !matchUserTeamFilter || (userTeam && (m.teamAId === userTeam.id || m.teamBId === userTeam.id));

                                                return matchesTab && matchesCategory && matchesTeam;
                                            });

                                            if (filteredMatches.length === 0) {
                                                return (
                                                    <div className="empty-state">
                                                        <p>No se encontraron partidos con los filtros seleccionados.</p>
                                                    </div>
                                                );
                                            }

                                            // Group by Category
                                            const categoriesToShow = matchCategoryFilter === 'all' ? event.categories : [matchCategoryFilter];

                                            return categoriesToShow.map(cat => {
                                                const categoryMatches = filteredMatches.filter(m => m.categoryId === cat);
                                                if (categoryMatches.length === 0) return null;

                                                return (
                                                    <div key={cat}>
                                                        <h4 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem', color: activeMatchTab === 'finalizados' ? '#10B981' : '#E32636' }}>
                                                            🎮 {cat}
                                                        </h4>
                                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                                            {categoryMatches.map(match => {
                                                                const team1 = teams.find(t => t.id === match.teamAId)
                                                                const team2 = teams.find(t => t.id === match.teamBId)
                                                                const isUserMatch = userTeam && (match.teamAId === userTeam.id || match.teamBId === userTeam.id)

                                                                return (
                                                                    <div key={match.id} className="detail-card" style={{
                                                                        padding: '1.25rem',
                                                                        border: isUserMatch ? '1px solid rgba(227, 38, 54, 0.4)' : undefined,
                                                                        background: isUserMatch ? 'linear-gradient(145deg, rgba(227, 38, 54, 0.05), rgba(0,0,0,0))' : undefined
                                                                    }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                                                {/* Team A */}
                                                                                <div style={{ textAlign: 'center', minWidth: '120px', flex: 1 }}>
                                                                                    <div style={{
                                                                                        fontSize: '0.9rem',
                                                                                        color: match.winnerId === match.teamAId ? '#10B981' : 'rgba(255,255,255,0.9)',
                                                                                        fontWeight: match.winnerId === match.teamAId ? 800 : 600
                                                                                    }}>
                                                                                        {team1?.name || 'TBD'}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginTop: '0.25rem' }}>
                                                                                        {match.scoreA ?? '-'}
                                                                                    </div>
                                                                                </div>

                                                                                <div style={{
                                                                                    padding: '0.5rem 1rem',
                                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                                    borderRadius: '0.5rem',
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 700,
                                                                                    color: 'rgba(255,255,255,0.5)'
                                                                                }}>
                                                                                    VS
                                                                                </div>

                                                                                {/* Team B */}
                                                                                <div style={{ textAlign: 'center', minWidth: '120px', flex: 1 }}>
                                                                                    <div style={{
                                                                                        fontSize: '0.9rem',
                                                                                        color: match.winnerId === match.teamBId ? '#10B981' : 'rgba(255,255,255,0.9)',
                                                                                        fontWeight: match.winnerId === match.teamBId ? 800 : 600
                                                                                    }}>
                                                                                        {team2?.name || 'TBD'}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginTop: '0.25rem' }}>
                                                                                        {match.scoreB ?? '-'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '100px' }}>
                                                                                <span style={{
                                                                                    fontSize: '0.7rem',
                                                                                    color: 'rgba(255,255,255,0.5)',
                                                                                    textTransform: 'uppercase',
                                                                                    letterSpacing: '0.5px',
                                                                                    fontWeight: 600
                                                                                }}>
                                                                                    {match.round ? `Round ${match.round}` : 'Eliminatoria'}
                                                                                </span>
                                                                                {match.winnerId ? (
                                                                                    <span style={{
                                                                                        padding: '0.25rem 0.75rem',
                                                                                        background: 'rgba(34, 197, 94, 0.15)',
                                                                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                                                                        borderRadius: '1rem',
                                                                                        fontSize: '0.7rem',
                                                                                        fontWeight: 700,
                                                                                        color: '#22c55e'
                                                                                    }}>
                                                                                        Finalizado
                                                                                    </span>
                                                                                ) : (
                                                                                    <span style={{
                                                                                        padding: '0.25rem 0.75rem',
                                                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                                        borderRadius: '1rem',
                                                                                        fontSize: '0.7rem',
                                                                                        fontWeight: 600,
                                                                                        color: 'rgba(255,255,255,0.7)'
                                                                                    }}>
                                                                                        Programado
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        })()}
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
                                        <PublicBracket eventId={event.id!} categoryId={cat} teams={teams} />
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
