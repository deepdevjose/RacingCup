'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../dashboard.css'
import './equipo-detail.css'

import { useAuth } from '@/lib/auth-context'
import {
    getTeamById,
    getEventById,
    getTeamMembers,
    getProfile,
    getProfileByGamertag,
    createInvite,
    deleteTeam,
    removeMemberFromTeam,
    updateTeamCategories,
    type Team,
    type Event,
    type TeamMember,
    type UserProfile,
    type TeamCategoryEntry,
} from '@/lib/firebase'
import { TeamIcon } from '@/components/tournament/TeamIcon'
import Footer from '@/components/common/Footer'

interface MemberWithProfile extends TeamMember {
    profile?: UserProfile
}

// SVG Icons
const ChevronLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
)

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
)

const CopyIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
)

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

const Share2Icon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
)

const UserPlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
)

const Trash2Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
)

const CrownIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
)

const HashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
)

const AlertCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
)

const LogOutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
)

const BotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
        <circle cx="12" cy="5" r="2"></circle>
        <path d="M12 7v4"></path>
        <line x1="8" y1="16" x2="8" y2="16"></line>
        <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
)

const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
)

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
)

const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path>
    </svg>
)

const Loader2Icon = () => (
    <div className="spinner"></div>
)

// Profile icons fallback helper (matching Navbar)
const profileIcons = [
    <svg key="user" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    <svg key="smile" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
]
const getIconIdx = (iconName: string | undefined) => iconName === 'smile' ? 1 : 0

export default function EquipoDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user, profile, loading: authLoading } = useAuth()
    const [team, setTeam] = useState<Team | null>(null)
    const [event, setEvent] = useState<Event | null>(null)
    const [members, setMembers] = useState<MemberWithProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [inviteGamertag, setInviteGamertag] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteError, setInviteError] = useState('')
    const [inviteSuccess, setInviteSuccess] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [leaving, setLeaving] = useState(false)

    // Categories management
    const [isEditCategoriesOpen, setIsEditCategoriesOpen] = useState(false)
    const [editableCategories, setEditableCategories] = useState<TeamCategoryEntry[]>([])
    const [savingCategories, setSavingCategories] = useState(false)

    // Delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

    const teamId = params.id as string
    const isLeader = user && team?.leaderUserId === user.uid
    const isMember = user && members.some(m => m.userId === user.uid)

    useEffect(() => {
        async function loadTeam() {
            try {
                const teamData = await getTeamById(teamId)
                setTeam(teamData)

                if (teamData) {
                    const eventData = await getEventById(teamData.eventId)
                    setEvent(eventData)

                    const teamMembers = await getTeamMembers(teamId)
                    const membersWithProfiles = await Promise.all(
                        teamMembers.map(async (member) => {
                            const profile = await getProfile(member.userId)
                            return { ...member, profile: profile || undefined }
                        })
                    )
                    setMembers(membersWithProfiles)
                }
            } catch (error) {
                console.error('Error loading team:', error)
            } finally {
                setLoading(false)
            }
        }
        loadTeam()
    }, [teamId])

    const copyInviteCode = () => {
        if (team?.inviteCode) {
            navigator.clipboard.writeText(team.inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleInvite = async () => {
        if (!user || !team || !inviteGamertag.trim()) return

        setInviting(true)
        setInviteError('')
        setInviteSuccess(false)

        try {
            const profile = await getProfileByGamertag(inviteGamertag.toUpperCase())
            if (!profile) {
                setInviteError('Usuario no encontrado')
                setInviting(false)
                return
            }

            if (profile.userId === user.uid) {
                setInviteError('No puedes invitarte a ti mismo')
                setInviting(false)
                return
            }

            await createInvite(teamId, team.eventId, profile.userId, user.uid)
            setInviteSuccess(true)
            setInviteGamertag('')
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al enviar invitacion'
            setInviteError(errorMessage)
        } finally {
            setInviting(false)
        }
    }

    const handleDeleteTeam = async () => {
        if (!team?.id) return
        setDeleting(true)
        try {
            await deleteTeam(team.id)
            router.push('/dashboard/profile')
        } catch (error) {
            console.error('Error deleting team:', error)
            setDeleting(false)
        }
    }

    const handleLeaveTeam = async () => {
        if (!user) return
        setLeaving(true)
        try {
            const memberToRemove = members.find(m => m.userId === user.uid)
            if (memberToRemove?.id) {
                await removeMemberFromTeam(memberToRemove.id)
                router.push('/dashboard/profile')
            }
        } catch (error) {
            console.error('Error leaving team:', error)
            setLeaving(false)
        }
    }

    const openEditCategories = () => {
        setEditableCategories(team?.categories || [])
        setIsEditCategoriesOpen(true)
    }

    const handleAddCategory = () => {
        setEditableCategories([...editableCategories, { category: '', prototypeName: '' }])
    }

    const handleRemoveCategory = (index: number) => {
        setEditableCategories(editableCategories.filter((_, i) => i !== index))
    }

    const handleCategoryChange = (index: number, field: keyof TeamCategoryEntry, value: string) => {
        const updated = [...editableCategories]
        updated[index] = { ...updated[index], [field]: value }
        setEditableCategories(updated)
    }

    const handleSaveCategories = async () => {
        if (!team?.id) return
        setSavingCategories(true)
        try {
            // Filter out empty entries
            const validCategories = editableCategories.filter(c => c.category.trim() && c.prototypeName.trim())
            await updateTeamCategories(team.id, validCategories)
            setTeam({ ...team, categories: validCategories })
            setIsEditCategoriesOpen(false)
        } catch (error) {
            console.error('Error saving categories:', error)
        } finally {
            setSavingCategories(false)
        }
    }

    if (loading || authLoading) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Loader2Icon />
            </div>
        )
    }

    if (!team) {
        return (
            <div className="dashboard-layout">
                <nav className="dashboard-nav">
                    <div className="container nav-content">
                        <Link href="/dashboard" className="nav-logo">
                            <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                            <span>Racing Cup TICs</span>
                        </Link>
                        <div className="nav-links">
                            <Link href="/dashboard" className="nav-link">Inicio</Link>
                            <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                            <Link href="/dashboard/equipos" className="nav-link active">Equipos</Link>
                        </div>
                        {profile && (
                            <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                                <div style={{ color: profile.playerColor || 'inherit', display: 'flex' }}>
                                    {profileIcons[getIconIdx(profile.playerIcon || 'user')]}
                                </div>
                                <div className="pill-content">
                                    <span className="pill-gamertag">{profile.gamertag}</span>
                                    <span className="pill-subtitle">Ver mi perfil</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </nav>

                <main className="dashboard-main container">
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>Equipo no encontrado</h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem' }}>
                            El equipo que buscas no existe o ha sido eliminado
                        </p>
                        <Link href="/dashboard/equipos" className="back-button">
                            <ChevronLeftIcon />
                            Volver a Equipos
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="dashboard-layout">
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="/dashboard" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>
                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link active">Equipos</Link>
                    </div>
                    {profile && (
                        <Link href="/dashboard/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
                            <div style={{ color: profile.playerColor || 'inherit', display: 'flex' }}>
                                {profileIcons[getIconIdx(profile.playerIcon || 'user')]}
                            </div>
                            <div className="pill-content">
                                <span className="pill-gamertag">{profile.gamertag}</span>
                                <span className="pill-subtitle">Ver mi perfil</span>
                            </div>
                        </Link>
                    )}
                </div>
            </nav>

            <main className="dashboard-main container">
                <Link href="/dashboard/equipos" className="back-button">
                    <ChevronLeftIcon />
                    Volver a Equipos
                </Link>

                {/* Team Header */}
                <div className="team-detail-header">
                    <div
                        className="team-banner"
                        style={{
                            background: `linear-gradient(135deg, ${team.color}40 0%, ${team.color}10 100%)`
                        }}
                    />
                    <div className="team-avatar-section">
                        <div
                            className="team-avatar-large"
                            style={{ backgroundColor: team.color + '30' }}
                        >
                            <TeamIcon icon={team.icon} color={team.color} size={48} />
                        </div>
                        <div className="team-header-info">
                            <div className="team-header-title-row">
                                <h1 className="team-detail-name">{team.name}</h1>
                                <div className={`team-status-pill ${team.isConfirmed ? 'is-confirmed' : 'is-pending'}`}>
                                    {team.isConfirmed ? 'Confirmado' : 'Pendiente'}
                                </div>
                            </div>
                            <p className="team-detail-event">{event?.name}</p>
                        </div>
                    </div>
                </div>

                <div className="team-content-grid">
                    {/* Left Column: Members & Actions */}
                    <div className="team-main-column">
                        {/* Team Members */}
                        <div className="info-card-detail">
                            <div className="card-header-row">
                                <UsersIcon />
                                <h2 className="card-title">Miembros del equipo</h2>
                                <div className="team-status-pill is-confirmed" style={{ marginLeft: 'auto' }}>
                                    {members.length} miembros
                                </div>
                            </div>
                            <div className="member-list">
                                {members.map((member) => (
                                    <div key={member.id} className="member-list-item">
                                        <div className="member-avatar">
                                            <UsersIcon />
                                        </div>
                                        <div className="member-info">
                                            <div className="member-name-row">
                                                <p className="member-name">
                                                    {member.profile?.displayName || 'Usuario'}
                                                </p>
                                                {member.userId === team.leaderUserId && (
                                                    <div className="leader-badge">
                                                        <CrownIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="member-gamertag">
                                                {member.profile?.gamertag}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="action-buttons">
                            {isLeader ? (
                                <button className="btn-danger" onClick={() => setIsDeleteModalOpen(true)}>
                                    <Trash2Icon />
                                    Eliminar equipo
                                </button>
                            ) : isMember ? (
                                <button className="btn-secondary" onClick={() => setIsLeaveModalOpen(true)}>
                                    <LogOutIcon />
                                    Salir del equipo
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Right Column: Management Tools */}
                    <div className="team-sidebar-column">
                        {/* Invite Code */}
                        {isLeader && (
                            <div className="info-card-detail">
                                <div className="card-header-row">
                                    <Share2Icon />
                                    <h2 className="card-title">Código de invitación</h2>
                                </div>
                                <p className="card-description">
                                    Comparte este código con otros usuarios para que se unan a tu equipo
                                </p>
                                <div className="invite-code-display">
                                    <input
                                        type="text"
                                        value={team.inviteCode}
                                        readOnly
                                        className="invite-code-input"
                                    />
                                    <button onClick={copyInviteCode} className={`btn-copy ${copied ? 'copied' : ''}`}>
                                        {copied ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Invite by Gamertag */}
                        {isLeader && (
                            <div className="info-card-detail">
                                <div className="card-header-row">
                                    <UserPlusIcon />
                                    <h2 className="card-title">Invitar</h2>
                                </div>
                                <p className="card-description">
                                    Invita a un usuario por su gamertag
                                </p>
                                {inviteError && (
                                    <div className="alert-box error">
                                        <AlertCircleIcon />
                                        <span>{inviteError}</span>
                                    </div>
                                )}
                                {inviteSuccess && (
                                    <div className="alert-box success">
                                        <CheckIcon />
                                        <span>Invitación enviada</span>
                                    </div>
                                )}
                                <div className="invite-form">
                                    <div className="invite-input-wrapper">
                                        <div className="invite-input-icon">
                                            <HashIcon />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Gamertag"
                                            value={inviteGamertag.replace('#', '')}
                                            onChange={(e) => setInviteGamertag('#' + e.target.value.toUpperCase().replace('#', ''))}
                                            className="invite-input"
                                            maxLength={9}
                                        />
                                    </div>
                                    <button
                                        onClick={handleInvite}
                                        disabled={inviteGamertag.length < 3 || inviting}
                                        className="btn-invite"
                                    >
                                        {inviting ? <Loader2Icon /> : <UserPlusIcon />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Team Categories & Prototypes */}
                        <div className="info-card-detail">
                            <div className="categories-header">
                                <div className="card-header-row">
                                    <BotIcon />
                                    <h2 className="card-title">Categorías</h2>
                                </div>
                                {isLeader && (
                                    <button className="btn-edit-categories" onClick={openEditCategories}>
                                        <SettingsIcon />
                                    </button>
                                )}
                            </div>

                            {(!team.categories || team.categories.length === 0) ? (
                                <div className="empty-categories">
                                    <p className="empty-categories-text">Sin categorías</p>
                                    {isLeader && (
                                        <button className="btn-edit-categories" onClick={openEditCategories} style={{ width: '100%', justifyContent: 'center' }}>
                                            Agregar
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="categories-list">
                                    {team.categories.map((entry, index) => (
                                        <div key={index} className="category-entry">
                                            <div
                                                className="category-icon-box"
                                                style={{ backgroundColor: team.color + '20', width: '36px', height: '36px' }}
                                            >
                                                <BotIcon />
                                            </div>
                                            <div className="category-info">
                                                <p className="category-prototype-name" style={{ fontSize: '0.9rem' }}>{entry.prototypeName}</p>
                                                <p className="category-name" style={{ fontSize: '0.75rem' }}>{entry.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>


            {/* Delete Team Modal */}
            {
                isDeleteModalOpen && (
                    <div className="modal-overlay">
                        <div
                            className="modal-backdrop-layer"
                            onClick={() => !deleting && setIsDeleteModalOpen(false)}
                        />
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Eliminar equipo</h3>
                                <p className="modal-description">
                                    Esta acción no se puede deshacer. Se eliminarán todos los miembros e invitaciones del equipo.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={deleting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={handleDeleteTeam}
                                    disabled={deleting}
                                >
                                    {deleting ? <Loader2Icon /> : <><Trash2Icon /> Eliminar</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Leave Team Modal */}
            {
                isLeaveModalOpen && (
                    <div className="modal-overlay">
                        <div
                            className="modal-backdrop-layer"
                            onClick={() => !leaving && setIsLeaveModalOpen(false)}
                        />
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Salir del equipo</h3>
                                <p className="modal-description">
                                    ¿Estás seguro de que quieres salir de este equipo?
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsLeaveModalOpen(false)}
                                    disabled={leaving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={handleLeaveTeam}
                                    disabled={leaving}
                                >
                                    {leaving ? <Loader2Icon /> : <><LogOutIcon /> Salir</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Categories Modal */}
            {
                isEditCategoriesOpen && (
                    <div className="modal-overlay" onClick={() => !savingCategories && setIsEditCategoriesOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Editar Categorías y Prototipos</h3>
                                <p className="modal-description">
                                    Agrega las categorías en las que participará tu equipo y el nombre de cada robot o prototipo
                                </p>
                            </div>
                            <div className="modal-body">
                                <div className="category-editor-list">
                                    {editableCategories.map((entry, index) => (
                                        <div key={index} className="category-editor-item">
                                            <div className="category-editor-inputs">
                                                <input
                                                    type="text"
                                                    placeholder="Categoría (ej: Seguidor de línea)"
                                                    value={entry.category}
                                                    onChange={(e) => handleCategoryChange(index, 'category', e.target.value)}
                                                    className="category-editor-input"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre del robot/prototipo"
                                                    value={entry.prototypeName}
                                                    onChange={(e) => handleCategoryChange(index, 'prototypeName', e.target.value)}
                                                    className="category-editor-input"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCategory(index)}
                                                className="btn-remove-category"
                                            >
                                                <XIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddCategory} className="btn-add-category">
                                    <PlusIcon />
                                    Agregar categoría
                                </button>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsEditCategoriesOpen(false)}
                                    disabled={savingCategories}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-invite"
                                    onClick={handleSaveCategories}
                                    disabled={savingCategories}
                                >
                                    {savingCategories ? <Loader2Icon /> : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
