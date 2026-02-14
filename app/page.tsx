'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/landing/Hero'
import Navbar from '@/components/common/Navbar'
import ModelPreloader from '@/components/common/ModelPreloader'
import Footer from '@/components/common/Footer'
import ScrollManager from '@/components/common/ScrollManager'
// Dynamic imports for heavy sections to avoid "Unused CSS preload" warnings
import '@/components/landing/LandingPage.css'
import { Event } from '@/types'

const CountdownSection = dynamic(() => import('@/components/landing/CountdownSection'))
const TournamentSection = dynamic(() => import('@/components/landing/TournamentSection'))
const VideoSection = dynamic(() => import('@/components/landing/VideoSection'))
const NewsSection = dynamic(() => import('@/components/landing/NewsSection'))
const CarouselSection = dynamic(() => import('@/components/landing/CarouselSection'))
const ThreeDSection = dynamic(() => import('@/components/landing/ThreeDSection'), {
    ssr: false, // 3D canvas is client-only
})

/**
 * LandingPage - Main public event page
 */
export default function Home() {

    const event: Event = {
        id: 'racing-cup-5',
        name: '5ª Racing Cup',
        date: '15 de Marzo, 2026',
        status: 'registro_abierto',
        description: 'Torneo de eliminación directa con los mejores equipos de la región.'
    }

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


