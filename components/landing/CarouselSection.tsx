'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './CarouselSection.css'

gsap.registerPlugin(ScrollTrigger)

const IMAGES = [
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264062/20250305_112740_p5qv02.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264060/20250305_113005_dzcp22.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264057/20250305_121746_f2t1fo.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264054/20250305_130510_ebrv1m.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264058/IMG_0850_jtqmvh.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264055/IMG_0856_dsgj77.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264047/WhatsApp_Image_2025-03-05_at_20.44.34_2_vf6px5.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264041/WhatsApp_Image_2025-03-05_at_20.44.34_6_v3rhkg.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264049/WhatsApp_Image_2025-03-05_at_20.44.34_exryyz.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264047/WhatsApp_Image_2025-03-05_at_20.44.35_1_rhbq0u.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264051/WhatsApp_Image_2025-03-05_at_20.44.35_2_z0buyt.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264043/WhatsApp_Image_2025-03-05_at_20.44.35_3_zweajg.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264046/WhatsApp_Image_2025-03-05_at_20.44.36_1_aa7ijf.jpg",
    "https://res.cloudinary.com/dk6fga5vq/image/upload/h_400,q_auto,fl_preserve_transparency/v1770264048/WhatsApp_Image_2025-03-05_at_20.44.36_5_nlx1av.jpg",
]

export default function CarouselSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)



    useGSAP(() => {
        const track = trackRef.current
        if (!track) return

        // 1. Initial fade in of the section
        gsap.from(sectionRef.current, {
            autoAlpha: 0,
            duration: 1,
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
            }
        })

        // 2. Infinite Marquee Animation
        // Duplicate content is handled in JSX for seamless loop
        const totalWidth = track.scrollWidth / 2 // Since we doubled it

        gsap.to(track, {
            x: -totalWidth,
            ease: "none",
            duration: 40, // Slow speed (adjust as needed)
            repeat: -1,
        })

    }, { scope: sectionRef })

    return (
        <section className="carousel-section" ref={sectionRef}>
            <div className="carousel-wrapper">
                <div className="carousel-track" ref={trackRef}>
                    {/* Render Loop 1 */}
                    {IMAGES.map((src, i) => (
                        <div key={`img-1-${i}`} className="carousel-item">
                            <img src={src} alt={`Racing Cup Gallery ${i}`} loading="lazy" decoding="async" />
                        </div>
                    ))}
                    {/* Render Loop 2 (Duplicate for Seamless Infinite Scroll) */}
                    {IMAGES.map((src, i) => (
                        <div key={`img-2-${i}`} className="carousel-item">
                            <img src={src} alt={`Racing Cup Gallery ${i}`} loading="lazy" decoding="async" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Optional Overlay Gradient for fade edges */}
            <div className="carousel-overlay"></div>
        </section>
    )
}
