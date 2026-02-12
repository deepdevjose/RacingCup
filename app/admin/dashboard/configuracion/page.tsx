'use client'

import React, { useState, useEffect } from 'react'
import {
    createNotification,
    getAllNotifications,
    deleteNotification,
    getAllEvents,
    getAllTeams,
    type Notification,
    type Event,
    type Team
} from '@/lib/firebase'

export default function AdminConfigPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [sending, setSending] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'announcement' | 'warning' | 'info'>('announcement')
    const [target, setTarget] = useState<'all' | 'event' | 'team'>('all')
    const [targetId, setTargetId] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [notifs, evts, tms] = await Promise.all([
                getAllNotifications(),
                getAllEvents(),
                getAllTeams()
            ])
            setNotifications(notifs)
            setEvents(evts)
            setTeams(tms)
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNotification = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            await createNotification({
                title,
                message,
                type,
                target,
                targetId: target !== 'all' ? targetId : undefined,
            })
            await loadData()
            setIsModalOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error creating notification:", error)
            alert("Error al crear notificación")
        } finally {
            setSending(false)
        }
    }

    const handleDeleteNotification = async (id: string) => {
        if (!confirm('¿Eliminar esta notificación?')) return
        try {
            await deleteNotification(id)
            await loadData()
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
    }

    const resetForm = () => {
        setTitle('')
        setMessage('')
        setType('announcement')
        setTarget('all')
        setTargetId('')
    }

    const getTargetLabel = (notif: Notification) => {
        if (notif.target === 'all') return 'Todos los usuarios'
        if (notif.target === 'event') {
            const event = events.find(e => e.id === notif.targetId)
            return `Evento: ${event?.name || 'Desconocido'}`
        }
        if (notif.target === 'team') {
            const team = teams.find(t => t.id === notif.targetId)
            return `Equipo: ${team?.name || 'Desconocido'}`
        }
        return notif.target
    }

    if (loading) return <div className="p-8 text-white">Cargando notificaciones...</div>

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Notificaciones</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                        Envía anuncios y alertas a los usuarios
                    </p>
                </div>
                <button
                    className="btn-admin-login"
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nueva Notificación
                </button>
            </header>

            {/* Notifications List */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Mensaje</th>
                            <th>Tipo</th>
                            <th>Destinatarios</th>
                            <th>Leídos</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map(notif => (
                            <tr key={notif.id}>
                                <td>
                                    <strong>{notif.title}</strong>
                                </td>
                                <td>
                                    <div style={{
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {notif.message}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${notif.type === 'announcement' ? 'info' :
                                            notif.type === 'warning' ? 'warning' : 'secondary'
                                        }`}>
                                        {notif.type === 'announcement' ? '📢 Anuncio' :
                                            notif.type === 'warning' ? '⚠️ Advertencia' : 'ℹ️ Info'}
                                    </span>
                                </td>
                                <td>{getTargetLabel(notif)}</td>
                                <td>{notif.readBy?.length || 0}</td>
                                <td>
                                    {notif.createdAt instanceof Date
                                        ? notif.createdAt.toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '—'}
                                </td>
                                <td>
                                    <button
                                        className="action-btn"
                                        style={{ color: '#ef4444' }}
                                        onClick={() => notif.id && handleDeleteNotification(notif.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {notifications.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay notificaciones enviadas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Notification Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '600px', width: '90%' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Nueva Notificación</h2>

                        <form onSubmit={handleCreateNotification}>
                            <div className="admin-form-group">
                                <label className="admin-label">Título</label>
                                <input
                                    className="admin-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Actualización importante"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Mensaje</label>
                                <textarea
                                    className="admin-input"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe el contenido de la notificación..."
                                    rows={4}
                                    required
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Tipo</label>
                                <select
                                    className="admin-input"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as typeof type)}
                                >
                                    <option value="announcement">📢 Anuncio</option>
                                    <option value="warning">⚠️ Advertencia</option>
                                    <option value="info">ℹ️ Información</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-label">Destinatarios</label>
                                <select
                                    className="admin-input"
                                    value={target}
                                    onChange={(e) => {
                                        setTarget(e.target.value as typeof target)
                                        setTargetId('')
                                    }}
                                >
                                    <option value="all">Todos los usuarios</option>
                                    <option value="event">Participantes de un evento</option>
                                    <option value="team">Miembros de un equipo</option>
                                </select>
                            </div>

                            {target === 'event' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Seleccionar Evento</label>
                                    <select
                                        className="admin-input"
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Selecciona un evento --</option>
                                        {events.map(e => (
                                            <option key={e.id} value={e.id!}>{e.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {target === 'team' && (
                                <div className="admin-form-group">
                                    <label className="admin-label">Seleccionar Equipo</label>
                                    <select
                                        className="admin-input"
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Selecciona un equipo --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id!}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="btn-admin-login"
                                    style={{ background: 'transparent', border: '1px solid #94a3b8', flex: 1 }}
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        resetForm()
                                    }}
                                    disabled={sending}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-admin-login"
                                    style={{ flex: 1 }}
                                    disabled={sending}
                                >
                                    {sending ? 'Enviando...' : '📤 Enviar Notificación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
