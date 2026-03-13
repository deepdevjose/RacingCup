'use client'

import React, { useState, useEffect } from 'react'
import { getAllProfiles, getAllTeams, getTeamMembers, type UserProfile } from '@/lib/firebase'

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [usersWithTeam, setUsersWithTeam] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [teamFilter, setTeamFilter] = useState<'all' | 'with_team' | 'without_team'>('all')
    const [emailFilter, setEmailFilter] = useState<'all' | 'unverified'>('all')

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setLoading(true)
        try {
            const [profiles, teams] = await Promise.all([
                getAllProfiles(),
                getAllTeams()
            ])
            setUsers(profiles)

            // Build set of user IDs that have at least one accepted team membership
            const memberIds = new Set<string>()
            await Promise.all(
                teams.map(async (team) => {
                    if (!team.id) return
                    const members = await getTeamMembers(team.id)
                    members.forEach(m => memberIds.add(m.userId))
                })
            )
            setUsersWithTeam(memberIds)
        } catch (error) {
            console.error("Error loading users:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter users
    const filteredUsers = users.filter((user) => {
        // Text search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch = (
                user.displayName?.toLowerCase().includes(query) ||
                user.gamertag?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.school?.toLowerCase().includes(query)
            )
            if (!matchesSearch) return false
        }

        // Team filter
        if (teamFilter === 'with_team' && !usersWithTeam.has(user.userId)) return false
        if (teamFilter === 'without_team' && usersWithTeam.has(user.userId)) return false

        // Email verification filter — uses emailVerified field if stored on profile
        if (emailFilter === 'unverified') {
            // If field doesn't exist (undefined), treat as not verified
            if ((user as UserProfile & { emailVerified?: boolean }).emailVerified === true) return false
        }

        return true
    })

    // Stats
    const teacherCount = users.filter(u => u.isTeacher).length
    const studentCount = users.filter(u => !u.isTeacher).length
    const adminCount = users.filter(u => u.admin).length
    const withTeamCount = users.filter(u => usersWithTeam.has(u.userId)).length
    const withoutTeamCount = users.length - withTeamCount
    const unverifiedCount = users.filter(u => (u as UserProfile & { emailVerified?: boolean }).emailVerified !== true).length

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
                        <div className="stat-icon" style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' }}>
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
                        <div className="stat-icon" style={{ color: '#E32636', background: 'rgba(227, 38, 54, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{withTeamCount}</div>
                            <div className="stat-label">Con Equipo</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <polyline points="16 11 18 13 22 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">{withoutTeamCount}</div>
                            <div className="stat-label">Sin Equipo</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                                <line x1="18" y1="8" x2="23" y2="13"></line>
                                <line x1="23" y1="8" x2="18" y2="13"></line>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-table-container" style={{ marginBottom: '1rem' }}>
                <div className="admin-table-header" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, gamertag, correo o escuela..."
                        className="admin-input"
                        style={{ flex: 1, minWidth: '200px', padding: '0.5rem 1rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="admin-input"
                        style={{ width: '180px', padding: '0.5rem 1rem' }}
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value as typeof teamFilter)}
                    >
                        <option value="all">Todos los equipos</option>
                        <option value="with_team">Con equipo</option>
                        <option value="without_team">Sin equipo</option>
                    </select>
                    <select
                        className="admin-input"
                        style={{ width: '190px', padding: '0.5rem 1rem' }}
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value as typeof emailFilter)}
                    >
                        <option value="all">Todos los correos</option>
                        <option value="unverified">Correo no verificado ({unverifiedCount})</option>
                    </select>
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
                            <th>Equipo</th>
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
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>{user.email}</span>
                                        {(user as UserProfile & { emailVerified?: boolean }).emailVerified !== true && (
                                            <span title="Correo no verificado" style={{
                                                display: 'inline-block',
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#F59E0B',
                                                flexShrink: 0
                                            }} />
                                        )}
                                    </div>
                                </td>
                                <td>{user.school || '—'}</td>
                                <td>
                                    <span className={`status-badge ${user.isTeacher ? 'warning' : 'info'}`}>
                                        {user.isTeacher ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
                                    </span>
                                </td>
                                <td>
                                    {usersWithTeam.has(user.userId) ? (
                                        <span className="status-badge success">Con equipo</span>
                                    ) : (
                                        <span className="status-badge warning">Sin equipo</span>
                                    )}
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
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    {searchQuery || teamFilter !== 'all' || emailFilter !== 'all'
                                        ? 'No se encontraron usuarios que coincidan con los filtros'
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
