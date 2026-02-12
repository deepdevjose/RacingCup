'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './dashboard.css'

import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
    const { profile, loading } = useAuth()
    const containerRef = useRef(null)

    // Use profile color or fallback to primary red
    const iconColor = profile?.playerColor || '#E32636'

    const userIcon = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    )

    useGSAP(() => {
        if (loading || !profile) return

        // Set initial state - elements are visible immediately
        gsap.set('.dashboard-hero', { opacity: 1, y: 0 })
        gsap.set('.nav-card', { opacity: 1, y: 0 })

        // Animate from slightly offset position
        gsap.from('.dashboard-hero', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
        gsap.from('.nav-card', {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 0.7,
            ease: 'back.out(1.2)',
            delay: 0.3
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
            {/* Navbar */}
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="../" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>

                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link active">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>

                    <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                        {userIcon}
                        <div className="pill-content">
                            <span className="pill-gamertag">{gamertag}</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                {/* Dashboard Home Hero */}
                <div className="dashboard-hero">
                    <div className="hero-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                        {profile?.isTeacher ? 'Docente' : 'Competidor'} Registrado
                    </div>
                    <h1 className="hero-title">
                        Bienvenido, <span>{gamertag.replace('#', '')}</span>
                    </h1>
                    <p className="hero-desc">
                        Panel de control de Racing Cup. Gestiona tus equipos, inscríbete a torneos y revisa tus estadísticas en tiempo real.
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

                {/* Navigation Cards Grid */}
                <div className="nav-grid">
                    {/* Eventos Card */}
                    <Link href="/dashboard/eventos" className="nav-card eventos">
                        <div className="nav-card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <h3 className="nav-card-title">Explorar Eventos</h3>
                        <p className="nav-card-desc">
                            Descubre los próximos torneos y competencias disponibles para tu categoría.
                        </p>
                        <span className="nav-card-link">
                            Ver eventos
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </span>
                    </Link>

                    {/* Equipos Card */}
                    <Link href="/dashboard/equipos" className="nav-card equipos">
                        <div className="nav-card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3 className="nav-card-title">Mis Equipos</h3>
                        <p className="nav-card-desc">
                            Gestiona los integrantes de tu equipo, visualiza invitaciones o únete a uno nuevo.
                        </p>
                        <span className="nav-card-link">
                            Gestionar equipos
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </span>
                    </Link>

                    {/* Perfil Card */}
                    <Link href="/dashboard/profile" className="nav-card profile">
                        <div className="nav-card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h3 className="nav-card-title">Mi Perfil</h3>
                        <p className="nav-card-desc">
                            Actualiza tus datos personales, personaliza tu avatar y revisa tus estadísticas.
                        </p>
                        <span className="nav-card-link">
                            Ir al perfil
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </span>
                    </Link>
                </div>
            </main>
        </div>
    )
}
