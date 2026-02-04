'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Navbar.css'

/**
 * Navbar - Vroomgame replica
 * Minimal, centered navigation, transparent background
 */
function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navRef = useRef<HTMLElement>(null)
    const bannerRef = useRef<HTMLDivElement>(null)
    const loginBtnRef = useRef<HTMLAnchorElement>(null) // Ref for login button

    useGSAP(() => {
        const banner = bannerRef.current
        const loginBtn = loginBtnRef.current
        if (!banner || !loginBtn) return

        // Initial state: hidden above viewport
        gsap.set(banner, { yPercent: -100 })

        ScrollTrigger.create({
            start: "top top",
            end: 99999,
            onUpdate: (self) => {
                // Show banner AND animate login button when scrolling UP (dir -1)
                if (self.direction === -1 && self.scroll() > 100) {
                    gsap.to(banner, { yPercent: 0, duration: 0.3, ease: "power2.out" })

                    // Pulse/Shake animation for login button to attract attention
                    gsap.to(loginBtn, {
                        scale: 1.2,
                        color: "#E32636",
                        duration: 0.3,
                        overwrite: true
                    })
                } else {
                    gsap.to(banner, { yPercent: -100, duration: 0.3, ease: "power2.in" })

                    // Reset login button
                    gsap.to(loginBtn, {
                        scale: 1,
                        color: "#000000", // Assuming default is black relative to container, or inherit
                        clearProps: "color", // Clear color to revert to CSS hover styles
                        duration: 0.3,
                        overwrite: true
                    })
                }
            }
        })
    }, { scope: navRef })

    return (
        <nav className="navbar" ref={navRef}>
            {/* Top Announcement Bar */}
            <div className="announcement-bar" ref={bannerRef}>
                <div className="bar-content">
                    <span>📢 Haz tu pre-registro, la entrada solo cuesta <strong>$50 pesitos</strong></span>
                    <span className="bar-arrow">⤵</span>
                </div>
            </div>

            <div className="navbar-container">
                {/* Left: V! Style Logo */}
                <Link href="/" className="navbar-brand">
                    <span className="brand-icon">RC!</span>
                </Link>

                {/* Mobile Toggle Button */}
                <button
                    className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                {/* Center: Main Navigation */}
                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>El torneo</Link></li>
                    <li><Link href="/news" className="nav-link" onClick={() => setIsMenuOpen(false)}>Racing Cars</Link></li>
                    <li><Link href="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Zumo RC</Link></li>
                </ul>

                {/* Right: Social & Login */}
                <div className="navbar-right">
                    {/* Facebook Icon */}
                    <a href="https://www.facebook.com/ITIC.ITSOEHmx" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>

                    {/* Login Icon */}
                    <Link href="/login" className="social-link login-btn" aria-label="Iniciar Sesión" ref={loginBtnRef}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
