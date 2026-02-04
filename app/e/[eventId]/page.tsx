'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Hero from '@/components/landing/Hero'
import Navbar from '@/components/common/Navbar'
import Standings from '@/components/landing/Standings'
import BracketViewer from '@/components/landing/BracketViewer'
import TeamsList from '@/components/landing/TeamsList'
import Footer from '@/components/common/Footer'
import ScrollManager from '@/components/common/ScrollManager'
import '@/components/landing/LandingPage.css'
import { Event, Tab } from '@/types'

/**
 * EventPage - Dynamic event page
 * Route: /e/[eventId]
 */
export default function EventPage() {
    const params = useParams<{ eventId: string }>()
    const { eventId } = params
    const [activeTab, setActiveTab] = useState<string>('standings')

    const event: Event = {
        id: eventId,
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
            <Navbar />

            <Hero event={event} />

            <section className="section section-secondary">
                <div className="container">
                    <nav className="tabs-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="tab-content">
                        {activeTab === 'standings' && <Standings eventId={event.id} />}
                        {activeTab === 'bracket' && <BracketViewer eventId={event.id} />}
                        {activeTab === 'teams' && <TeamsList eventId={event.id} />}
                        {activeTab === 'rules' && (
                            <div className="rules-content card">
                                <h3 className="section-title">Reglas del Torneo</h3>
                                <ul className="rules-list">
                                    <li>Eliminación directa (single elimination)</li>
                                    <li>Equipos de 2-4 jugadores</li>
                                    <li>Un usuario solo puede estar en un equipo por evento</li>
                                    <li>Resultados confirmados por staff oficial</li>
                                    <li>Certificados emitidos al finalizar el evento</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
