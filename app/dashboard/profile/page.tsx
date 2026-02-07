'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css' // Adjusted import path

export default function ProfilePage() {
    const containerRef = useRef(null)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [profile, setProfile] = React.useState({
        name: 'Josepo',
        school: 'ITSOEH',
        gamertag: '#JOSEPO23',
        avatarId: 0
    })

    // Tab State
    const [activeTab, setActiveTab] = React.useState('teams')

    // Mock Data (Empty for now to avoid false info)
    const notifications: { id: string; title: string; time: string; icon: string }[] = []
    const invitations: { id: string; teamName: string; inviter: string; role: string }[] = []

    // Temporary state for the modal form
    const [editForm, setEditForm] = React.useState(profile)

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

        tl.from('.profile-header-card', { y: 20, opacity: 0, duration: 0.6 })
            .from('.info-card', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
            .from('.dashboard-tabs', { y: 10, opacity: 0, duration: 0.4 }, '-=0.2')
            .from('.content-area-block', { y: 10, opacity: 0, duration: 0.5 }, '-=0.2')

    }, { scope: containerRef })

    const handleEditOpen = () => {
        setEditForm(profile)
        setIsEditModalOpen(true)
    }

    const handleSave = () => {
        setProfile(editForm)
        setIsEditModalOpen(false)
    }

    // Icon SVG components for the grid
    const icons = [
        <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
        <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M14 12h4"></path><path d="M8 8v8"></path><path d="M16 8v8"></path></svg>,
        <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
        <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>,
        <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>,
        <svg key="6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
        <svg key="7" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>,
        <svg key="8" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        <svg key="9" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'teams':
                return (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3 className="empty-title">No tienes equipos</h3>
                        <p className="empty-subtitle">Unete a un evento para crear o unirte a un equipo</p>
                        <Link href="/dashboard/eventos" className="btn btn-primary">
                            + Ver eventos disponibles
                        </Link>
                    </div>
                )
            case 'notifications':
                return (
                    <div className="list-container">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notif-icon-box" style={{ color: notif.icon === 'check' ? '#10B981' : '#3B82F6' }}>
                                        {notif.icon === 'check' ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        )}
                                    </div>
                                    <div className="notif-content">
                                        <p className="notif-title">{notif.title}</p>
                                        <p className="notif-time">{notif.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-subtitle">No tienes notificaciones nuevas</p>
                        )}
                    </div>
                )
            case 'invitations':
                return (
                    <div className="list-container">
                        {invitations.length > 0 ? (
                            invitations.map(invite => (
                                <div key={invite.id} className="invitation-item">
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className="notif-icon-box" style={{ color: '#F59E0B' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                        </div>
                                        <div>
                                            <p className="notif-title">Invitación a <strong>{invite.teamName}</strong></p>
                                            <p className="notif-time">De: {invite.inviter} • Rol: {invite.role}</p>
                                        </div>
                                    </div>
                                    <div className="invite-actions">
                                        <button className="btn-sm btn-accept">Aceptar</button>
                                        <button className="btn-sm btn-decline">Rechazar</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-subtitle">No tienes invitaciones pendientes</p>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="dashboard-layout">
            {/* Extended Navbar */}
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="/dashboard" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>

                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>

                    <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                        {icons[0]}
                        <div className="pill-content">
                            <span className="pill-gamertag">{profile.gamertag}</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-banner"></div>
                    <div className="profile-info-row">
                        <div className="profile-identity">
                            <div className="profile-avatar">
                                {icons[profile.avatarId]}
                            </div>
                            <div className="profile-texts">
                                <div className="profile-name-row">
                                    <h1 className="profile-name">{profile.name}</h1>
                                </div>
                                <p className="profile-gamertag">{profile.gamertag}</p>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="btn-icon-text" onClick={handleEditOpen}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Editar
                            </button>
                            <Link href="/login" className="btn-icon-text" style={{ textDecoration: 'none' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Salir
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="info-grid">
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div>
                            <p className="info-label">Email</p>
                            <p className="info-value">230110688@itsoeh.edu.mx</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M13 10v11M17 10v11M9 10v11"></path>
                        </svg>
                        <div>
                            <p className="info-label">Escuela</p>
                            <p className="info-value">{profile.school}</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6"></path>
                        </svg>
                        <div>
                            <p className="info-label">Gamertag</p>
                            <p className="info-value">{profile.gamertag}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-bar dashboard-tabs">
                    <button
                        className={`tab-item ${activeTab === 'teams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Mis equipos
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Notificaciones
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'invitations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invitations')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Invitaciones
                    </button>
                </div>

                {/* Content Area */}
                <div className="content-area-block">
                    {renderContent()}
                </div>

            </main>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Editar perfil</h3>
                                <p className="modal-desc">Actualiza tu información personal</p>
                            </div>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Escuela</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.school}
                                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Icono de jugador</label>
                            <div className="avatar-grid">
                                {icons.map((icon, index) => (
                                    <div
                                        key={index}
                                        className={`avatar-option ${editForm.avatarId === index ? 'selected' : ''}`}
                                        onClick={() => setEditForm({ ...editForm, avatarId: index })}
                                    >
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setIsEditModalOpen(false)}
                                style={{ border: 'none', color: '#ccc' }}
                            >
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
