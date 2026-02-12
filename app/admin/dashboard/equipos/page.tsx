'use client'

import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import {
    getAllTeams,
    getAllEvents,
    getTeamMembers,
    getProfile,
    updateTeamConfirmation,
    updateTeamSeed,
    deleteTeam,
    type Team,
    type Event,
    type TeamMember,
    type UserProfile
} from '@/lib/firebase'

interface TeamWithDetails extends Team {
    members?: (TeamMember & { profile?: UserProfile })[]
    leaderProfile?: UserProfile
    eventName?: string
}

export default function AdminEquiposPage() {
    const [teams, setTeams] = useState<TeamWithDetails[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Filters
    const [selectedEvent, setSelectedEvent] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all')

    // Modals
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedTeam, setSelectedTeam] = useState<TeamWithDetails | null>(null)
    const [selectedRank, setSelectedRank] = useState<'1er Lugar' | '2do Lugar'>('1er Lugar')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [teamsData, eventsData] = await Promise.all([
                getAllTeams(),
                getAllEvents()
            ])

            setEvents(eventsData)

            // Load team details
            const teamsWithDetails = await Promise.all(
                teamsData.map(async (team) => {
                    const members = team.id ? await getTeamMembers(team.id) : []
                    const membersWithProfiles = await Promise.all(
                        members.map(async (m) => ({
                            ...m,
                            profile: (await getProfile(m.userId)) || undefined,
                        }))
                    )
                    const leaderProfile = team.leaderUserId
                        ? (await getProfile(team.leaderUserId)) || undefined
                        : undefined
                    const event = eventsData.find(e => e.id === team.eventId)
                    return {
                        ...team,
                        members: membersWithProfiles,
                        leaderProfile,
                        eventName: event?.name || 'Sin evento'
                    }
                })
            )
            setTeams(teamsWithDetails)
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmTeam = async (teamId: string, confirmed: boolean) => {
        setUpdating(true)
        try {
            await updateTeamConfirmation(teamId, confirmed)
            await loadData()
        } catch (error) {
            console.error("Error updating team:", error)
            alert("Error al actualizar equipo")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdateSeed = async (teamId: string, seed: number) => {
        try {
            await updateTeamSeed(teamId, seed)
            await loadData()
        } catch (error) {
            console.error("Error updating seed:", error)
        }
    }

    const handleDeleteTeam = async (teamId: string) => {
        if (!confirm('¿Estás seguro de eliminar este equipo?')) return
        setUpdating(true)
        try {
            await deleteTeam(teamId)
            await loadData()
            setIsDetailsModalOpen(false)
            setSelectedTeam(null)
        } catch (error) {
            console.error("Error deleting team:", error)
            alert("Error al eliminar equipo")
        } finally {
            setUpdating(false)
        }
    }

    // Filter teams
    const filteredTeams = teams.filter((team) => {
        if (selectedEvent !== 'all' && team.eventId !== selectedEvent) return false
        if (statusFilter === 'confirmed' && !team.isConfirmed) return false
        if (statusFilter === 'pending' && team.isConfirmed) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                team.name.toLowerCase().includes(query) ||
                team.leaderProfile?.displayName?.toLowerCase().includes(query) ||
                team.leaderProfile?.gamertag?.toLowerCase().includes(query)
            )
        }
        return true
    })

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

    const handleWinnerClick = (team: TeamWithDetails) => {
        setSelectedTeam(team)
        setIsWinnerModalOpen(true)
    }

    const generateWinnerCertificatePDF = async () => {
        if (!selectedTeam) return

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
        const width = doc.internal.pageSize.getWidth()
        const height = doc.internal.pageSize.getHeight()

        const primaryColor = selectedRank === '1er Lugar' ? [255, 215, 0] : [192, 192, 192]

        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, width, height, 'F')

        doc.setLineWidth(4)
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(5, 5, width - 10, height - 10)

        doc.setLineWidth(1)
        doc.setDrawColor(30, 41, 59)
        doc.rect(10, 10, width - 20, height - 20)

        try {
            const [logoEducacion, logoItsoeh, logoRacing, logoSparko, logoTics] = await Promise.all([
                getBase64ImageFromURL('/logotypes/educacion.png'),
                getBase64ImageFromURL('/logotypes/itsoeg.png'),
                getBase64ImageFromURL('/logotypes/logo.png'),
                getBase64ImageFromURL('/logotypes/sparko.png'),
                getBase64ImageFromURL('/logotypes/tics.png')
            ])

            doc.addImage(logoEducacion, 'PNG', 20, 20, 50, 16, undefined, 'FAST')
            doc.addImage(logoItsoeh, 'PNG', width - 70, 20, 50, 16, undefined, 'FAST')

            const bottomY = height - 30
            doc.addImage(logoTics, 'PNG', width / 2 - 50, bottomY, 25, 16, undefined, 'FAST')
            doc.addImage(logoRacing, 'PNG', width / 2 - 12.5, bottomY, 25, 16, undefined, 'FAST')
            doc.addImage(logoSparko, 'PNG', width / 2 + 25, bottomY, 25, 16, undefined, 'FAST')
        } catch (error) {
            console.error("Error generating certificate", error)
        }

        doc.setFont('times', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(30, 41, 59)
        doc.text('Instituto Tecnológico Superior del Occidente', width / 2, 50, { align: 'center' })
        doc.setFontSize(20)
        doc.text('del Estado de Hidalgo', width / 2, 60, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(14)
        doc.text('Otorga el presente reconocimiento al equipo:', width / 2, 80, { align: 'center' })

        doc.setFont('times', 'bolditalic')
        doc.setFontSize(50)
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.text(selectedTeam.name.toUpperCase(), width / 2, 105, { align: 'center' })

        doc.setLineWidth(1.5)
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.line(width / 2 - 40, 108, width / 2 + 40, 108)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.setTextColor(30, 41, 59)
        doc.text(`Por haber obtenido el ${selectedRank}`, width / 2, 125, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(16)
        doc.text(`En el evento ${selectedTeam.eventName}`, width / 2, 135, { align: 'center' })

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(28)
        doc.text('4to Racing Cups', width / 2, 155, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026', width / 2, 175, { align: 'center' })

        doc.save(`certificado_ganador_${selectedTeam.name.replace(/\s+/g, '_')}.pdf`)
    }

    if (loading) return <div className="p-8 text-white">Cargando equipos...</div>

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestión de Equipos</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Revisa y aprueba los equipos registrados</p>
                </div>
            </header>

            {/* Filters */}
            <div className="admin-table-container" style={{ marginBottom: '1rem' }}>
                <div className="admin-table-header" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar equipos..."
                        className="admin-input"
                        style={{ flex: 1, minWidth: '200px', padding: '0.5rem 1rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="admin-input"
                        style={{ width: '200px', padding: '0.5rem 1rem' }}
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                    >
                        <option value="all">Todos los eventos</option>
                        {events.map((e) => (
                            <option key={e.id} value={e.id!}>{e.name}</option>
                        ))}
                    </select>
                    <select
                        className="admin-input"
                        style={{ width: '180px', padding: '0.5rem 1rem' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                        <option value="all">Todos</option>
                        <option value="confirmed">Confirmados</option>
                        <option value="pending">Pendientes</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>Líder</th>
                            <th>Evento</th>
                            <th>Miembros</th>
                            <th>Estado</th>
                            <th>Seed</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.map(team => (
                            <tr key={team.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: team.color || '#3B82F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: '#fff'
                                        }}>
                                            {team.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <strong>{team.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div>{team.leaderProfile?.displayName || '—'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            {team.leaderProfile?.gamertag}
                                        </div>
                                    </div>
                                </td>
                                <td>{team.eventName}</td>
                                <td>{team.members?.length || 0}</td>
                                <td>
                                    <span className={`status-badge ${team.isConfirmed ? 'success' : 'warning'}`}>
                                        {team.isConfirmed ? 'Confirmado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="admin-input"
                                        style={{ width: '70px', padding: '0.25rem 0.5rem' }}
                                        value={team.seed || ''}
                                        onChange={(e) => team.id && handleUpdateSeed(team.id, Number(e.target.value))}
                                        placeholder="—"
                                    />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {team.isConfirmed ? (
                                            <button
                                                className="action-btn"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => team.id && handleConfirmTeam(team.id, false)}
                                                disabled={updating}
                                            >
                                                ✗ Desconfirmar
                                            </button>
                                        ) : (
                                            <button
                                                className="action-btn"
                                                style={{ color: '#10b981' }}
                                                onClick={() => team.id && handleConfirmTeam(team.id, true)}
                                                disabled={updating}
                                            >
                                                ✓ Confirmar
                                            </button>
                                        )}
                                        <button
                                            className="action-btn"
                                            onClick={() => {
                                                setSelectedTeam(team)
                                                setIsDetailsModalOpen(true)
                                            }}
                                        >
                                            Ver Detalles
                                        </button>
                                        <button
                                            className="action-btn"
                                            style={{ color: '#E32636' }}
                                            onClick={() => handleWinnerClick(team)}
                                        >
                                            🏆 Certificado
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredTeams.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay equipos que coincidan con los filtros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Team Details Modal */}
            {isDetailsModalOpen && selectedTeam && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '600px', width: '90%' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Detalles del Equipo</h2>

                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '0.5rem',
                                    background: selectedTeam.color || '#3B82F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }}>
                                    {selectedTeam.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedTeam.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                        Código: {selectedTeam.inviteCode}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">Miembros</label>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedTeam.members?.map((member) => (
                                    <div
                                        key={member.id}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '0.25rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{member.profile?.displayName}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                {member.profile?.gamertag}
                                            </div>
                                        </div>
                                        {member.userId === selectedTeam.leaderUserId && (
                                            <span className="status-badge success">Líder</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-admin-login"
                                style={{ background: 'transparent', border: '1px solid #94a3b8', flex: 1 }}
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Cerrar
                            </button>
                            <button
                                className="btn-admin-login"
                                style={{ background: '#ef4444', flex: 1 }}
                                onClick={() => selectedTeam.id && handleDeleteTeam(selectedTeam.id)}
                                disabled={updating}
                            >
                                🗑️ Eliminar Equipo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Winner Certificate Modal (keeping existing implementation) */}
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

                        {/* Preview Side (keeping existing preview) */}
                        <div style={{ flex: 2, background: '#fff', borderRadius: '4px', padding: '2rem', position: 'relative', minHeight: '500px', color: '#1e293b', fontFamily: "'Outfit', sans-serif" }}>
                            <div style={{
                                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                                border: `4px solid ${selectedRank === '1er Lugar' ? '#FFD700' : '#C0C0C0'}`, pointerEvents: 'none', zIndex: 1
                            }}></div>
                            <div style={{
                                position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px',
                                border: '1px solid #1e293b', pointerEvents: 'none', zIndex: 1
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <img src="/logotypes/educacion.png" alt="Educación" style={{ height: '40px', objectFit: 'contain' }} />
                                <img src="/logotypes/itsoeg.png" alt="ITSOEH" style={{ height: '40px', objectFit: 'contain' }} />
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Instituto Tecnológico Superior del Occidente</h1>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>del Estado de Hidalgo</h2>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '1rem', margin: 0 }}>Otorga el presente reconocimiento al equipo:</p>
                            </div>

                            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                                <h1 style={{
                                    fontFamily: "'Racing Sans One', cursive",
                                    fontSize: '3.5rem',
                                    color: selectedRank === '1er Lugar' ? '#B8860B' : '#7f8c8d',
                                    margin: 0,
                                    textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                                }}>
                                    {selectedTeam.name.toUpperCase()}
                                </h1>
                                <div style={{ width: '200px', height: '2px', background: selectedRank === '1er Lugar' ? '#FFD700' : '#C0C0C0', margin: '0.5rem auto' }}></div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Por haber obtenido el {selectedRank}</p>
                                <p style={{ fontSize: '1rem', margin: 0 }}>En el evento <strong>{selectedTeam.eventName}</strong></p>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>4to Racing Cups</h2>
                            </div>

                            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026
                            </div>

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
