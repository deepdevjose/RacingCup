'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './VroomSection.css'

gsap.registerPlugin(ScrollTrigger)

export default function VroomSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        // Parallax effect for VROOM text
        gsap.to(textRef.current, {
            y: 100, // Move down as we scroll down
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        })

        // Ensure navbar handles this section correctly (if needed)
        // This section is Yellow, so Black navbar text is probably best?
        // Let's assume the previous Carousel section left it dark or removed it.
        // We'll enforce Dark Navbar here too just in case.
        ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 60px",
            end: "bottom top",
            onEnter: () => {
                document.querySelector(".navbar")?.classList.add("navbar-dark")
            },
            onEnterBack: () => {
                document.querySelector(".navbar")?.classList.add("navbar-dark")
            },
            onLeave: () => {
                // Next section might be footer or something dark, let's reset or keep based on next section
                // For now, remove to be safe so it reverts to white text
                document.querySelector(".navbar")?.classList.remove("navbar-dark")
            }
        })

    }, { scope: sectionRef })

    return (
        <section className="vroom-section" ref={sectionRef}>
            {/* Background Pattern */}
            <div className="vroom-pattern"></div>

            {/* Background Text */}
            <div className="vroom-text-container" ref={textRef}>
                <h1 className="vroom-title">RC!</h1>
            </div>

            {/* 3D Model Placeholder Container */}
            <div className="vroom-3d-container">
                {/* 3D Model will go here later */}
                <div className="placeholder-content">
                    {/* Empty or just a marker? Keeping it clean as requested */}
                </div>
            </div>
        </section>
    )
}
