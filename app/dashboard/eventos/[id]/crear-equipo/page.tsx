'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../../../dashboard.css'
import '../../eventos.css'
import '../evento-detail.css'
import './crear-equipo.css'

import { useAuth } from '@/lib/auth-context'
import {
    getEventById,
    createTeam,
    getUserTeamInEvent,
    TEAM_ICONS,
    TEAM_COLORS,
    type Event,
    type TeamCategoryEntry
} from '@/lib/firebase'
import { TeamIcon } from '@/components/tournament/TeamIcon'

// Profile icons fallback helper (matching Navbar)
const profileIcons = [
    <svg key="user" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    <svg key="smile" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
]
const getIconIdx = (iconName: string | undefined) => iconName === 'smile' ? 1 : 0

export default function CrearEquipoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const eventId = resolvedParams.id
    const router = useRouter()
    const { profile, user, loading: authLoading } = useAuth()
    const containerRef = useRef<HTMLDivElement>(null)

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState("")

    const [teamName, setTeamName] = useState("")
    const [selectedIcon, setSelectedIcon] = useState<typeof TEAM_ICONS[number]>("robot")
    const [selectedColor, setSelectedColor] = useState<string>(TEAM_COLORS[0].value)
    const [categories, setCategories] = useState<TeamCategoryEntry[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const eventData = await getEventById(eventId)
                if (!eventData) {
                    setError("Evento no encontrado")
                    return
                }
                setEvent(eventData)

                // Check for existing team
                if (user) {
                    const existingTeam = await getUserTeamInEvent(user.uid, eventId)
                    if (existingTeam) {
                        router.push(`/dashboard/eventos/${eventId}`) // Or to team detail
                    }
                }
            } catch (err) {
                console.error("Error loading data:", err)
                setError("Error al cargar la información")
            } finally {
                setLoading(false)
            }
        }
        if (!authLoading) {
            loadData()
        }
    }, [eventId, user, authLoading, router])

    useGSAP(() => {
        if (!loading && event) {
            gsap.from('.crear-equipo-container', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
        }
    }, { dependencies: [loading, event], scope: containerRef })

    const handleCreate = async () => {
        if (!user || !teamName.trim()) return

        setCreating(true)
        setError("")

        try {
            if (categories.length === 0) {
                throw new Error("Selecciona al menos una categoría")
            }

            const invalidCategory = categories.find(c => !c.prototypeName.trim())
            if (invalidCategory) {
                throw new Error(`Asigna un nombre al robot para ${invalidCategory.category}`)
            }

            const teamId = await createTeam(
                eventId,
                teamName.trim(),
                user.uid,
                selectedIcon,
                selectedColor,
                categories
            )
            router.push(`/dashboard/eventos/${eventId}`)
        } catch (err: any) {
            setError(err.message || "Error al crear el equipo")
            setCreating(false)
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
                <h1 style={{ color: '#fff', marginBottom: '1rem' }}>{error || "Evento no encontrado"}</h1>
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

                <div className="crear-equipo-container">
                    <div className="crear-icon" style={{ backgroundColor: selectedColor + '20', borderColor: selectedColor + '40' }}>
                        <TeamIcon icon={selectedIcon} color={selectedColor} size={32} />
                    </div>

                    <h1 className="crear-title">Crear equipo</h1>
                    <p className="crear-subtitle">Completa los datos para inscribirte en {event.name}</p>

                    {error && (
                        <div className="error-alert" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(227, 38, 54, 0.1)', border: '1px solid #E32636', borderRadius: '0.5rem', color: '#E32636', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="input-label">Nombre del equipo</label>
                        <input
                            type="text"
                            className="team-name-input"
                            placeholder="Ej: Alpha Team"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Icono del equipo</label>
                        <div className="icon-grid">
                            {TEAM_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon(icon)}
                                    style={{ borderColor: selectedIcon === icon ? selectedColor : undefined }}
                                >
                                    <TeamIcon icon={icon} color={selectedIcon === icon ? selectedColor : 'rgba(255,255,255,0.4)'} size={24} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Color del equipo</label>
                        <div className="color-grid">
                            {TEAM_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => setSelectedColor(color.value)}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Categorías y Prototipos</label>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                            Selecciona las categorías y asigna un nombre a tu prototipo.
                        </p>

                        <div className="categories-list">
                            {event.categories.map((category) => {
                                const isSelected = categories.some(c => c.category === category)
                                const currentEntry = categories.find(c => c.category === category)

                                return (
                                    <div key={category} className={`category-selection-card ${isSelected ? 'active' : ''}`}>
                                        <div className="category-check-row">
                                            <label className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setCategories([...categories, { category, prototypeName: "" }])
                                                        } else {
                                                            setCategories(categories.filter(c => c.category !== category))
                                                        }
                                                    }}
                                                />
                                                <span className="checkmark"></span>
                                                <span className="category-name">{category}</span>
                                            </label>
                                        </div>

                                        {isSelected && (
                                            <div className="prototype-input-wrapper">
                                                <input
                                                    type="text"
                                                    className="prototype-name-input"
                                                    placeholder={`Nombre del robot para ${category}`}
                                                    value={currentEntry?.prototypeName || ""}
                                                    onChange={(e) => {
                                                        const updated = categories.map(c =>
                                                            c.category === category
                                                                ? { ...c, prototypeName: e.target.value }
                                                                : c
                                                        )
                                                        setCategories(updated)
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        className="btn-crear-equipo"
                        onClick={handleCreate}
                        disabled={!teamName.trim() || creating || categories.length === 0}
                    >
                        {creating ? "Creando..." : "Crear equipo"}
                    </button>
                </div>
            </main>
        </div>
    )
}
