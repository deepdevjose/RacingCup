'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css'
import './equipos.css'

export default function TeamsPage() {
    const containerRef = useRef(null)
    const [profile] = React.useState({
        gamertag: '#JOSEPO23',
        avatarId: 0
    })

    const userIcon = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    )

    useGSAP(() => {
        gsap.from('.stat-card', {
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        })

        gsap.from('.team-row', {
            x: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            delay: 0.4,
            ease: 'power2.out'
        })
    }, { scope: containerRef })

    return (
        <div className="dashboard-layout">
            {/* Navbar */}
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

                    <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                        {userIcon}
                        <div className="pill-content">
                            <span className="pill-gamertag">{profile.gamertag}</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                <header className="page-header flex-between">
                    <div>
                        <h1 className="page-title">Equipos Participantes</h1>
                        <p className="page-subtitle">Conoce a los equipos que competirán en el torneo</p>
                    </div>
                </header>

                {/* KPI Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Equipos Registrados</span>
                    </div>
                    <div className="stat-card success">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Confirmados</span>
                    </div>
                    <div className="stat-card warning">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Pendiente</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Participantes</span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="equipos-filters">
                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" placeholder="Buscar equipos..." className="search-input" />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option>Todos los eventos</option>
                            <option>Carrera RC</option>
                            <option>Mini Sumo</option>
                            <option>Robo Fut</option>
                        </select>
                        <select className="filter-select">
                            <option>Todos los estados</option>
                            <option>Confirmado</option>
                            <option>Pendiente</option>
                        </select>
                    </div>
                </div>

                {/* Teams List */}
                <div className="teams-list">
                    <div className="teams-header-row">
                        <span>Nombre del Equipo</span>
                        <span>Categoría</span>
                        <span>Integrantes</span>
                        <span>Estatus</span>
                    </div>

                    {/* Empty State - will be populated with real data */}
                    <div className="empty-state">
                        <p>Aún no hay equipos registrados.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
