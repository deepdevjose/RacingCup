'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css'
import './eventos.css'
import { useAuth } from '@/lib/auth-context'
import {
    getAllEvents,
    type Event,
    PLAYER_ICONS
} from '@/lib/firebase'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'

export default function EventosPage() {
    const { profile, loading: authLoading } = useAuth()
    const containerRef = useRef(null)
    const animatedRef = useRef(false)

    // Data State
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")



    // Load Data
    useEffect(() => {
        async function loadEvents() {
            try {
                const allEvents = await getAllEvents()
                // Sort by date, most recent first, with defensive checks
                allEvents.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0
                    const dateB = b.date ? new Date(b.date).getTime() : 0
                    return dateB - dateA
                })
                setEvents(allEvents)
            } catch (error) {
                console.error("Error loading events:", error)
            } finally {
                setLoading(false)
            }
        }
        loadEvents()
    }, [])

    // Filtering
    const filteredEvents = events.filter(event => {
        const search = searchQuery.toLowerCase()
        return (event.name || "").toLowerCase().includes(search) ||
            (event.location || "").toLowerCase().includes(search)
    })

    // GSAP Animation
    useGSAP(() => {
        if (loading || authLoading || !profile || events.length === 0 || animatedRef.current) return

        gsap.set('.categoria-card', { opacity: 1, y: 0 })
        gsap.from('.categoria-card', {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.2,
            onComplete: () => { animatedRef.current = true }
        })
    }, { scope: containerRef, dependencies: [loading, authLoading, profile, events.length] })

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            registro_abierto: "Registro Abierto",
            cerrado: "Cerrado",
            en_curso: "En Curso",
            finalizado: "Finalizado"
        }
        return labels[status] || status
    }

    const getStatusClass = (status: string) => {
        return (status || "desconocido").toLowerCase().replace('_', '-')
    }

    if (loading || authLoading || !profile) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <div className="dashboard-layout">
            {/* Navbar */}
            <DashboardNavbar />

            <main className="dashboard-main container" ref={containerRef}>
                {/* Hero Section */}
                <div className="eventos-hero">

                    <div className="eventos-hero-overlay"></div>
                    <div className="eventos-hero-content">
                        <h1 className="eventos-hero-title">Racing Cup TICs 2026</h1>
                        <p className="eventos-hero-subtitle">
                            Explora las categorías disponibles y registra a tu equipo en la competencia.
                        </p>
                    </div>
                </div>

                <div className="search-box-wrapper" style={{ marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', maxWidth: '500px' }}>
                        <svg style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            placeholder="Buscar categorías o eventos..."
                            className="form-input"
                            style={{ paddingLeft: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Section */}
                <section className="categorias-section">
                    <h2 className="section-title">Categorías y Torneos</h2>

                    <div className="categorias-list">
                        {filteredEvents.length === 0 ? (
                            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                                <p>No se encontraron eventos que coincidan con tu búsqueda.</p>
                            </div>
                        ) : (
                            filteredEvents.map(event => {
                                const eventDate = new Date(event.date)
                                return (
                                    <div key={event.id} className="categoria-card">
                                        {/* Date Badge */}
                                        <div className="categoria-date-badge">
                                            <span className="categoria-date-day">{eventDate.getDate()}</span>
                                            <span className="categoria-date-month">{eventDate.toLocaleString('es-MX', { month: 'short' })}</span>
                                        </div>

                                        {/* Category Info */}
                                        <div className="categoria-info">
                                            <span className={`categoria-status ${getStatusClass(event.status)}`}>
                                                {getStatusLabel(event.status)}
                                            </span>
                                            <h3 className="categoria-title">{event.name}</h3>
                                            <div className="categoria-meta">
                                                <span>📅 {eventDate.getDate()} {eventDate.toLocaleString('es-MX', { month: 'short' })} 2026</span>
                                                <span>📍 {event.location}</span>
                                            </div>
                                            <p className="categoria-desc">{event.description}</p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="categoria-action">
                                            <Link href={`/dashboard/eventos/${event.id}`} className="btn-ver-detalles">
                                                Ver Detalles
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    <polyline points="12 5 19 12 12 19"></polyline>
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}