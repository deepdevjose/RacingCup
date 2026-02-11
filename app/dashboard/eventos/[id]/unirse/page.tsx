'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../../../dashboard.css'
import '../../eventos.css'
import '../evento-detail.css'
import './unirse.css'

import { useAuth } from '@/lib/auth-context'
import {
    getEventById,
    getTeamByInviteCode,
    addTeamMember,
    getUserTeamInEvent,
    deleteTeam,
    getUserLeadingTeams,
    type Event,
    type Team
} from '@/lib/firebase'
import { TeamIcon } from '@/components/tournament/TeamIcon'

// Profile icons fallback helper (matching Navbar)
const profileIcons = [
    <svg key="user" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    <svg key="smile" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
]
const getIconIdx = (iconName: string | undefined) => iconName === 'smile' ? 1 : 0

export default function UnirseEquipoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const eventId = resolvedParams.id
    const router = useRouter()
    const { profile, user, loading: authLoading } = useAuth()
    const containerRef = useRef<HTMLDivElement>(null)

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [joining, setJoining] = useState(false)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [foundTeam, setFoundTeam] = useState<Team | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const eventData = await getEventById(eventId)
                if (!eventData) {
                    setError("Evento no encontrado")
                    return
                }
                setEvent(eventData)
            } catch (err) {
                console.error("Error loading event:", err)
                setError("Error al cargar el evento")
            } finally {
                setLoading(false)
            }
        }
        if (!authLoading) {
            loadData()
        }
    }, [eventId, authLoading])

    useGSAP(() => {
        if (!loading && event) {
            gsap.from('.unirse-container', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
        }
    }, { dependencies: [loading, event], scope: containerRef })

    const handleSearch = async () => {
        if (!code.trim()) return

        setSearching(true)
        setError("")
        setFoundTeam(null)

        try {
            const team = await getTeamByInviteCode(code.toUpperCase().trim())
            if (!team) {
                setError("Código de invitación no válido")
            } else if (team.eventId !== eventId) {
                setError("Este código pertenece a otro evento")
            } else {
                setFoundTeam(team)
                // Animate entry of team card
                setTimeout(() => {
                    gsap.from('.found-team-card', {
                        y: 10,
                        opacity: 0,
                        duration: 0.4
                    })
                }, 10)
            }
        } catch (err) {
            console.error("Error searching team:", err)
            setError("Error al buscar el equipo")
        } finally {
            setSearching(false)
        }
    }

    const handleJoin = async () => {
        if (!user || !foundTeam) return

        setJoining(true)
        setError("")

        try {
            // Check if user already has a team in this event
            const existingTeam = await getUserTeamInEvent(user.uid, eventId)
            if (existingTeam) {
                // Determine if user is leader of that existing team
                const leadingTeams = await getUserLeadingTeams(user.uid)
                const isLeader = leadingTeams.some(t => t.id === existingTeam.id)

                if (isLeader && existingTeam.id) {
                    // Logic from demo: delete previous team if joining a new one
                    await deleteTeam(existingTeam.id)
                }
            }

            // Join the new team
            await addTeamMember(eventId, foundTeam.id!, user.uid, "accepted")
            router.push(`/dashboard/eventos/${eventId}`)
        } catch (err) {
            console.error("Error joining team:", err)
            setError("Error al unirse al equipo")
            setJoining(false)
        }
    }

    if (loading || authLoading) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="dashboard-layout" style={{ padding: '4rem', textAlign: 'center' }}>
                <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Evento no encontrado</h1>
                <Link href="/dashboard/eventos" className="btn-primary" style={{ textDecoration: 'none' }}>Volver a eventos</Link>
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
                <Link href={`/dashboard/eventos/${eventId}`} className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver al evento
                </Link>

                <div className="unirse-container">
                    <div className="unirse-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                    </div>

                    <h1 className="unirse-title">Unirse a un equipo</h1>
                    <p className="unirse-subtitle">Ingresa el código de invitación para unirte a un equipo en {event.name}</p>

                    <div className="unirse-form">
                        {error && (
                            <div className="unirse-error-box">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {error}
                            </div>
                        )}

                        <label className="input-label">Código de invitación</label>
                        <div className="unirse-input-row">
                            <input
                                type="text"
                                className="code-input"
                                placeholder="EJ: ABC123"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                className="btn-buscar-unirse"
                                onClick={handleSearch}
                                disabled={!code.trim() || searching}
                            >
                                {searching ? "..." : "Buscar"}
                            </button>
                        </div>
                    </div>

                    {foundTeam && (
                        <div className="found-team-card">
                            <div className="found-team-header">
                                <div className="found-team-icon-box" style={{ backgroundColor: foundTeam.color + '20', borderColor: foundTeam.color + '40' }}>
                                    <TeamIcon icon={foundTeam.icon} color={foundTeam.color} size={28} />
                                </div>
                                <div className="found-team-info">
                                    <span className="found-team-name">{foundTeam.name}</span>
                                    <span className="found-event-name">{event.name}</span>
                                </div>
                            </div>

                            <div className="join-warning-box">
                                <p><strong>Nota:</strong> Al unirte, serás parte de este equipo. Si ya tenías un equipo propio en este evento, el anterior será eliminado.</p>
                            </div>

                            <button
                                className="btn-confirmar-unirse"
                                onClick={handleJoin}
                                disabled={joining}
                            >
                                {joining ? "Uniendo..." : "Unirse al equipo"}
                            </button>
                        </div>
                    )}

                    {!foundTeam && (
                        <p className="unirse-alt">
                            ¿No tienes un código?{' '}
                            <Link href={`/dashboard/eventos/${eventId}/crear-equipo`} className="link-crear">
                                Crea tu propio equipo
                            </Link>
                        </p>
                    )}
                </div>
            </main>
        </div>
    )
}
