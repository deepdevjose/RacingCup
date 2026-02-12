'use client'

import React, { useState, useEffect } from 'react'
import { getAllProfiles, type UserProfile } from '@/lib/firebase'

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setLoading(true)
        try {
            const profiles = await getAllProfiles()
            setUsers(profiles)
        } catch (error) {
            console.error("Error loading users:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter users
    const filteredUsers = users.filter((user) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            user.displayName?.toLowerCase().includes(query) ||
            user.gamertag?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.school?.toLowerCase().includes(query)
        )
    })

    // Stats
    const teacherCount = users.filter(u => u.isTeacher).length
    const studentCount = users.filter(u => !u.isTeacher).length
    const adminCount = users.filter(u => u.admin).length

    if (loading) return <div className="p-8 text-white">Cargando usuarios...</div>

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestión de Usuarios</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                        {users.length} usuarios registrados ({teacherCount} profesores, {studentCount} estudiantes)
                    </p>
                </div>
            </header>

            {/* Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{users.length}</div>
                            <div className="stat-label">Total Usuarios</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{teacherCount}</div>
                            <div className="stat-label">Profesores</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{studentCount}</div>
                            <div className="stat-label">Estudiantes</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{adminCount}</div>
                            <div className="stat-label">Administradores</div>
                        </div>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-table-container" style={{ marginBottom: '1rem' }}>
                <div className="admin-table-header">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, gamertag, correo o escuela..."
                        className="admin-input"
                        style={{ width: '100%', padding: '0.5rem 1rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Gamertag</th>
                            <th>Correo</th>
                            <th>Escuela</th>
                            <th>Tipo</th>
                            <th>Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.userId}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: user.admin ? '#E32636' : user.isTeacher ? '#3B82F6' : '#10B981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.displayName?.substring(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{user.displayName}</div>
                                            {user.admin && (
                                                <div style={{ fontSize: '0.7rem', color: '#E32636' }}>
                                                    ⭐ Admin
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {user.gamertag}
                                    </span>
                                </td>
                                <td>{user.email}</td>
                                <td>{user.school || '—'}</td>
                                <td>
                                    <span className={`status-badge ${user.isTeacher ? 'warning' : 'info'}`}>
                                        {user.isTeacher ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                                    </span>
                                </td>
                                <td>
                                    {user.createdAt instanceof Date
                                        ? user.createdAt.toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchQuery
                                        ? 'No se encontraron usuarios que coincidan con la búsqueda'
                                        : 'No hay usuarios registrados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
