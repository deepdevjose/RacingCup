'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllEvents, getAllTeams, getAllProfiles } from '@/lib/firebase'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        activeEvents: 0,
        totalTeams: 0,
        confirmedTeams: 0,
        totalUsers: 0,
        teacherCount: 0,
        pendingTeams: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [events, teams, profiles] = await Promise.all([
                    getAllEvents(),
                    getAllTeams(),
                    getAllProfiles()
                ])

                const activeEvents = events.filter(e => e.status === 'registro_abierto' || e.status === 'en_curso').length
                const confirmedTeams = teams.filter(t => t.isConfirmed).length
                const pendingTeams = teams.filter(t => !t.isConfirmed).length
                const teacherCount = profiles.filter(p => p.isTeacher).length

                setStats({
                    activeEvents,
                    totalTeams: teams.length,
                    confirmedTeams,
                    totalUsers: profiles.length,
                    teacherCount,
                    pendingTeams
                })
            } catch (error) {
                console.error("Error fetching admin stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])


    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Visión General</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Bienvenido al panel de control de Racing Cup</p>
                </div>
                <Link href="/admin/dashboard/eventos" className="btn-admin-login" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                    + Gestionar Eventos
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.activeEvents}</div>
                            <div className="stat-label">Eventos Activos</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.totalTeams}</div>
                            <div className="stat-label">Equipos Registrados</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.confirmedTeams}</div>
                            <div className="stat-label">Equipos Confirmados</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.totalUsers}</div>
                            <div className="stat-label">Usuarios Totales</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.teacherCount}</div>
                            <div className="stat-label">Profesores</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                        </div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{loading ? '-' : stats.pendingTeams}</div>
                            <div className="stat-label">Equipos Pendientes</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Quick Actions - Simplified placeholder for now */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Enlaces Rápidos</h3>
                </div>
                <div style={{ padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/admin/dashboard/equipos" className="btn-admin-login" style={{ width: 'auto', background: 'transparent', border: '1px solid #334155' }}>
                        Ver Equipos
                    </Link>
                    <Link href="/admin/dashboard/usuarios" className="btn-admin-login" style={{ width: 'auto', background: 'transparent', border: '1px solid #334155' }}>
                        Ver Usuarios
                    </Link>
                    <Link href="/admin/test-teams" className="btn-admin-login" style={{ width: 'auto', background: 'transparent', border: '1px solid #10B981' }}>
                        🧪 Generar Equipos de Prueba
                    </Link>
                </div>
            </div>
        </div>
    )
}
