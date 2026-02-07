'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './NewsSection.css'

gsap.registerPlugin(ScrollTrigger)

interface NewsItem {
    id: number
    title: string
    icon: string
    link: string
}

interface WeatherData {
    temperature: number
    weatherCode: number
}

const NEWS_ITEMS: NewsItem[] = [
    { id: 1, title: 'Racing Cars renovado!', icon: '🚗', link: '/racing-cars' },
    { id: 2, title: 'Nuevo modo Sumo RC!', icon: '🎮', link: '/sumo-rc' },
    { id: 3, title: 'Nuevo modo RoboFut!', icon: '⚽', link: '/robofut' },
    { id: 4, title: 'Torneo en directo en esta web!', icon: '🏆', link: '#' },
]

/**
 * Mixquiahuala de Juárez, Hidalgo, México
 * Coordenadas del centro municipal
 */
const MIXQUIAHUALA_LAT = 20.2303
const MIXQUIAHUALA_LON = -99.2140

/**
 * Get weather emoji based on WMO Weather Code
 * https://open-meteo.com/en/docs#weathervariables
 */
function getWeatherEmoji(code: number): string {
    // Clear sky
    if (code === 0) return '☀️'
    // Mainly clear, partly cloudy
    if (code === 1 || code === 2) return '🌤️'
    // Overcast
    if (code === 3) return '☁️'
    // Fog
    if (code === 45 || code === 48) return '🌫️'
    // Drizzle
    if (code >= 51 && code <= 57) return '🌧️'
    // Rain
    if (code >= 61 && code <= 67) return '🌧️'
    // Freezing rain
    if (code >= 66 && code <= 67) return '🌨️'
    // Snow
    if (code >= 71 && code <= 77) return '❄️'
    // Rain showers
    if (code >= 80 && code <= 82) return '🌦️'
    // Snow showers
    if (code >= 85 && code <= 86) return '🌨️'
    // Thunderstorm
    if (code >= 95 && code <= 99) return '⛈️'
    // Default
    return '🌡️'
}

/**
 * Get weather description based on temperature
 */
function getFeelsLikeEmoji(temp: number): string {
    if (temp <= 5) return '🥶' // Very cold
    if (temp <= 15) return '❄️' // Cold
    if (temp <= 22) return '😊' // Pleasant
    if (temp <= 28) return '☀️' // Warm
    if (temp <= 35) return '🥵' // Hot
    return '🔥' // Very hot
}

export default function NewsSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [formattedDate, setFormattedDate] = useState('')

    useEffect(() => {
        setFormattedDate(new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }))
    }, [])

    /**
     * Fetch weather data from Open-Meteo API with timeout and error handling
     */
    useEffect(() => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        async function fetchWeather() {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${MIXQUIAHUALA_LAT}&longitude=${MIXQUIAHUALA_LON}&current=temperature_2m,weather_code&timezone=America%2FMexico_City`,
                    { signal: controller.signal }
                )

                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`)
                }

                const data = await response.json()

                if (data.current) {
                    setWeather({
                        temperature: Math.round(data.current.temperature_2m),
                        weatherCode: data.current.weather_code
                    })
                    setError(false)
                }
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.warn('Weather API unavailable:', err.message)
                    setError(true)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()

        // Refresh weather every 15 minutes
        const interval = setInterval(() => {
            setLoading(true)
            fetchWeather()
        }, 15 * 60 * 1000)

        return () => {
            clearInterval(interval)
            controller.abort()
        }
    }, [])

    useGSAP(() => {
        const newsItems = gsap.utils.toArray('.news-item') as HTMLElement[]

        // Set initial state
        gsap.set(newsItems, {
            y: 60,
            opacity: 0
        })

        // Animate each item as it enters the viewport
        ScrollTrigger.batch(newsItems, {
            onEnter: (batch) => {
                gsap.to(batch, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out"
                })
            },
            start: "top 85%"
        })

        // Animate the texture overlay to fade in - synced with VideoSection description transition
        // Only create these animations if the video-description element exists
        const videoDescription = document.querySelector('.video-description')
        if (videoDescription) {
            gsap.to('.texture-overlay-news', {
                opacity: 1,
                scrollTrigger: {
                    trigger: videoDescription,
                    start: "top 70%",
                    end: "top 40%",
                    scrub: true
                }
            })

            // Animate text color from white to black - synced with background change
            gsap.to('.news-container', {
                color: '#000000',
                scrollTrigger: {
                    trigger: videoDescription,
                    start: "top 70%",
                    end: "top 40%",
                    scrub: true
                }
            })
        }

        const navbar = document.querySelector(".navbar")
        if (navbar) {
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top 80%",
                end: "bottom top",
                onEnter: () => {
                    gsap.to(navbar, { autoAlpha: 1, duration: 0.3, overwrite: true })
                    navbar.classList.add("navbar-dark")
                },
                onLeave: () => {
                    navbar.classList.remove("navbar-dark")
                },
                onEnterBack: () => {
                    gsap.to(navbar, { autoAlpha: 1, duration: 0.3, overwrite: true })
                    navbar.classList.add("navbar-dark")
                },
                onLeaveBack: () => {
                    navbar.classList.remove("navbar-dark")
                }
            })
        }

    }, { scope: sectionRef })

    return (
        <section className="news-section" ref={sectionRef}>
            <div className="texture-overlay-news"></div>

            <div className="news-container">
                <h2 className="news-title">Racing Cup News</h2>

                {/* Info Bar with Weather */}
                <div className="news-info-bar">
                    <span className="info-item">Hoy es: {formattedDate}</span>
                    <span className="info-separator">|</span>
                    <span className="info-item">
                        {loading ? '⏳ Cargando...' : error ? '🌡️ Clima no disponible' : weather ? (
                            <>Estamos a: {weather.temperature}°C {getWeatherEmoji(weather.weatherCode)}</>
                        ) : '🌡️ --°C'}
                    </span>
                    <span className="info-separator">|</span>
                    <span className="info-item">
                        {loading ? '⏳' : error ? '😊' : weather ? (
                            <>Se siente: {getFeelsLikeEmoji(weather.temperature)}</>
                        ) : 'Se siente: --'}
                    </span>
                </div>

                {/* News List */}
                <div className="news-list">
                    {NEWS_ITEMS.map((item) => (
                        <div key={item.id} className="news-item">
                            <div className="news-item-left">
                                <span className="news-icon">{item.icon}</span>
                                <span className="news-text">{item.title}</span>
                            </div>
                            <div className="news-item-right">
                                <Link href={item.link} className="eye-icon-link">
                                    <div className="eye-icon">
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
