'use client'

import React, { useState } from 'react'
import jsPDF from 'jspdf'

interface Team {
    id: number
    name: string
    event: string
    membersCount: string
    registeredDate: string
    status: 'Pendiente' | 'Confirmado' | 'Rechazado'
    captain: string
    category: string
}

export default function AdminEquiposPage() {
    const [teams, setTeams] = useState<Team[]>([
        { id: 1, name: 'Rayo Veloz', event: 'Carrera RC', membersCount: '4/4', registeredDate: '07 Feb 2026', status: 'Pendiente', captain: 'Josepo', category: 'Expertos' },
        { id: 2, name: 'Alpha Team', event: 'Mini Sumo', membersCount: '2/2', registeredDate: '06 Feb 2026', status: 'Confirmado', captain: 'Maria', category: 'Amateur' },
        { id: 3, name: 'MechWarriors', event: 'Robo Fut', membersCount: '5/5', registeredDate: '08 Feb 2026', status: 'Confirmado', captain: 'Carlos', category: 'Pro' }
    ])

    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [selectedRank, setSelectedRank] = useState<'1er Lugar' | '2do Lugar'>('1er Lugar')

    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.setAttribute('crossOrigin', 'anonymous')
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0)
                const dataURL = canvas.toDataURL('image/png')
                resolve(dataURL)
            }
            img.onerror = error => reject(error)
            img.src = url
        })
    }

    const handleWinnerClick = (team: Team) => {
        setSelectedTeam(team)
        setIsWinnerModalOpen(true)
    }

    const generateWinnerCertificatePDF = async () => {
        if (!selectedTeam) return

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
        const width = doc.internal.pageSize.getWidth()
        const height = doc.internal.pageSize.getHeight()

        const primaryColor = selectedRank === '1er Lugar' ? [255, 215, 0] : [192, 192, 192] // Gold vs Silver

        // Background
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, width, height, 'F')

        // Outer Border (Gold/Silver)
        doc.setLineWidth(4)
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(5, 5, width - 10, height - 10)

        // Inner Border (Dark Slate)
        doc.setLineWidth(1)
        doc.setDrawColor(30, 41, 59) // Dark Slate
        doc.rect(10, 10, width - 20, height - 20)

        try {
            // Load Logos
            const [logoEducacion, logoItsoeh, logoRacing, logoSparko, logoTics] = await Promise.all([
                getBase64ImageFromURL('/logotypes/educacion.png'),
                getBase64ImageFromURL('/logotypes/itsoeg.png'),
                getBase64ImageFromURL('/logotypes/logo.png'),
                getBase64ImageFromURL('/logotypes/sparko.png'),
                getBase64ImageFromURL('/logotypes/tics.png')
            ])

            // Top Logos
            doc.addImage(logoEducacion, 'PNG', 20, 20, 50, 16, undefined, 'FAST')
            doc.addImage(logoItsoeh, 'PNG', width - 70, 20, 50, 16, undefined, 'FAST')

            // Bottom Logos
            const bottomY = height - 30
            doc.addImage(logoTics, 'PNG', width / 2 - 50, bottomY, 25, 16, undefined, 'FAST')
            doc.addImage(logoRacing, 'PNG', width / 2 - 12.5, bottomY, 25, 16, undefined, 'FAST')
            doc.addImage(logoSparko, 'PNG', width / 2 + 25, bottomY, 25, 16, undefined, 'FAST')

        } catch (error) {
            console.error("Error generating certificate", error)
        }

        // Header
        doc.setFont('times', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(30, 41, 59)
        doc.text('Instituto Tecnológico Superior del Occidente', width / 2, 50, { align: 'center' })
        doc.setFontSize(20)
        doc.text('del Estado de Hidalgo', width / 2, 60, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(14)
        doc.text('Otorga el presente reconocimiento al equipo:', width / 2, 80, { align: 'center' })

        // Team Name
        doc.setFont('times', 'bolditalic')
        doc.setFontSize(50)
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.text(selectedTeam.name.toUpperCase(), width / 2, 105, { align: 'center' })

        // Underline for Team Name
        doc.setLineWidth(1.5)
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.line(width / 2 - 40, 108, width / 2 + 40, 108)

        // Rank and Category
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.setTextColor(30, 41, 59)
        doc.text(`Por haber obtenido el ${selectedRank}`, width / 2, 125, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(16)
        doc.text(`En la categoría ${selectedTeam.category} del evento ${selectedTeam.event}`, width / 2, 135, { align: 'center' })

        // Event Title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(28)
        doc.text('4to Racing Cups', width / 2, 155, { align: 'center' })

        // Date
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026', width / 2, 175, { align: 'center' })

        doc.save(`certificado_ganador_${selectedTeam.name.replace(/\s+/g, '_')}.pdf`)
    }

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestión de Equipos</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Revisa y aprueba los equipos registrados</p>
                </div>
            </header>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <input
                        type="text"
                        placeholder="Buscar equipos..."
                        className="admin-input"
                        style={{ width: '300px', padding: '0.5rem 1rem' }}
                    />
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Evento</th>
                            <th>Categoría</th>
                            <th>Integrantes</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(team => (
                            <tr key={team.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                                            {team.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>{team.name}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Capitán: {team.captain}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{team.event}</td>
                                <td>{team.category}</td>
                                <td>{team.membersCount}</td>
                                <td><span className={`status-badge ${team.status === 'Confirmado' ? 'success' : 'warning'}`}>{team.status}</span></td>
                                <td>
                                    <button className="action-btn" style={{ color: '#E32636' }} onClick={() => handleWinnerClick(team)}>
                                        🏆 Certificado Ganador
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Winner Certificate Modal */}
            {isWinnerModalOpen && selectedTeam && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '1000px', width: '90%', display: 'flex', gap: '2rem', padding: '2rem' }}>

                        {/* Controls Side */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>Generar Certificado</h2>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Selecciona el puesto obtenido por el equipo <strong>{selectedTeam.name}</strong>.</p>

                            <div className="admin-form-group">
                                <label className="admin-label">Puesto Obtenido</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => setSelectedRank('1er Lugar')}
                                        style={{
                                            padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #FFD700',
                                            background: selectedRank === '1er Lugar' ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                                            color: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>🥇</span>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>1er Lugar</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Campeón del Evento</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setSelectedRank('2do Lugar')}
                                        style={{
                                            padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #C0C0C0',
                                            background: selectedRank === '2do Lugar' ? 'rgba(192, 192, 192, 0.1)' : 'transparent',
                                            color: '#C0C0C0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>🥈</span>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>2do Lugar</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Subcampeón del Evento</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '2rem' }}>
                                <button
                                    className="btn-admin-login"
                                    style={{ background: 'transparent', border: '1px solid #94a3b8', flex: 1 }}
                                    onClick={() => setIsWinnerModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-admin-login"
                                    style={{ flex: 1, background: selectedRank === '1er Lugar' ? '#FFD700' : '#C0C0C0', color: '#000', fontWeight: 'bold' }}
                                    onClick={generateWinnerCertificatePDF}
                                >
                                    ⬇️ Descargar PDF
                                </button>
                            </div>
                        </div>

                        {/* Preview Side */}
                        <div style={{ flex: 2, background: '#fff', borderRadius: '4px', padding: '2rem', position: 'relative', minHeight: '500px', color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                            {/* Border */}
                            <div style={{
                                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                                border: `4px solid ${selectedRank === '1er Lugar' ? '#FFD700' : '#C0C0C0'}`, pointerEvents: 'none', zIndex: 1
                            }}></div>
                            <div style={{
                                position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px',
                                border: '1px solid #1e293b', pointerEvents: 'none', zIndex: 1
                            }}></div>

                            {/* Logos Top */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <img src="/logotypes/educacion.png" alt="Educación" style={{ height: '40px', objectFit: 'contain' }} />
                                <img src="/logotypes/itsoeg.png" alt="ITSOEH" style={{ height: '40px', objectFit: 'contain' }} />
                            </div>

                            {/* Header */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Instituto Tecnológico Superior del Occidente</h1>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>del Estado de Hidalgo</h2>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '1rem', margin: 0 }}>Otorga el presente reconocimiento al equipo:</p>
                            </div>

                            {/* Team Name */}
                            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                                <h1 style={{
                                    fontFamily: "'Racing Sans One', cursive",
                                    fontSize: '3.5rem',
                                    color: selectedRank === '1er Lugar' ? '#B8860B' : '#7f8c8d', // Dark Gold or Grey
                                    margin: 0,
                                    textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                                }}>
                                    {selectedTeam.name.toUpperCase()}
                                </h1>
                                <div style={{ width: '200px', height: '2px', background: selectedRank === '1er Lugar' ? '#FFD700' : '#C0C0C0', margin: '0.5rem auto' }}></div>
                            </div>

                            {/* Rank Details */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Por haber obtenido el {selectedRank}</p>
                                <p style={{ fontSize: '1rem', margin: 0 }}>En la categoría <strong>{selectedTeam.category}</strong> del evento <strong>{selectedTeam.event}</strong></p>
                            </div>

                            {/* Event Title */}
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>4to Racing Cups</h2>
                            </div>

                            {/* Date */}
                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026
                            </div>

                            {/* Logos Bottom */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                                <img src="/logotypes/tics.png" alt="TICS" style={{ height: '30px', objectFit: 'contain' }} />
                                <img src="/logotypes/logo.png" alt="Racing" style={{ height: '40px', objectFit: 'contain' }} />
                                <img src="/logotypes/sparko.png" alt="Sparko" style={{ height: '30px', objectFit: 'contain' }} />
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
