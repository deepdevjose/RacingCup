'use client'

import React, { useState, use } from 'react'
import Link from 'next/link'
import '../../../dashboard.css'
import '../../eventos.css'
import '../evento-detail.css'
import './crear-equipo.css'

// Available team icons
const teamIcons = [
    { id: 'robot', path: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z' },
    { id: 'cpu', path: 'M18 4h-2V2h-2v2h-4V2H8v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 18H6v-3h3v3zm0-5H6v-3h3v3zm0-5H6V6h3v2zm5 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v2zm4 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v2z' },
    { id: 'bolt', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { id: 'eye-off', path: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22' },
    { id: 'target', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { id: 'shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: 'flame', path: 'M12 22c4-2 8-6 8-12 0-2-2-4-4-4s-4 2-4 4c0-4-4-8-8-8 0 8 4 14 8 20z' },
    { id: 'star', path: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' },
    { id: 'crosshair', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM22 12h-4M6 12H2M12 6V2M12 22v-4' },
    { id: 'settings', path: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
    { id: 'image', path: 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z' },
    { id: 'anchor', path: 'M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 8v14M5 12H2a10 10 0 0 0 20 0h-3' },
    { id: 'rocket', path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' },
    { id: 'hand', path: 'M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15' },
    { id: 'compass', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z' },
    { id: 'radio', path: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14' },
    { id: 'cog', path: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' },
    { id: 'circle', path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
    { id: 'eye', path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
    { id: 'monitor', path: 'M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 21h8M12 17v4' }
]

// Available team colors
const teamColors = [
    { id: 'red', hex: '#E32636' },
    { id: 'blue', hex: '#3B82F6' },
    { id: 'green', hex: '#10B981' },
    { id: 'yellow', hex: '#F59E0B' },
    { id: 'purple', hex: '#8B5CF6' },
    { id: 'cyan', hex: '#06B6D4' }
]

export default function CrearEquipoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [teamName, setTeamName] = useState('')
    const [selectedIcon, setSelectedIcon] = useState('robot')
    const [selectedColor, setSelectedColor] = useState('red')
    const [selectedLevel, setSelectedLevel] = useState<'Media Superior' | 'Superior'>('Media Superior')

    const handleCrearEquipo = () => {
        if (teamName.trim()) {
            alert(`Equipo "${teamName}" creado con:
            - Nivel: ${selectedLevel}
            - Icono: ${selectedIcon}
            - Color: ${selectedColor}`)
            // In real app, this would create the team
        }
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
                <Link href={`/dashboard/eventos/${resolvedParams.id}`} className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver al evento
                </Link>

                {/* Create Team Form */}
                <div className="crear-equipo-container">
                    {/* Team Icon */}
                    <div className="crear-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>

                    <h1 className="crear-title">Crear equipo</h1>
                    <p className="crear-subtitle">
                        Crea tu equipo para participar en Racing Cup TIcs 2026
                    </p>

                    {/* Team Name Input */}
                    <div className="form-group">
                        <label className="input-label">Nombre del equipo</label>
                        <input
                            type="text"
                            className="team-name-input"
                            placeholder="Nombre de tu equipo"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                    </div>

                    {/* Icon Selector */}
                    <div className="form-group">
                        <label className="input-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="9" cy="9" r="2"></circle>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                            </svg>
                            Icono del equipo
                        </label>
                        <div className="icon-grid">
                            {teamIcons.map((icon) => (
                                <button
                                    key={icon.id}
                                    className={`icon-option ${selectedIcon === icon.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon(icon.id)}
                                    style={{ borderColor: selectedIcon === icon.id ? teamColors.find(c => c.id === selectedColor)?.hex : undefined }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d={icon.path}></path>
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selector */}
                    <div className="form-group">
                        <label className="input-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 2a10 10 0 0 0 0 20"></path>
                            </svg>
                            Color del equipo
                        </label>
                        <div className="color-grid">
                            {teamColors.map((color) => (
                                <button
                                    key={color.id}
                                    className={`color-option ${selectedColor === color.id ? 'selected' : ''}`}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => setSelectedColor(color.id)}
                                >
                                    {selectedColor === color.id && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level Selector */}
                    <div className="form-group">
                        <label className="input-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                            Nivel Educativo
                        </label>
                        <div className="level-grid">
                            <button
                                className={`level-option ${selectedLevel === 'Media Superior' ? 'selected' : ''}`}
                                onClick={() => setSelectedLevel('Media Superior')}
                            >
                                <div className="level-icon">🎓</div>
                                <div className="level-info">
                                    <span className="level-title">Media Superior</span>
                                    <span className="level-desc">Bachillerato / Preparatoria</span>
                                </div>
                                {selectedLevel === 'Media Superior' && (
                                    <div className="level-check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </button>

                            <button
                                className={`level-option ${selectedLevel === 'Superior' ? 'selected' : ''}`}
                                onClick={() => setSelectedLevel('Superior')}
                            >
                                <div className="level-icon">🏛️</div>
                                <div className="level-info">
                                    <span className="level-title">Superior</span>
                                    <span className="level-desc">Universidad / Tecnológico</span>
                                </div>
                                {selectedLevel === 'Superior' && (
                                    <div className="level-check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        className="btn-crear-equipo"
                        onClick={handleCrearEquipo}
                        disabled={!teamName.trim()}
                    >
                        Crear equipo
                    </button>
                </div>
            </main>
        </div>
    )
}
