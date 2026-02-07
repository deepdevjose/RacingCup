'use client'

import React from 'react'

export default function AdminDashboardPage() {
    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Visión General</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Bienvenido al panel de control de Racing Cup</p>
                </div>
                <button className="btn-admin-login" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    + Nuevo Evento
                </button>
            </header>

            {/* Stats Grid */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-value">12</div>
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
                            <div className="stat-value">48</div>
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
                            <div className="stat-value">156</div>
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
                            <div className="stat-value">5</div>
                            <div className="stat-label">Pendientes Aprobación</div>
                        </div>
                        <div className="stat-icon" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Actividad Reciente</h3>
                    <button className="action-btn" style={{ fontSize: '0.85rem' }}>Ver todo</button>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario/Equipo</th>
                            <th>Acción</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4].map((i) => (
                            <tr key={i}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>Equipo Alpha {i}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Registrado por @usuario{i}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>Registro en <strong>Carrera RC</strong></td>
                                <td>Hace {i * 10} min</td>
                                <td>
                                    <span className={`status-badge ${i === 1 ? 'warning' : 'success'}`}>
                                        {i === 1 ? 'Pendiente' : 'Confirmado'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
