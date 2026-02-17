"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getActiveEvents, type Event } from '@/lib/firebase'

export default function EventWidget() {
    const [nextEvent, setNextEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const events = await getActiveEvents()
                // Find nearest future event
                const now = new Date()
                const upcoming = events
                    .filter(e => e.date && new Date(e.date) >= now)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                if (upcoming.length > 0) {
                    setNextEvent(upcoming[0])
                }
            } catch (error) {
                console.error("Error loading next event:", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="widget-skeleton"></div>

    return (
        <div className="dashboard-widget event-widget">
            <div className="widget-header">
                <h3 className="widget-title">Próximo Evento</h3>
                <Link href="/dashboard/eventos" className="widget-link">Ver todos</Link>
            </div>

            {nextEvent ? (
                <div className="next-event-card">
                    <div className="event-date-box">
                        <span className="day">{new Date(nextEvent.date).getDate()}</span>
                        <span className="month">{new Date(nextEvent.date).toLocaleString('es-MX', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div className="event-info">
                        <h4 className="event-name">{nextEvent.name}</h4>
                        <div className="event-meta">
                            <span className="location">📍 {nextEvent.location}</span>
                            <span className={`status-badge ${nextEvent.status}`}>
                                {nextEvent.status === 'registro_abierto' ? 'Registro Abierto' : 'En Curso'}
                            </span>
                        </div>
                    </div>
                    <Link href={`/dashboard/eventos/${nextEvent.id}`} className="btn-event-action">
                        Ver Detalles
                    </Link>
                </div>
            ) : (
                <div className="empty-widget">
                    <div className="empty-icon-small">📅</div>
                    <p>No hay eventos próximos programados.</p>
                </div>
            )}
        </div>
    )
}
