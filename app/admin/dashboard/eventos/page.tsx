'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    type Event as FirestoreEvent
} from '@/lib/firebase'

// Extend FirestoreEvent or map it to local interface if needed
// The FirestoreEvent interface from lib/firebase has:
// id, name, description, date, location, format, status, maxTeamSize, minTeamSize, categories, winnersConfirmed, etc.

export default function AdminEventosPage() {
    const [events, setEvents] = useState<FirestoreEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Partial event for editing/creating
    const [currentEvent, setCurrentEvent] = useState<Partial<FirestoreEvent>>({})
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const data = await getAllEvents()
            setEvents(data)
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        // Default values for new event
        setCurrentEvent({
            status: 'registro_abierto',
            minTeamSize: 1,
            maxTeamSize: 5,
            categories: ['General'],
            format: 'brackets',
            description: '',
            name: '',
            location: ''
        })
        setIsEditing(false)
        setIsModalOpen(true)
    }

    const handleEdit = (event: FirestoreEvent) => {
        setCurrentEvent({
            ...event,
            // Ensure date is valid for input (YYYY-MM-DD)
            // @ts-ignore - Handle Date object from Firestore
            dateString: event.date instanceof Date ? event.date.toISOString().split('T')[0] : ''
        })
        setIsEditing(true)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            try {
                await deleteEvent(id)
                await fetchEvents()
            } catch (error) {
                console.error("Error deleting event:", error)
                alert("Error al eliminar evento")
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Prepare data
            // @ts-ignore
            const dateValue = currentEvent.dateString ? new Date(currentEvent.dateString) : new Date()
            // Fix timezone offset issue crudely or just use local
            // Better: new Date(dateString + 'T12:00:00') to avoid prev day

            const eventData: any = {
                name: currentEvent.name || 'Sin nombre',
                description: currentEvent.description || '',
                date: dateValue,
                location: currentEvent.location || '',
                format: currentEvent.format || 'brackets',
                status: currentEvent.status || 'registro_abierto',
                maxTeamSize: Number(currentEvent.maxTeamSize) || 4,
                minTeamSize: Number(currentEvent.minTeamSize) || 1,
                // Handle categories split by comma if input is text, or keeping array
                categories: Array.isArray(currentEvent.categories)
                    ? currentEvent.categories
                    : (currentEvent.categories as unknown as string || '').split(',').map((s: string) => s.trim())
            }

            if (isEditing && currentEvent.id) {
                await updateEvent(currentEvent.id, eventData)
            } else {
                await createEvent(eventData)
            }

            setIsModalOpen(false)
            fetchEvents()
        } catch (error) {
            console.error("Error saving event:", error)
            alert("Error al guardar evento")
        }
    }

    if (loading) return <div className="p-8 text-white">Cargando eventos...</div>

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
                            <th>Categorías</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td>
                                    <strong>{event.name}</strong>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {event.description?.substring(0, 30)}...
                                    </div>
                                </td>
                                <td>
                                    {event.date instanceof Date
                                        ? event.date.toLocaleDateString()
                                        : 'Fecha inválida'}
                                </td>
                                <td>{event.location}</td>
                                <td>{event.categories?.join(', ')}</td>
                                <td>
                                    <span className={`status-badge ${event.status === 'registro_abierto' ? 'success' :
                                        event.status === 'en_curso' ? 'warning' :
                                            event.status === 'cerrado' ? 'error' : 'secondary'
                                        }`}>
                                        {event.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <Link
                                        href={`/admin/dashboard/eventos/${event.id}`}
                                        className="action-btn"
                                        style={{ textDecoration: 'none', display: 'inline-block', marginRight: '0.5rem' }}
                                    >
                                        Gestionar
                                    </Link>
                                    <button className="action-btn" onClick={() => handleEdit(event)}>Editar</button>
                                    <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => event.id && handleDelete(event.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay eventos registrados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
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
                                <label className="admin-label">Descripción</label>
                                <textarea
                                    className="admin-input"
                                    style={{ minHeight: '80px', fontFamily: 'inherit' }}
                                    value={currentEvent.description || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">Fecha</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        // @ts-ignore
                                        value={currentEvent.dateString || ''}
                                        // @ts-ignore
                                        onChange={e => setCurrentEvent({ ...currentEvent, dateString: e.target.value })}
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
                                <label className="admin-label">Categorías (separadas por coma)</label>
                                <input
                                    className="admin-input"
                                    value={Array.isArray(currentEvent.categories) ? currentEvent.categories.join(', ') : currentEvent.categories || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, categories: e.target.value.split(',').map(s => s.trim()) })}
                                    placeholder="Ej: Sumo, Carrera, Innovación"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="admin-form-group">
                                    <label className="admin-label">Estado</label>
                                    <select
                                        className="admin-input"
                                        value={currentEvent.status || 'registro_abierto'}
                                        onChange={e => setCurrentEvent({ ...currentEvent, status: e.target.value as any })}
                                    >
                                        <option value="registro_abierto">Registro Abierto</option>
                                        <option value="cerrado">Cerrado</option>
                                        <option value="en_curso">En Curso</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">Equipos (Min - Max)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={currentEvent.minTeamSize || 1}
                                            onChange={e => setCurrentEvent({ ...currentEvent, minTeamSize: Number(e.target.value) })}
                                            min="1"
                                        />
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={currentEvent.maxTeamSize || 4}
                                            onChange={e => setCurrentEvent({ ...currentEvent, maxTeamSize: Number(e.target.value) })}
                                            min="1"
                                        />
                                    </div>
                                </div>
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
