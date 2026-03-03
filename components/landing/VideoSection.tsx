'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './VideoSection.css'

gsap.registerPlugin(ScrollTrigger)

export default function VideoSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!video.src) {
                        video.src = "/videos/racingcup.mp4"
                    }
                    video.play().catch(() => { })
                } else {
                    video.pause()
                }
            })
        }, { rootMargin: '400px' })

        observer.observe(video)

        return () => observer.disconnect()
    }, [])

    useGSAP(() => {
        const videoSection = sectionRef.current
        const tournamentSection = document.querySelector(".tournament-section")

        if (!videoSection || !tournamentSection) return

        // Change background of BOTH sections to black when video comes into view
        gsap.to([tournamentSection, videoSection], {
            backgroundColor: "#000000",
            scrollTrigger: {
                trigger: videoSection,
                start: "top 80%",
                end: "top 30%",
                scrub: 1,
            }
        })

        // Hide Navbar when entering Video Section, show when reaching description
        const videoDescription = document.querySelector(".video-description")
        const navbar = document.querySelector(".navbar")

        if (videoDescription && navbar) {
            ScrollTrigger.create({
                trigger: videoSection,
                start: "top 10%", // Hide slightly after entering
                endTrigger: ".video-description",
                end: "top 40%", // Match the background/text transition point
                onEnter: () => gsap.to(navbar, { autoAlpha: 0, duration: 0.3, overwrite: true }),

                // When reaching description (leaving the 'hidden' zone): Show + Dark Mode
                onLeave: () => {
                    gsap.to(navbar, { autoAlpha: 1, duration: 0.3, overwrite: true })
                    navbar.classList.add("navbar-dark")
                },

                // When scrolling back up into video: Hide + Remove Dark Mode
                onEnterBack: () => {
                    gsap.to(navbar, { autoAlpha: 0, duration: 0.3, overwrite: true })
                    navbar.classList.remove("navbar-dark")
                },

                // When scrolling all the way up out of video: Show (default)
                onLeaveBack: () => {
                    gsap.to(navbar, { autoAlpha: 1, duration: 0.3, overwrite: true })
                },
            })
        }

        // TEXTURE & TEXT COLOR TRANSITION
        // When description comes into view, fade in texture overlay and change text color
        const descText = document.querySelector(".video-description p")
        const texture = document.querySelector(".texture-overlay")

        if (descText && texture) {
            gsap.to(texture, {
                opacity: 1,
                scrollTrigger: {
                    trigger: ".video-description",
                    start: "top 70%", // Start earlier
                    end: "top 40%",
                    scrub: true
                }
            })

            gsap.to(descText, {
                color: "#1a1a1a", // Dark grey/black for readability
                fontWeight: 500, // Make it a bit bolder if needed
                scrollTrigger: {
                    trigger: ".video-description",
                    start: "top 70%",
                    end: "top 40%",
                    scrub: true
                }
            })
        }

    })

    return (
        <section className="video-section" ref={sectionRef}>
            <div className="texture-overlay"></div>
            <div className="video-container">
                <div className="video-wrapper">
                    <video
                        ref={videoRef}
                        width="100%"
                        height="100%"
                        title="Racing Cup Video"
                        controls
                        loop
                        muted
                        playsInline
                        preload="none"
                        className="video-frame"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="video-description">
                    <p>
                        La pista está lista.
                        Los robots esperan.
                        El desafío comienza.

                        El 4to Racing Cup TIC’s es el punto de encuentro para quienes transforman la tecnología en acción. Vive la adrenalina del Racing y la intensidad del Zumo en un solo evento.
                    </p>
                </div>
            </div>
        </section>
    )
}
