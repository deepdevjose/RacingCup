'use client'

import React, { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fontOutfitBoldVFS, fontOutfitRegularVFS, fontRacingSansOneVFS } from '../certificateFonts'

interface User {
    id: number
    name: string
    email: string
    role: 'Usuario' | 'Administrador'
    status: 'Activo' | 'Bloqueado'
    joinedDate: string
    avatar: string
}

export default function AdminUsuariosPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'winners'>('users')
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'Jose Manuel', email: 'jose@example.com', role: 'Usuario', status: 'Activo', joinedDate: '01 Ene 2026', avatar: 'JM' },
        { id: 2, name: 'Admin User', email: 'admin@racingcup.com', role: 'Administrador', status: 'Activo', joinedDate: '01 Ene 2026', avatar: 'AD' },
        { id: 3, name: 'Maria Gonzalez', email: 'maria@example.com', role: 'Usuario', status: 'Activo', joinedDate: '15 Feb 2026', avatar: 'MG' },
        { id: 4, name: 'Carlos Perez', email: 'carlos@example.com', role: 'Usuario', status: 'Bloqueado', joinedDate: '20 Feb 2026', avatar: 'CP' },
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<Partial<User>>({})

    const handleEdit = (user: User) => {
        setCurrentUser(user)
        setIsModalOpen(true)
    }

    const handleBlock = (id: number) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Activo' ? 'Bloqueado' : 'Activo' } : u))
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...currentUser } as User : u))
        setIsModalOpen(false)
    }

    const generatePDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text('Reporte de Usuarios - Racing Cup', 14, 22)
        doc.setFontSize(11)
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30)

        autoTable(doc, {
            startY: 40,
            head: [['ID', 'Nombre', 'Correo', 'Rol', 'Estado']],
            body: users.map(u => [u.id, u.name, u.email, u.role, u.status]),
            theme: 'grid',
            headStyles: { fillColor: [227, 38, 54] }
        })

        doc.save('reporte_usuarios.pdf')
    }

    const [isCertModalOpen, setIsCertModalOpen] = useState(false)
    const [certUser, setCertUser] = useState<User | null>(null)

    const handleCertClick = (user: User) => {
        setCertUser(user)
        setIsCertModalOpen(true)
    }

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

    const generateCertificatePDF = async (user: User, download = true) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
        const width = doc.internal.pageSize.getWidth()
        const height = doc.internal.pageSize.getHeight()

        // Background
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, width, height, 'F')

        // Border
        doc.setLineWidth(1)
        doc.setDrawColor(200, 200, 200)
        doc.rect(10, 10, width - 20, height - 20)

        doc.setLineWidth(2)
        doc.setDrawColor(227, 38, 54) // #E32636
        doc.rect(12, 12, width - 24, height - 24)

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
            // Educacion (Top Left)
            doc.addImage(logoEducacion, 'PNG', 20, 20, 60, 20, undefined, 'FAST')
            // ITSOEH (Top Right)
            doc.addImage(logoItsoeh, 'PNG', width - 80, 20, 60, 20, undefined, 'FAST')

            // Bottom Logos
            const bottomY = height - 40
            doc.addImage(logoTics, 'PNG', 40, bottomY, 30, 20, undefined, 'FAST')
            doc.addImage(logoRacing, 'PNG', (width / 2) - 15, bottomY, 30, 20, undefined, 'FAST')
            doc.addImage(logoSparko, 'PNG', width - 70, bottomY, 30, 20, undefined, 'FAST')

        } catch (error: any) {
            console.error("Error loading images", error)
        }

        // Fonts
        doc.setFont('times', 'bold')

        // Header Text
        doc.setFontSize(24)
        doc.setTextColor(30, 41, 59)
        doc.text('Instituto Tecnológico Superior del Occidente', width / 2, 60, { align: 'center' })
        doc.text('del Estado de Hidalgo', width / 2, 70, { align: 'center' })

        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.text('A través de la carrera de', width / 2, 85, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text('Ingeniería en Tecnologías de la Información y Comunicaciones', width / 2, 95, { align: 'center' })

        doc.setFont('Outfit', 'normal')
        doc.setFontSize(14)
        doc.text('Reconoce a:', width / 2, 110, { align: 'center' })

        // Name
        doc.setFont('times', 'bolditalic')
        doc.setFontSize(40)
        doc.setTextColor(227, 38, 54) // #E32636
        doc.text(user.name, width / 2, 130, { align: 'center' })
        doc.setLineWidth(0.5)
        doc.setDrawColor(227, 38, 54)
        doc.line((width / 2) - 60, 132, (width / 2) + 60, 132)

        // Description
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(14)
        doc.setTextColor(30, 41, 59)
        doc.text('Por su destacada participación en el', width / 2, 145, { align: 'center' })
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.text('4to Racing Cups', width / 2, 155, { align: 'center' })

        // Date
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text('Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026', width / 2, 175, { align: 'center' })

        if (download) {
            doc.save(`certificado_${user.name.replace(/\s+/g, '_')}.pdf`)
        }
        return doc
    }

    const sendEmail = () => {
        // Mock email sending
        alert(`📧 Certificado enviado por correo a ${certUser?.email}`)
        setIsCertModalOpen(false)
    }

    return (
        <div>
            {/* ... Existing Header ... */}
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Gestión de Usuarios</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Administra usuarios y consulta resultados</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn-admin-login ${activeTab === 'users' ? '' : 'outline'}`}
                        style={{ width: 'auto', padding: '0.5rem 1rem', background: activeTab === 'users' ? '#E32636' : 'transparent', border: activeTab === 'users' ? 'none' : '1px solid #334155' }}
                        onClick={() => setActiveTab('users')}
                    >
                        Usuarios
                    </button>
                    <button
                        className={`btn-admin-login ${activeTab === 'winners' ? '' : 'outline'}`}
                        style={{ width: 'auto', padding: '0.5rem 1rem', background: activeTab === 'winners' ? '#E32636' : 'transparent', border: activeTab === 'winners' ? 'none' : '1px solid #334155' }}
                        onClick={() => setActiveTab('winners')}
                    >
                        Ver Ganadores
                    </button>
                </div>
            </header>

            {activeTab === 'users' ? (
                <>
                    <div className="admin-table-container">
                        <div className="admin-table-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <input
                                type="text"
                                placeholder="Buscar usuario por correo o nombre..."
                                className="admin-input"
                                style={{ width: '350px', padding: '0.5rem 1rem' }}
                            />
                            <button className="btn-admin-login" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={generatePDF}>
                                📄 Generar Reporte PDF
                            </button>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Fecha Registro</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'Administrador' ? '#E32636' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>
                                                    {user.avatar}
                                                </div>
                                                <strong>{user.name}</strong>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.role === 'Administrador' ? <strong>{user.role}</strong> : user.role}</td>
                                        <td>{user.joinedDate}</td>
                                        <td><span className={`status-badge ${user.status === 'Activo' ? 'success' : 'error'}`}>{user.status}</span></td>
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="action-btn" onClick={() => handleEdit(user)}>Editar</button>
                                            <button className="action-btn" onClick={() => handleCertClick(user)} style={{ color: '#3B82F6' }}>Certificado</button>
                                            <button className="action-btn" style={{ color: user.status === 'Activo' ? '#ef4444' : '#10b981' }} onClick={() => handleBlock(user.id)}>
                                                {user.status === 'Activo' ? 'Bloq.' : 'Desbloq.'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* ... Winners Cards ... */}
                    <div className="admin-stat-card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#E32636' }}>🏆 Carrera RC</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#334155', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FFD700' }}>
                                <div style={{ fontWeight: 'bold', color: '#FFD700' }}>1er Lugar</div>
                                <div style={{ fontSize: '1.1rem' }}>Rayo Veloz</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Capitán: Josepo</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #C0C0C0' }}>
                                <div style={{ fontWeight: 'bold', color: '#C0C0C0' }}>2do Lugar</div>
                                <div>Turbo Team</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #CD7F32' }}>
                                <div style={{ fontWeight: 'bold', color: '#CD7F32' }}>3er Lugar</div>
                                <div>Nitro Racers</div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#3B82F6' }}>🤖 Mini Sumo</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#334155', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FFD700' }}>
                                <div style={{ fontWeight: 'bold', color: '#FFD700' }}>1er Lugar</div>
                                <div style={{ fontSize: '1.1rem' }}>Iron Bots</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Capitán: Maria</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #C0C0C0' }}>
                                <div style={{ fontWeight: 'bold', color: '#C0C0C0' }}>2do Lugar</div>
                                <div>Sumo Kings</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #CD7F32' }}>
                                <div style={{ fontWeight: 'bold', color: '#CD7F32' }}>3er Lugar</div>
                                <div>Heavy Metal</div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#10B981' }}>⚽ Robo Fut</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#334155', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FFD700' }}>
                                <div style={{ fontWeight: 'bold', color: '#FFD700' }}>1er Lugar</div>
                                <div style={{ fontSize: '1.1rem' }}>Goal Strikers</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Capitán: Juan</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #C0C0C0' }}>
                                <div style={{ fontWeight: 'bold', color: '#C0C0C0' }}>2do Lugar</div>
                                <div>Robo Kickers</div>
                            </div>
                            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #CD7F32' }}>
                                <div style={{ fontWeight: 'bold', color: '#CD7F32' }}>3er Lugar</div>
                                <div>Future Ball</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Editar Usuario</h2>
                        <form onSubmit={handleSave}>
                            <div className="admin-form-group">
                                <label className="admin-label">Nombre</label>
                                <input
                                    className="admin-input"
                                    value={currentUser.name || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Correo Electrónico</label>
                                <input
                                    className="admin-input"
                                    value={currentUser.email || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Rol</label>
                                <select
                                    className="admin-input"
                                    value={currentUser.role || 'Usuario'}
                                    onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as 'Usuario' | 'Administrador' })}
                                >
                                    <option value="Usuario">Usuario</option>
                                    <option value="Administrador">Administrador</option>
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

            {/* Certificate Preview Modal */}
            {isCertModalOpen && certUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="admin-login-card" style={{ maxWidth: '800px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Vista Previa del Certificado</h2>
                            <button onClick={() => setIsCertModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* CSS Preview of the Certificate (Approximation) */}
                        <div style={{
                            background: '#fff',
                            color: '#1e293b',
                            padding: '3rem',
                            borderRadius: '4px',
                            textAlign: 'center',
                            minHeight: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: '10px solid #fff',
                            boxShadow: '0 0 0 1px #ccc',
                            position: 'relative',
                            fontFamily: "'Outfit', sans-serif"
                        }}>
                            {/* Border Line */}
                            <div style={{
                                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                                border: '2px solid #E32636', pointerEvents: 'none'
                            }}></div>

                            {/* Top Logos */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                                <img src="/logotypes/educacion.png" alt="Educacion" style={{ height: '50px', objectFit: 'contain' }} />
                                <img src="/logotypes/itsoeg.png" alt="ITSOEH" style={{ height: '50px', objectFit: 'contain' }} />
                            </div>

                            <div style={{ marginTop: '1rem', zIndex: 1 }}>
                                <h1 style={{ fontSize: '1.4rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Instituto Tecnológico Superior del Occidente</h1>
                                <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>del Estado de Hidalgo</h2>

                                <p style={{ fontSize: '0.9rem', margin: 0 }}>A través de la carrera de</p>
                                <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Ingeniería en Tecnologías de la Información y Comunicaciones</p>

                                <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Reconoce a:</p>

                                <h3 style={{ fontSize: '2.5rem', color: '#E32636', margin: '0 0 0.5rem 0', fontFamily: "'Racing Sans One', cursive" }}>{certUser.name}</h3>
                                <div style={{ height: '1px', background: '#E32636', width: '40%', margin: '0 auto 1.5rem auto' }}></div>

                                <p style={{ fontSize: '1rem', margin: 0 }}>Por su destacada participación en el</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 1.5rem 0' }}>4to Racing Cups</p>
                            </div>

                            {/* Bottom Logos & Date */}
                            <div style={{ marginBottom: '1rem', zIndex: 1 }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#666' }}>Mixquiahuala de Juárez, Hidalgo a 13 de Marzo de 2026</p>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                                    <img src="/logotypes/tics.png" alt="TICS" style={{ height: '50px', objectFit: 'contain' }} />
                                    <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '60px', objectFit: 'contain' }} />
                                    <img src="/logotypes/sparko.png" alt="Sparko" style={{ height: '50px', objectFit: 'contain' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-admin-login"
                                style={{ background: '#334155', flex: 1 }}
                                onClick={sendEmail}
                            >
                                📧 Enviar por Correo
                            </button>
                            <button
                                className="btn-admin-login"
                                style={{ flex: 1 }}
                                onClick={() => generateCertificatePDF(certUser)}
                            >
                                ⬇️ Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
