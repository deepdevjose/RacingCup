import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './Hero.css'

/**
 * Hero - EXACT Vroomgame replica
 * Dark Navy background, center logo, badges
 */
function Hero({ event }) {
    const containerRef = useRef(null)
    const carRef = useRef(null)
    const badgeRef = useRef(null)

    useGSAP(() => {
        // Car entrance - Zoom in and slight rotation
        gsap.from(carRef.current, {
            scale: 0.5,
            opacity: 0,
            duration: 1.2,
            ease: "back.out(1.7)",
            y: 50
        })



        // Badge entrance - Spin in
        gsap.from(badgeRef.current, {
            scale: 0,
            rotation: -180,
            opacity: 0,
            duration: 1,
            delay: 1,
            ease: "elastic.out(1, 0.5)"
        })

    }, { scope: containerRef })

    return (
        <section className="hero" ref={containerRef}>

            <div className="hero-center">


                {/* Main Logo (User's Car) - Replacing the Vroom! text/logo */}
                <div className="hero-main-logo">
                    <img
                        ref={carRef}
                        src="/logohero.png"
                        alt="Racing Cup Hero Logo"
                        className="hero-car-img"
                    />
                </div>

            </div>

            {/* Bottom Left Badge - Website of the Day style */}
            <div className="hero-badge-left" ref={badgeRef}>
                <div className="badge-circle">
                    <svg viewBox="0 0 100 100" className="badge-text">
                        <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                        <text>
                            <textPath href="#curve" startOffset="0%">
                                4TO RACING CUP •
                            </textPath>
                        </text>
                    </svg>
                    <span className="badge-center">RC</span>
                </div>
            </div>

            {/* Bottom Right - Hand Pointing Down */}
            <div className="hero-hand-right">
                <img src="/manita.png" alt="Scroll Down" className="hand-icon-img" />
            </div>

        </section>
    )
}

export default Hero
