'use client'

import React from 'react'

export default function AdminConfigPage() {
    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Configuración</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Ajustes generales de la plataforma</p>
                </div>
            </header>

            <div className="admin-card" style={{ padding: '2rem', background: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                <p style={{ color: '#94a3b8' }}>Las opciones de configuración estarán disponibles próximamente.</p>
            </div>
        </div>
    )
}
