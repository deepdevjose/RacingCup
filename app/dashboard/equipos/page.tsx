'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css'
import './equipos.css'

import { useAuth } from '@/lib/auth-context'
import {
    getAllTeams,
    getTeamMembers,
    getAllEvents,
    type Team,
    type Event,
    type TeamMember
} from '@/lib/firebase'
import { TeamIcon } from '@/components/tournament/TeamIcon'
import Footer from '@/components/common/Footer'

interface TeamWithDetails extends Team {
    members: TeamMember[]
    event?: Event
}

// Profile icons fallback helper (matching Navbar)
const profileIcons = [
    <svg key="user" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    <svg key="smile" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
]
const getIconIdx = (iconName: string | undefined) => iconName === 'smile' ? 1 : 0

export default function TeamsPage() {
    const { profile, loading: authLoading } = useAuth()
    const containerRef = useRef<HTMLDivElement>(null)

    const [teams, setTeams] = useState<TeamWithDetails[]>([])
    const [filteredTeams, setFilteredTeams] = useState<TeamWithDetails[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [eventFilter, setEventFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        async function loadData() {
            try {
                const [teamsData, eventsData] = await Promise.all([
                    getAllTeams(),
                    getAllEvents(),
                ])

                const teamsWithDetails = await Promise.all(
                    teamsData.map(async (team) => {
                        const members = await getTeamMembers(team.id!)
                        const event = eventsData.find((e) => e.id === team.eventId)
                        return { ...team, members, event }
                    })
                )

                setTeams(teamsWithDetails)
                setFilteredTeams(teamsWithDetails)
                setEvents(eventsData)
            } catch (error) {
                console.error("Error loading teams:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    useEffect(() => {
        let result = [...teams]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter((team) =>
                team.name.toLowerCase().includes(query)
            )
        }

        if (eventFilter !== "all") {
            result = result.filter((team) => team.eventId === eventFilter)
        }

        if (statusFilter !== "all") {
            const isConfirmedTarget = statusFilter === "confirmed"
            result = result.filter((team) => !!team.isConfirmed === isConfirmedTarget)
        }

        setFilteredTeams(result)
    }, [teams, searchQuery, eventFilter, statusFilter])

    useGSAP(() => {
        if (!loading && containerRef.current) {
            // Animate stats
            const stats = containerRef.current.querySelectorAll('.stat-card')
            if (stats.length > 0) {
                gsap.fromTo(stats,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
                )
            }

            // Animate teams
            const teamCards = containerRef.current.querySelectorAll('.team-card-premium')
            if (teamCards.length > 0) {
                gsap.fromTo(teamCards,
                    { y: 30, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.5,
                        stagger: 0.05,
                        delay: 0.2,
                        ease: 'power2.out',
                        clearProps: 'opacity,transform' // Ensure no leftover styles block visibility
                    }
                )
            }
        }
    }, { dependencies: [loading, filteredTeams], scope: containerRef })

    const stats = {
        total: teams.length,
        confirmed: teams.filter(t => t.isConfirmed).length,
        pending: teams.filter(t => !t.isConfirmed).length,
        totalParticipants: teams.reduce((acc, t) => acc + t.members.length, 0)
    }

    if (loading || authLoading) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

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
                        <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link active">Equipos</Link>
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
                <header className="page-header">
                    <h1 className="page-title">Equipos Participantes</h1>
                    <p className="page-subtitle">Conoce a los equipos que competirán en el torneo</p>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Equipos Registrados</span>
                    </div>
                    <div className="stat-card success">
                        <span className="stat-value">{stats.confirmed}</span>
                        <span className="stat-label">Confirmados</span>
                    </div>
                    <div className="stat-card warning">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pendiente</span>
                    </div>
                    <div className="stat-card info">
                        <span className="stat-value">{stats.totalParticipants}</span>
                        <span className="stat-label">Participantes</span>
                    </div>
                </div>

                <div className="equipos-filters">
                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar equipos..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                        >
                            <option value="all">Todos los eventos</option>
                            {events.map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="confirmed">Confirmados</option>
                            <option value="pending">Pendientes</option>
                        </select>
                    </div>
                </div>

                <div className="teams-grid-premium">
                    {filteredTeams.map((team) => (
                        <div key={team.id} className="team-card-premium">
                            <div className="team-card-header">
                                <div className="team-icon-circle" style={{ backgroundColor: team.color + '20', borderColor: team.color + '40' }}>
                                    <TeamIcon icon={team.icon} color={team.color} size={24} />
                                </div>
                                <div className="team-main-info">
                                    <h3 className="team-name">{team.name}</h3>
                                    <span className="team-event-tag">{team.event?.name || 'Evento'}</span>
                                </div>
                                <div className={`team-status-pill ${team.isConfirmed ? 'is-confirmed' : 'is-pending'}`}>
                                    {team.isConfirmed ? 'Confirmado' : 'Pendiente'}
                                </div>
                            </div>

                            <div className="team-card-body">
                                <div className="detail-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                    </svg>
                                    <span>{team.members.length} Integrante{team.members.length !== 1 ? 's' : ''}</span>
                                </div>
                                {team.seed && (
                                    <div className="detail-item seed">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                        </svg>
                                        <span>Seed: #{team.seed}</span>
                                    </div>
                                )}
                            </div>

                            {team.categories && team.categories.length > 0 && (
                                <div className="team-card-footer">
                                    <div className="categories-badges">
                                        {team.categories.map((c, idx) => (
                                            <div key={idx} className="category-badge">
                                                <span className="p-name">{c.prototypeName}</span>
                                                <span className="c-name">{c.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredTeams.length === 0 && (
                        <div className="empty-state-card">
                            <div className="empty-icon">🤖</div>
                            <h3>No se encontraron equipos</h3>
                            <p>Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="teams-cta-section">
                    <div className="cta-card-glass">
                        <h3 className="cta-title">¿Quieres participar?</h3>
                        <p className="cta-text">Registra a tu equipo y compite contra los mejores en este increíble torneo.</p>
                        <Link href="/dashboard/eventos" className="btn-primary-cta">
                            Explorar Eventos
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
