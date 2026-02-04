'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './VideoSection.css'

gsap.registerPlugin(ScrollTrigger)

export default function VideoSection() {
    const sectionRef = useRef<HTMLElement>(null)

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
    })

    return (
        <section className="video-section" ref={sectionRef}>
            <div className="video-container">
                <div className="video-wrapper">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/ocmONiVun9M?si=u0Z3p8R5x7v9yQ7z"
                        title="Racing Cup Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="video-frame"
                    ></iframe>
                </div>
                <div className="video-description">
                    <p>
                        El gameplay reveal de Racing Cup fue un gran éxito y captó la atención de varias marcas. El juego está siendo desarrollado por estudiantes visionarios y los planes futuros incluyen asociarse con estudios de desarrollo para hacer de Racing Cup un éxito total en su fecha de lanzamiento planeada.
                    </p>
                </div>
            </div>
        </section>
    )
}
