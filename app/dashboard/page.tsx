'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './dashboard.css'

import { useAuth } from '@/lib/auth-context'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'
import EventWidget from '@/components/dashboard/EventWidget'
import TeamsWidget from '@/components/dashboard/TeamsWidget'

export default function DashboardPage() {
    const { profile, loading } = useAuth()
    const containerRef = useRef(null)

    // Use profile color or fallback to primary red
    const iconColor = profile?.playerColor || '#E32636'

    useGSAP(() => {
        if (loading || !profile) return

        // Set initial state
        gsap.set('.dashboard-hero', { opacity: 0, y: 20 })
        gsap.set('.dashboard-widget', { opacity: 0, y: 30 })
        gsap.set('.quick-action-card', { opacity: 0, y: 20 })

        // Animate Hero
        gsap.to('.dashboard-hero', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        })

        // Animate Widgets
        gsap.to('.dashboard-widget', {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.2
        })

        // Animate Quick Actions
        gsap.to('.quick-action-card', {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.2)',
            delay: 0.6
        })

    }, { scope: containerRef, dependencies: [loading, profile] })

    if (loading) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#E32636',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Cargando panel...</p>
                </div>
            </div>
        )
    }

    const gamertag = profile?.gamertag || 'Usuario'

    return (
        <div className="dashboard-layout">
            <DashboardNavbar />

            <main className="dashboard-main container" ref={containerRef}>
                {/* Dashboard Home Hero (Refined) */}
                <div className="dashboard-hero compact">
                    <div className="hero-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                        {profile?.isTeacher ? 'Docente' : 'Competidor'} Registrado
                    </div>
                    <h1 className="hero-title">
                        Hola, <span>{gamertag.replace('#', '')}</span>
                    </h1>
                    <p className="hero-desc">
                        Aquí tienes el resumen de tu actividad reciente y próximos eventos.
                    </p>

                    {/* Decorative icon */}
                    <div className="hero-icon-large">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                            <path d="M4 22h16"></path>
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Main Widgets Section */}
                <div className="dashboard-widgets-section">
                    <EventWidget />
                    <TeamsWidget />
                </div>

                {/* Quick Actions Grid */}
                <h3 style={{ fontFamily: 'Racing Sans One', fontSize: '1.25rem', marginBottom: '1.5rem', marginTop: '3rem', textTransform: 'uppercase' }}>Accesos Directos</h3>
                <div className="quick-actions-grid">
                    <Link href="/dashboard/eventos" className="quick-action-card">
                        <div className="quick-action-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div className="quick-action-info">
                            <h4>Explorar Eventos</h4>
                            <p>Busca torneos activos</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/eventos/dNa2TptMBEaGHRRsGx5V" className="quick-action-card">
                        <div className="quick-action-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="quick-action-info">
                            <h4>Crear Equipo</h4>
                            <p>Registra un nuevo equipo</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/profile" className="quick-action-card">
                        <div className="quick-action-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div className="quick-action-info">
                            <h4>Mi Perfil</h4>
                            <p>Edita tus datos</p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    )
}

