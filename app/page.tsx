'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/landing/Hero'
import Navbar from '@/components/common/Navbar'
import ModelPreloader from '@/components/common/ModelPreloader'
import Standings from '@/components/landing/Standings'
import BracketViewer from '@/components/landing/BracketViewer'
import TeamsList from '@/components/landing/TeamsList'
import Footer from '@/components/common/Footer'
import ScrollManager from '@/components/common/ScrollManager'
import TournamentSection from '@/components/landing/TournamentSection'
import CountdownSection from '@/components/landing/CountdownSection'
import VideoSection from '@/components/landing/VideoSection'
import NewsSection from '@/components/landing/NewsSection'
import CarouselSection from '@/components/landing/CarouselSection'
import '@/components/landing/LandingPage.css'
import { Event, Tab } from '@/types'

// Dynamic import for 3D section (client-side only)
const ThreeDSection = dynamic(() => import('@/components/landing/ThreeDSection'), {
    ssr: false,
})

/**
 * LandingPage - Main public event page
 */
export default function Home() {
    const [activeTab, setActiveTab] = useState<string>('standings')

    const event: Event = {
        id: 'racing-cup-5',
        name: '5ª Racing Cup',
        date: '15 de Marzo, 2026',
        status: 'registro_abierto',
        description: 'Torneo de eliminación directa con los mejores equipos de la región.'
    }

    const tabs: Tab[] = [
        { id: 'standings', label: 'Standings', icon: '🏆' },
        { id: 'bracket', label: 'Bracket', icon: '🎯' },
        { id: 'teams', label: 'Equipos', icon: '👥' },
        { id: 'rules', label: 'Reglas', icon: '📋' }
    ]

    return (
        <div className="landing-page">
            <ScrollManager />
            <ModelPreloader />
            <Navbar />

            <Hero event={event} />
            <CountdownSection />
            <TournamentSection />
            <VideoSection />
            <NewsSection />
            <CarouselSection />
            <ThreeDSection />


            <Footer />
        </div>
    )
}


