'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '@/lib/auth-context'
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
    const router = useRouter()
    const { user } = useAuth()

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

    const handlePopClick = (e: React.MouseEvent, url: string, isExternal: boolean = false) => {
        e.preventDefault()
        const target = e.currentTarget as HTMLElement

        // Instantiate explosion
        const explosion = new ExplosiveButton(target)

        // Trigger explosion (visuals) - 400ms for better fluidity
        explosion.explode(400, () => {
            // Navigation happens after animation completes
            if (isExternal) {
                window.open(url, '_blank')
                // Reset target visibility after a short delay
                setTimeout(() => {
                    target.classList.remove('exploding')
                }, 500)
            } else {
                router.push(url)
            }
        })
    }

    return (
        <nav className="navbar" ref={navRef}>
            {/* Top Announcement Bar */}
            <div className="announcement-bar" ref={bannerRef}>
                <div className="bar-content">
                    <span>📢 Haz tu pre-registro, la entrada solo cuesta <strong>$100 pesitos</strong></span>
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
                    <li><Link href="/racing-cars" className="nav-link" onClick={() => setIsMenuOpen(false)}>Racing Cars</Link></li>
                    <li><Link href="/sumo-rc" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sumo RC</Link></li>
                    <li><Link href="/robofut" className="nav-link" onClick={() => setIsMenuOpen(false)}>RoboFut</Link></li>
                    <li><Link href="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>Acerca de</Link></li>
                </ul>

                {/* Right: Social & Login */}
                <div className="navbar-right">
                    {/* Facebook Icon */}
                    <a
                        href="https://www.facebook.com/ITIC.ITSOEHmx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link facebook-link"
                        aria-label="Facebook"
                        onClick={(e) => handlePopClick(e, "https://www.facebook.com/ITIC.ITSOEHmx", true)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>

                    {/* Login Icon */}
                    <Link
                        href={user ? "/dashboard" : "/login"}
                        className="social-link login-btn"
                        aria-label={user ? "Mi Dashboard" : "Iniciar Sesión"}
                        ref={loginBtnRef}
                        onClick={(e) => handlePopClick(e, user ? "/dashboard" : "/login", false)}
                    >
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

// --- Explosive Animation Classes (Adapted from jkantner's CodePen) ---

// Helpers
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min
const randomInt = (min: number, max: number) => Math.round(Math.random() * (max - min)) + min
const calcAngle = (x1: number, y1: number, x2: number, y2: number) => {
    let opposite = y2 - y1,
        adjacent = x2 - x1,
        angle = Math.atan(opposite / adjacent)

    if (adjacent < 0) angle += Math.PI
    if (isNaN(angle)) angle = 0
    return angle
}
// Simplified pxToEm: assuming 16px base, returning clean number values 
// (or we can just work in pixels directly to simplify, let's allow 'em' usage for fidelity)
const pxToEm = (px: number) => px / 16

class ExplosiveButton {
    element: HTMLElement
    width: number = 0
    height: number = 0
    centerX: number = 0
    centerY: number = 0
    pieceWidth: number = 0
    pieceHeight: number = 0
    piecesX: number = 9
    piecesY: number = 4

    constructor(el: HTMLElement) {
        this.element = el
        this.updateDimensions()
    }

    updateDimensions() {
        this.width = pxToEm(this.element.offsetWidth)
        this.height = pxToEm(this.element.offsetHeight)
        this.centerX = this.width / 2
        this.centerY = this.height / 2
        this.pieceWidth = this.width / this.piecesX
        this.pieceHeight = this.height / this.piecesY
    }

    explode(duration: number, onComplete: () => void) {
        const explodingState = "exploding"

        if (!this.element.classList.contains(explodingState)) {
            this.element.classList.add(explodingState)

            this.createParticles("fire", 25, duration)
            this.createParticles("debris", this.piecesX * this.piecesY, duration)

            // Invoke callback after duration
            setTimeout(onComplete, duration)
        }
    }

    createParticles(kind: string, count: number, duration: number) {
        for (let c = 0; c < count; ++c) {
            let r = randomFloat(0.25, 0.5),
                diam = r * 2,
                xBound = this.centerX - r,
                yBound = this.centerY - r,
                easing = "cubic-bezier(0.15,0.5,0.5,0.85)"

            if (kind === "fire") {
                let x = this.centerX + randomFloat(-xBound, xBound),
                    y = this.centerY + randomFloat(-yBound, yBound),
                    a = calcAngle(this.centerX, this.centerY, x, y),
                    dist = randomFloat(1, 5)

                new FireParticle(this.element, x, y, diam, diam, a, dist, duration, easing)

            } else if (kind === "debris") {
                let x = (this.pieceWidth / 2) + this.pieceWidth * (c % this.piecesX),
                    y = (this.pieceHeight / 2) + this.pieceHeight * Math.floor(c / this.piecesX),
                    a = calcAngle(this.centerX, this.centerY, x, y),
                    dist = randomFloat(4, 7)

                new DebrisParticle(this.element, x, y, this.pieceWidth, this.pieceHeight, a, dist, duration, easing)
            }
        }
    }
}

class Particle {
    div: HTMLDivElement
    s: { x: number, y: number }
    d: { x: number, y: number }

    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number = 1, className2: string = "") {
        let width = `${w}em`,
            height = `${h}em`,
            adjustedAngle = angle + Math.PI / 2

        this.div = document.createElement("div")
        this.div.className = "particle"

        if (className2)
            this.div.classList.add(className2)

        this.div.style.width = width
        this.div.style.height = height

        parent.appendChild(this.div)

        this.s = {
            x: x - w / 2,
            y: y - h / 2
        }
        this.d = {
            x: this.s.x + Math.sin(adjustedAngle) * distance,
            y: this.s.y - Math.cos(adjustedAngle) * distance
        }
    }

    runSequence(el: HTMLElement, keyframesArray: Keyframe[], duration: number = 1e3, easing: string = "linear", delay: number = 0) {
        let animation = el.animate(keyframesArray, {
            duration: duration,
            easing: easing,
            delay: delay
        })
        animation.onfinish = () => {
            // Remove particle
            el.remove()
        }
    }
}

class DebrisParticle extends Particle {
    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
        super(parent, x, y, w, h, angle, distance, "particle--debris")

        let maxAngle = 1080,
            rotX = randomInt(0, maxAngle),
            rotY = randomInt(0, maxAngle),
            rotZ = randomInt(0, maxAngle)

        this.runSequence(this.div, [
            {
                opacity: 1,
                transform: `translate(${this.s.x}em,${this.s.y}em) rotateX(0) rotateY(0) rotateZ(0)`
            },
            { opacity: 1 },
            { opacity: 1 },
            { opacity: 1 },
            {
                opacity: 0,
                transform: `translate(${this.d.x}em,${this.d.y}em) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`
            }
        ], randomInt(duration / 2, duration), easing)
    }
}

class FireParticle extends Particle {
    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
        super(parent, x, y, w, h, angle, distance, "particle--fire")

        let sx = this.s.x,
            sy = this.s.y,
            dx = this.d.x,
            dy = this.d.y

        this.runSequence(this.div, [
            {
                background: "hsl(60,100%,100%)",
                transform: `translate(${sx}em,${sy}em) scale(1)`
            },
            {
                background: "hsl(60,100%,80%)",
                transform: `translate(${sx + (dx - sx) * 0.25}em,${sy + (dy - sy) * 0.25}em) scale(4)`
            },
            {
                background: "hsl(40,100%,60%)",
                transform: `translate(${sx + (dx - sx) * 0.5}em,${sy + (dy - sy) * 0.5}em) scale(7)`
            },
            {
                background: "hsl(20,100%,40%)"
            },
            {
                background: "hsl(0,0%,20%)",
                transform: `translate(${dx}em,${dy}em) scale(0)`
            }
        ], randomInt(duration / 2, duration), easing)
    }
}

export default Navbar
