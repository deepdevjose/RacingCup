"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { PLAYER_ICONS } from '@/lib/firebase'
import { usePathname } from 'next/navigation'

export default function DashboardNavbar() {
    const { profile } = useAuth()
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // icons helper for profile - matching other pages
    const profileIcons = [
        <svg key="0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        <svg key="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
        <svg key="2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M14 12h4"></path><path d="M8 8v8"></path><path d="M16 8v8"></path></svg>,
        <svg key="3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
        <svg key="4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
    ]

    const getIconIdx = (iconStr: string | undefined) => {
        if (!iconStr) return 0
        const idx = PLAYER_ICONS.indexOf(iconStr as any)
        return idx !== -1 ? idx % 5 : 0
    }

    const isActive = (path: string) => pathname === path ? 'active' : ''

    const gamertag = profile?.gamertag || 'Usuario'
    const iconColor = profile?.playerColor || '#E32636'

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <nav className="dashboard-nav">
            <div className="container nav-content">
                <Link href="/dashboard" className="nav-logo">
                    <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                    <span>Racing Cup TICs</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="nav-links desktop-only">
                    <Link href="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Inicio</Link>
                    <Link href="/dashboard/eventos" className={`nav-link ${isActive('/dashboard/eventos')}`}>Eventos</Link>
                    <Link href="/dashboard/equipos" className={`nav-link ${isActive('/dashboard/equipos')}`}>Equipos</Link>
                    <Link href="/ayuda" className={`nav-link ${isActive('/ayuda')}`}>Ayuda</Link>
                </div>

                <div className="nav-right">
                    <Link href="/dashboard/profile" className="nav-user-pill desktop-only" style={{ textDecoration: 'none' }}>
                        <div style={{ color: iconColor, display: 'flex' }}>
                            {profileIcons[getIconIdx(profile?.playerIcon)]}
                        </div>
                        <div className="pill-content">
                            <span className="pill-gamertag">{gamertag}</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>

                    {/* Mobile Hamburger */}
                    <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMenuOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <Link href="/dashboard" className={`mobile-nav-link ${isActive('/dashboard')}`} onClick={toggleMenu}>
                        Inicio
                    </Link>
                    <Link href="/dashboard/eventos" className={`mobile-nav-link ${isActive('/dashboard/eventos')}`} onClick={toggleMenu}>
                        Eventos
                    </Link>
                    <Link href="/dashboard/equipos" className={`mobile-nav-link ${isActive('/dashboard/equipos')}`} onClick={toggleMenu}>
                        Equipos
                    </Link>
                    <Link href="/ayuda" className={`mobile-nav-link ${isActive('/ayuda')}`} onClick={toggleMenu}>
                        Ayuda
                    </Link>

                    <div className="mobile-menu-divider"></div>

                    <Link href="/dashboard/profile" className={`mobile-nav-link ${isActive('/dashboard/profile')}`} onClick={toggleMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ color: iconColor }}>{profileIcons[getIconIdx(profile?.playerIcon)]}</div>
                        <span>Mi Perfil ({gamertag})</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
