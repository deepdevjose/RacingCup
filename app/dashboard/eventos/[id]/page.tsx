'use client'

import React, { useState, use } from 'react'
import Link from 'next/link'
import '../eventos.css'
import './evento-detail.css'

// Event data - in real app this would come from database
const eventosData: Record<string, EventoType> = {
    '1': {
        id: '1',
        title: 'Carrera RC - Velocidad',
        description: 'Demuestra la velocidad de tu prototipo en nuestro circuito profesional. Compite contra los mejores equipos de la región.',
        date: 'viernes, 13 de marzo de 2026',
        location: 'ITSOEH - Pista Principal',
        status: 'Registro Abierto',
        minIntegrantes: 2,
        maxIntegrantes: 4,
        formato: 'Clasificatorias, Eliminatorias',
        categorias: ['RC Car', 'RC Truck']
    },
    '2': {
        id: '2',
        title: 'Mini Sumo Autónomo',
        description: 'Estrategia y fuerza. Saca a tu oponente del dojo automáticamente. Robots autónomos que luchan por la supremacía.',
        date: 'viernes, 13 de marzo de 2026',
        location: 'ITSOEH - Arena 1',
        status: 'Cupo Limitado',
        minIntegrantes: 2,
        maxIntegrantes: 4,
        formato: 'Eliminatorias directas',
        categorias: ['Mini Sumo', 'Micro Sumo']
    },
    '3': {
        id: '3',
        title: 'Robo Fut',
        description: 'El clásico deporte en versión robótica. Equipos de 3 robots compiten en partidos emocionantes.',
        date: 'viernes, 13 de marzo de 2026',
        location: 'ITSOEH - Cancha B',
        status: 'Registro Abierto',
        minIntegrantes: 3,
        maxIntegrantes: 6,
        formato: 'Fase de grupos, Eliminatorias',
        categorias: ['Robo Fut']
    }
}

interface EventoType {
    id: string
    title: string
    description: string
    date: string
    location: string
    status: string
    minIntegrantes: number
    maxIntegrantes: number
    formato: string
    categorias: string[]
}

export default function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [activeTab, setActiveTab] = useState('detalles')
    const evento = eventosData[resolvedParams.id] || eventosData['1']

    const getStatusClass = (status: string) => {
        if (status.includes('Abierto')) return 'status-open'
        if (status.includes('Limitado')) return 'status-limited'
        return 'status-coming'
    }

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
                        <Link href="/dashboard/eventos" className="nav-link active">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>
                    <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div className="pill-content">
                            <span className="pill-gamertag">#JOSEPO23</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container">
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
                        {evento.title}
                        <span className={`evento-status-badge ${getStatusClass(evento.status)}`}>
                            {evento.status}
                        </span>
                    </h1>
                    <p className="evento-description">{evento.description}</p>
                    <div className="evento-meta">
                        <span className="meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {evento.date}
                        </span>
                        <span className="meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {evento.location}
                        </span>
                    </div>
                </div>

                {/* Participate Section */}
                <div className="participate-section">
                    <div className="participate-info">
                        <h3>Participa en este evento</h3>
                        <p>Crea un equipo o únete a uno existente con un código de invitación</p>
                    </div>
                    <div className="participate-actions">
                        <Link href={`/dashboard/eventos/${resolvedParams.id}/unirse`} className="btn-secondary">
                            Unirse con código
                        </Link>
                        <Link href={`/dashboard/eventos/${resolvedParams.id}/crear-equipo`} className="btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Crear equipo
                        </Link>
                    </div>
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
                            {/* Team Requirements */}
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
                                        Mínimo {evento.minIntegrantes} integrantes
                                    </li>
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Máximo {evento.maxIntegrantes} integrantes
                                    </li>
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Formato: {evento.formato}
                                    </li>
                                </ul>
                            </div>

                            {/* Categories */}
                            <div className="detail-card">
                                <h4 className="detail-card-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E32636" strokeWidth="2">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                    Categorías
                                </h4>
                                <div className="categories-tags">
                                    {evento.categorias.map((cat, i) => (
                                        <span key={i} className="category-tag">{cat}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'eliminatorias' && (
                    <div className="tab-content">
                        <div className="bracket-container">
                            {/* Left Side - Top 8 */}
                            <div className="bracket-side bracket-left">
                                {/* Octavos de Final - Left */}
                                <div className="bracket-round round-16">
                                    <div className="round-label">Octavos</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1">Equipo 1</div>
                                            <div className="team team-2">Equipo 2</div>
                                        </div>
                                        <div className="match">
                                            <div className="team team-1">Equipo 3</div>
                                            <div className="team team-2">Equipo 4</div>
                                        </div>
                                    </div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1">Equipo 5</div>
                                            <div className="team team-2">Equipo 6</div>
                                        </div>
                                        <div className="match">
                                            <div className="team team-1">Equipo 7</div>
                                            <div className="team team-2">Equipo 8</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuartos - Left */}
                                <div className="bracket-round round-8">
                                    <div className="round-label">Cuartos</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Semifinal - Left */}
                                <div className="bracket-round round-4">
                                    <div className="round-label">Semifinal</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Final */}
                            <div className="bracket-final">
                                <div className="final-trophy">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                </div>
                                <div className="round-label">Final</div>
                                <div className="match final-match">
                                    <div className="team team-1 empty">Semifinal 1</div>
                                    <div className="vs-badge">VS</div>
                                    <div className="team team-2 empty">Semifinal 2</div>
                                </div>
                                <div className="champion-slot">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    Campeón
                                </div>
                            </div>

                            {/* Right Side - Bottom 8 */}
                            <div className="bracket-side bracket-right">
                                {/* Semifinal - Right */}
                                <div className="bracket-round round-4">
                                    <div className="round-label">Semifinal</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuartos - Right */}
                                <div className="bracket-round round-8">
                                    <div className="round-label">Cuartos</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1 empty">Por definir</div>
                                            <div className="team team-2 empty">Por definir</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Octavos de Final - Right */}
                                <div className="bracket-round round-16">
                                    <div className="round-label">Octavos</div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1">Equipo 9</div>
                                            <div className="team team-2">Equipo 10</div>
                                        </div>
                                        <div className="match">
                                            <div className="team team-1">Equipo 11</div>
                                            <div className="team team-2">Equipo 12</div>
                                        </div>
                                    </div>
                                    <div className="match-group">
                                        <div className="match">
                                            <div className="team team-1">Equipo 13</div>
                                            <div className="team team-2">Equipo 14</div>
                                        </div>
                                        <div className="match">
                                            <div className="team team-1">Equipo 15</div>
                                            <div className="team team-2">Equipo 16</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tabla' && (
                    <div className="tab-content">
                        <div className="empty-state">
                            <p>La tabla de puntos se actualizará durante el evento.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'equipos' && (
                    <div className="tab-content">
                        {/* Team Cards Grid - Empty */}
                        <div className="equipos-grid">
                            {/* Teams will be populated here */}
                        </div>

                        {/* Empty State */}
                        <div className="empty-state">
                            <p>Aún no hay equipos registrados para este evento.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
