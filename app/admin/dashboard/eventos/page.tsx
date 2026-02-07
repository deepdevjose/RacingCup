'use client'

import React, { useState } from 'react'

interface Event {
    id: number
    name: string
    date: string
    location: string
    category: string
    teams: number
    status: 'Activo' | 'Cupo Limitado' | 'Finalizado'
}

export default function AdminEventosPage() {
    const [events, setEvents] = useState<Event[]>([
        { id: 1, name: 'Carrera RC - Velocidad', category: 'Categoría Principal', date: '2026-03-13', location: 'Pista Principal', teams: 24, status: 'Activo' },
        { id: 2, name: 'Mini Sumo Autónomo', category: 'Robótica', date: '2026-03-13', location: 'Arena 1', teams: 12, status: 'Cupo Limitado' },
        { id: 3, name: 'Robo Fut', category: 'Deportes', date: '2026-03-14', location: 'Cancha A', teams: 8, status: 'Activo' }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({})
    const [isEditing, setIsEditing] = useState(false)

    const handleCreate = () => {
        setCurrentEvent({ status: 'Activo', teams: 0 })
        setIsEditing(false)
        setIsModalOpen(true)
    }

    const handleEdit = (event: Event) => {
        setCurrentEvent(event)
        setIsEditing(true)
        setIsModalOpen(true)
    }

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            setEvents(events.filter(e => e.id !== id))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isEditing) {
            setEvents(events.map(ev => ev.id === currentEvent.id ? { ...ev, ...currentEvent } as Event : ev))
        } else {
            const newEvent = { ...currentEvent, id: Date.now() } as Event
            setEvents([...events, newEvent])
        }
        setIsModalOpen(false)
    }

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestión de Eventos</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Administra los eventos de la competencia</p>
                </div>
                <button
                    className="btn-admin-login"
                    style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                    onClick={handleCreate}
                >
                    + Crear Nuevo Evento
                </button>
            </header>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nombre del Evento</th>
                            <th>Fecha</th>
                            <th>Ubicación</th>
                            <th>Equipos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>
                                    <strong>{event.name}</strong>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{event.category}</div>
                                </td>
                                <td>{event.date}</td>
                                <td>{event.location}</td>
                                <td>{event.teams}</td>
                                <td>
                                    <span className={`status-badge ${event.status === 'Activo' ? 'success' :
                                            event.status === 'Cupo Limitado' ? 'warning' : 'error'
                                        }`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn" onClick={() => handleEdit(event)}>Editar</button>
                                    <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(event.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label className="admin-label">Nombre del Evento</label>
                                <input
                                    className="admin-input"
                                    value={currentEvent.name || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Categoría</label>
                                <input
                                    className="admin-input"
                                    value={currentEvent.category || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">Fecha</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={currentEvent.date || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Ubicación</label>
                                    <input
                                        className="admin-input"
                                        value={currentEvent.location || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Estado</label>
                                <select
                                    className="admin-input"
                                    value={currentEvent.status || 'Activo'}
                                    onChange={e => setCurrentEvent({ ...currentEvent, status: e.target.value as any })}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Cupo Limitado">Cupo Limitado</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn-admin-login" style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-admin-login">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
