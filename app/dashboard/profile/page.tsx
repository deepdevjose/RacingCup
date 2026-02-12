'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import '../dashboard.css'
import { useAuth } from '@/lib/auth-context'
import {
    logoutUser,
    getUserPendingInvites,
    acceptInvite,
    rejectInvite,
    getTeamById,
    getEventById,
    getUserTeams,
    getTeamMembers,
    getProfile,
    updateProfile,
    canUserEditProfile,
    getUserNotifications,
    markNotificationAsRead,
    leaveTeam,
    isGamertagAvailable,
    type Team,
    type Event,
    type TeamInvite,
    type UserProfile,
    type Notification,
    PLAYER_ICONS,
    TEAM_COLORS,
    getMatchesByEvent, // Added import
    type Match, // Added type
} from '@/lib/firebase'

// types for details
interface InviteWithDetails extends TeamInvite {
    team?: Team
    event?: Event
    inviterProfile?: UserProfile
}

interface TeamWithDetails extends Team {
    event?: Event
    memberCount?: number
    isLeader?: boolean
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, profile, loading, refreshProfile } = useAuth()
    const containerRef = useRef(null)

    // Status states
    const [loadingData, setLoadingData] = useState(true)
    const [invites, setInvites] = useState<InviteWithDetails[]>([])
    const [myTeams, setMyTeams] = useState<TeamWithDetails[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [processingInvite, setProcessingInvite] = useState<string | null>(null)
    const [canEdit, setCanEdit] = useState<{ canEdit: boolean; reason?: string }>({ canEdit: true })

    // Matches
    const [matches, setMatches] = useState<Match[]>([])
    const [filterMyMatches, setFilterMyMatches] = useState(true)

    // Tab State
    const [activeTab, setActiveTab] = React.useState('teams')

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        displayName: '',
        gamertag: '',
        school: '',
        educationLevel: '',
        playerIcon: 'user' as typeof PLAYER_ICONS[number],
        playerColor: '#E32636'
    })
    const [gamertagStatus, setGamertagStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
    const [editError, setEditError] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)

    const [teamToLeave, setTeamToLeave] = useState<TeamWithDetails | null>(null)
    const [leavingTeam, setLeavingTeam] = useState(false)

    // Redirection
    useEffect(() => {
        if (!loading && !user) {
            router.push('../')
        }
    }, [user, loading, router])

    // Load Data
    useEffect(() => {
        async function loadData() {
            if (!user) return
            setLoadingData(true)
            try {
                // Pending Invites
                console.log('[Profile] Fetching pending invites...')
                const pendingInvites = await getUserPendingInvites(user.uid)
                console.log('[Profile] ✅ Pending invites fetched:', pendingInvites.length)

                console.log('[Profile] Fetching invite details...')
                const invitesWithDetails = await Promise.all(
                    pendingInvites.map(async (invite) => {
                        const team = invite.teamId ? await getTeamById(invite.teamId) : null
                        const event = invite.eventId ? await getEventById(invite.eventId) : null
                        const inviterProfile = invite.inviterUserId ? await getProfile(invite.inviterUserId) : null
                        return {
                            ...invite,
                            team: team || undefined,
                            event: event || undefined,
                            inviterProfile: inviterProfile || undefined,
                        }
                    })
                )
                console.log('[Profile] ✅ Invite details fetched')
                setInvites(invitesWithDetails)

                // Teams
                console.log('[Profile] Fetching user teams...')
                const allMyTeams = await getUserTeams(user.uid)
                console.log('[Profile] ✅ User teams fetched:', allMyTeams.length)

                console.log('[Profile] Fetching team details...')
                const teamsWithDetails = await Promise.all(
                    allMyTeams.map(async (team) => {
                        const event = team.eventId ? await getEventById(team.eventId) : null
                        const members = team.id ? await getTeamMembers(team.id) : []
                        return {
                            ...team,
                            event: event || undefined,
                            memberCount: members.length,
                            isLeader: team.leaderUserId === user.uid,
                        }
                    })
                )
                console.log('[Profile] ✅ Team details fetched')
                setMyTeams(teamsWithDetails)

                // Notifications
                console.log('[Profile] Fetching notifications...')
                const userNotifications = await getUserNotifications(user.uid)
                console.log('[Profile] ✅ Notifications fetched:', userNotifications.length)
                setNotifications(userNotifications)

                // Matches
                console.log('[Profile] Fetching matches...')
                // 1. Get unique event IDs from my teams
                const myEventIds = Array.from(new Set(teamsWithDetails.map(t => t.eventId)))
                console.log('[Profile] Event IDs:', myEventIds)

                // 2. Fetch matches for all these events
                const allMatches = await Promise.all(
                    myEventIds.map(eventId => getMatchesByEvent(eventId))
                )
                console.log('[Profile] ✅ Matches fetched')

                // 3. Flatten and sort by date/matchNumber
                const flatMatches = allMatches.flat().sort((a, b) => {
                    // Sort by status (InProgress -> Pending -> Completed) or number
                    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
                    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1
                    return a.matchNumber - b.matchNumber
                })

                setMatches(flatMatches)

                // Edit Status
                console.log('[Profile] Checking edit status...')
                const editStatus = await canUserEditProfile(user.uid)
                console.log('[Profile] ✅ Edit status checked:', editStatus)
                setCanEdit(editStatus)

                console.log('[Profile] ✅ All data loaded successfully')

            } catch (err) {
                console.error('[Profile] ❌ Error loading profile data:', err)
                console.error('[Profile] Error details:', {
                    name: (err as Error).name,
                    message: (err as Error).message,
                    stack: (err as Error).stack
                })
            } finally {
                setLoadingData(false)
            }
        }

        if (user) {
            loadData()
        }
    }, [user])

    // Sync Edit Form
    useEffect(() => {
        if (profile) {
            setEditForm({
                displayName: profile.displayName || '',
                gamertag: profile.gamertag || '',
                school: profile.school || '',
                educationLevel: profile.educationLevel || '',
                playerIcon: profile.playerIcon || 'user',
                playerColor: profile.playerColor || '#E32636'
            })
        }
    }, [profile])

    useEffect(() => {
        const checkAvailability = async () => {
            if (editForm.gamertag.length === 8 && user) {
                // If it's the same as the current profile, it's available
                if (editForm.gamertag === profile?.gamertag) {
                    setGamertagStatus('idle')
                    return
                }
                setGamertagStatus('checking')
                const available = await isGamertagAvailable(editForm.gamertag, user.uid)
                setGamertagStatus(available ? 'available' : 'taken')
            } else {
                setGamertagStatus('idle')
            }
        }
        checkAvailability()
    }, [editForm.gamertag, user, profile])

    // GSAP
    useGSAP(() => {
        if (loading || !user || !profile) return
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        tl.from('.profile-header-card', { y: 20, opacity: 0.5, duration: 0.2 })
            .from('.info-card', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
            .from('.dashboard-tabs', { y: 10, opacity: 0, duration: 0.4 }, '-=0.2')
            .from('.content-area-block', { y: 10, opacity: 0, duration: 0.5 }, '-=0.2')
    }, { scope: containerRef, dependencies: [loading, user, profile] })

    // Handlers
    const handleLogout = async () => {
        await logoutUser()
        router.push('/')
    }

    const handleSaveProfile = async () => {
        if (!user || !canEdit.canEdit) return
        if (editForm.gamertag.length !== 8) {
            setEditError("El Gamertag debe tener exactamente 8 caracteres")
            return
        }
        if (gamertagStatus === 'taken') {
            setEditError("Este Gamertag ya está en uso")
            return
        }
        if (gamertagStatus === 'checking') {
            setEditError("Validando disponibilidad del Gamertag...")
            return
        }
        setSavingProfile(true)
        setEditError('')
        try {
            await updateProfile(user.uid, {
                displayName: editForm.displayName,
                gamertag: editForm.gamertag,
                school: editForm.school,
                educationLevel: editForm.educationLevel,
                playerIcon: editForm.playerIcon,
                playerColor: editForm.playerColor,
            })
            await refreshProfile()
            setIsEditModalOpen(false)
        } catch (error) {
            console.error("Error saving profile:", error)
            setEditError("Error al guardar el perfil")
        } finally {
            setSavingProfile(false)
        }
    }

    const handleAcceptInvite = async (inviteId: string) => {
        if (!user) return
        setProcessingInvite(inviteId)
        try {
            await acceptInvite(inviteId, user.uid)
            setInvites(invites.filter(i => i.id !== inviteId))
            // Reload teams
            const allMyTeams = await getUserTeams(user.uid)
            const teamsWithDetails = await Promise.all(
                allMyTeams.map(async (team) => {
                    const event = team.eventId ? await getEventById(team.eventId) : null
                    const members = team.id ? await getTeamMembers(team.id) : []
                    return { ...team, event: event || undefined, memberCount: members.length, isLeader: team.leaderUserId === user.uid }
                })
            )
            setMyTeams(teamsWithDetails)
        } catch (error) {
            console.error("Error accepting invite:", error)
        } finally {
            setProcessingInvite(null)
        }
    }

    const handleRejectInvite = async (inviteId: string) => {
        setProcessingInvite(inviteId)
        try {
            await rejectInvite(inviteId)
            setInvites(invites.filter(i => i.id !== inviteId))
        } catch (error) {
            console.error("Error rejecting invite:", error)
        } finally {
            setProcessingInvite(null)
        }
    }

    const handleMarkNotificationRead = async (notificationId: string) => {
        if (!user) return
        try {
            await markNotificationAsRead(notificationId, user.uid)
            setNotifications(notifications.map(n =>
                n.id === notificationId
                    ? { ...n, readBy: [...(n.readBy || []), user.uid] }
                    : n
            ))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const handleLeaveTeam = async () => {
        if (!user || !teamToLeave?.id) return
        setLeavingTeam(true)
        try {
            await leaveTeam(user.uid, teamToLeave.id)
            setMyTeams(myTeams.filter(t => t.id !== teamToLeave.id))
            setTeamToLeave(null)
        } catch (error) {
            console.error("Error leaving team:", error)
        } finally {
            setLeavingTeam(false)
        }
    }

    // Helper for icons mapping
    const getIconIdx = (iconStr: string) => {
        const idx = PLAYER_ICONS.indexOf(iconStr as any)
        return idx !== -1 ? idx % 10 : 0
    }

    const icons = [
        <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>,
        <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4"></path><path d="M14 12h4"></path><path d="M8 8v8"></path><path d="M16 8v8"></path></svg>,
        <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
        <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>,
        <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>,
        <svg key="6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
        <svg key="7" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>,
        <svg key="8" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        <svg key="9" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
    ]

    if (loading || !user || !profile) {
        return (
            <div className="dashboard-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.readBy?.includes(user.uid)).length

    const renderContent = () => {
        if (loadingData) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div className="loading-spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#E32636', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            )
        }

        switch (activeTab) {
            case 'teams':
                return myTeams.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3 className="empty-title">No tienes equipos</h3>
                        <p className="empty-subtitle">Unete a un evento para crear o unirte a un equipo</p>
                        <Link href="/dashboard/eventos" className="btn btn-primary">
                            + Ver eventos disponibles
                        </Link>
                    </div>
                ) : (
                    <div className="list-container">
                        {myTeams.map(team => (
                            <div key={team.id} className="invitation-item" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '0.7rem', background: team.isConfirmed ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: team.isConfirmed ? '#10B981' : '#F59E0B', padding: '1px 1px', borderRadius: '4px' }}>
                                        {team.isConfirmed ? 'Confirmado' : 'Pendiente'}
                                    </span>
                                    <div className="notif-icon-box" style={{ background: team.color + '20', color: team.color }}>

                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>

                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                            <p className="notif-title">{team.name}</p>
                                            {team.isLeader && <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.2)', color: '#D4AF37', padding: '1px 6px', borderRadius: '4px' }}>Líder</span>}

                                        </div>
                                        <p className="notif-time">{team.event?.name || "Evento"} • {team.memberCount} miembros</p>
                                    </div>
                                </div>
                                <div className="invite-actions">
                                    <button
                                        className="btn-sm"
                                        style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                                        onClick={() => setTeamToLeave(team)}
                                    >
                                        Salir
                                    </button>
                                    <Link href={`/dashboard/equipos/${team.id}`} className="btn-sm btn-accept" style={{ textDecoration: 'none' }}>
                                        Detalles
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            case 'notifications':
                return notifications.length === 0 ? (
                    <p className="empty-subtitle" style={{ textAlign: 'center', padding: '40px' }}>No tienes notificaciones nuevas</p>
                ) : (
                    <div className="list-container">
                        {notifications.map(notif => {
                            const isUnread = !notif.readBy?.includes(user.uid)
                            return (
                                <div key={notif.id} className="notification-item" style={{ borderLeft: isUnread ? '3px solid #E32636' : 'none', background: isUnread ? 'rgba(227,38,54,0.05)' : 'none' }}>
                                    <div className="notif-icon-box" style={{ color: notif.type === 'warning' ? '#F59E0B' : '#3B82F6' }}>
                                        {notif.type === 'warning' ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
                                        )}
                                    </div>
                                    <div className="notif-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p className="notif-title">{notif.title}</p>
                                            {isUnread && (
                                                <button
                                                    onClick={() => handleMarkNotificationRead(notif.id!)}
                                                    style={{ background: 'none', border: 'none', color: '#E32636', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Marcar como leída
                                                </button>
                                            )}
                                        </div>
                                        <p className="notif-subtitle" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0' }}>{notif.message}</p>
                                        <p className="notif-time">{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            case 'invitations':
                return invites.length === 0 ? (
                    <p className="empty-subtitle" style={{ textAlign: 'center', padding: '40px' }}>No tienes invitaciones pendientes</p>
                ) : (
                    <div className="list-container">
                        {invites.map(invite => (
                            <div key={invite.id} className="invitation-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="notif-icon-box" style={{ color: '#F59E0B' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                    </div>
                                    <div>
                                        <p className="notif-title">Invitación a <strong>{invite.team?.name || 'Equipo'}</strong></p>
                                        <p className="notif-time">De: {invite.inviterProfile?.displayName || 'Usuario'} • Evento: {invite.event?.name}</p>
                                    </div>
                                </div>
                                <div className="invite-actions">
                                    <button
                                        className="btn-sm btn-decline"
                                        onClick={() => handleRejectInvite(invite.id!)}
                                        disabled={processingInvite === invite.id}
                                    >
                                        {processingInvite === invite.id ? '...' : 'Rechazar'}
                                    </button>
                                    <button
                                        className="btn-sm btn-accept"
                                        onClick={() => handleAcceptInvite(invite.id!)}
                                        disabled={processingInvite === invite.id}
                                    >
                                        {processingInvite === invite.id ? '...' : 'Aceptar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            case 'matches':
                const myTeamIds = myTeams.map(t => t.id)
                // Filter logic
                const displayedMatches = filterMyMatches
                    ? matches.filter(m => (m.teamAId && myTeamIds.includes(m.teamAId)) || (m.teamBId && myTeamIds.includes(m.teamBId)))
                    : matches

                if (displayedMatches.length === 0) {
                    return (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <h3 className="empty-title">No hay partidos para mostrar</h3>
                            <p className="empty-subtitle">
                                {filterMyMatches ? "Tus equipos no tienen partidos programados en este momento." : "No hay partidos programados en tus eventos."}
                            </p>
                            <div className="filter-toggle-container" style={{ marginTop: '1rem' }}>

                            </div>
                        </div>
                    )
                }

                return (
                    <div className="matches-list-container">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <label className="filter-toggle" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input
                                    type="checkbox"
                                    checked={filterMyMatches}
                                    onChange={(e) => setFilterMyMatches(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#E32636' }}
                                />
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Solo mis equipos</span>
                            </label>
                        </div>

                        <div className="list-container">
                            {displayedMatches.map(match => {
                                // Find team names from myTeams or need another way? 
                                // Actually, matches have IDs. We might strictly need team names.
                                // Since we only fetched myTeams, we don't have ALL team names.
                                // We might need to fetch team details or just show IDs if names missing?
                                // Better: The User wants to see matches. 
                                // In `getMatchesByEvent` we just get match data.
                                // Challenge: We don't have opponent names if they aren't in `myTeams`.
                                // Fix: `getMatchesByEvent` is raw match data.
                                // We might need to fetch public teams or render a placeholder.
                                // For now, let's assume we can survive without names or fetch them?
                                // Actually, `myTeams` has names.
                                // Opponents? We strictly don't know them.
                                // Quick fix: In `loadData`, also fetch `getAllTeams` or `getTeamsByEvent`?
                                // That's heavy.
                                // Let's just show "Equipo [ID]" if unknown or check if `myTeams` covers it.

                                const teamA = myTeams.find(t => t.id === match.teamAId)
                                const teamB = myTeams.find(t => t.id === match.teamBId)
                                // If not found in myTeams, we don't have the name easily.
                                // User request implies seeing matches.
                                // Let's show "Equipo Rival" if name missing?

                                // Actually, we can assume the user cares about THEIR team.
                                // If `teamA` is mine, `teamB` is Rival.

                                const isTeamAMine = !!teamA
                                const isTeamBMine = !!teamB

                                let teamAName = teamA?.name || (match.teamAId ? "Equipo Rival" : "TBD")
                                let teamBName = teamB?.name || (match.teamBId ? "Equipo Rival" : "TBD")

                                if (match.winnerId) {
                                    // Mark winner?
                                }

                                return (
                                    <div key={match.id} className="match-card-item" style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                                            <span>Ronda {match.round} • Partido {match.matchNumber}</span>
                                            <span style={{
                                                color: match.status === 'in_progress' ? '#fbbf24' : match.status === 'completed' ? '#10b981' : 'rgba(255,255,255,0.5)',
                                                fontWeight: 'bold'
                                            }}>
                                                {match.status === 'in_progress' ? 'En Curso' : match.status === 'completed' ? 'Finalizado' : 'Pendiente'}
                                            </span>
                                        </div>

                                        <div className="match-versus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                            {/* Team A */}
                                            <div style={{ flex: 1, textAlign: 'right', opacity: match.winnerId && match.winnerId !== match.teamAId ? 0.5 : 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isTeamAMine ? '#E32636' : '#fff' }}>{teamAName}</div>
                                                {match.status !== 'pending' && <div style={{ fontSize: '1.5rem', fontFamily: "'Racing Sans One', cursive" }}>{match.scoreA || 0}</div>}
                                            </div>

                                            <div style={{ padding: '0 1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>VS</div>

                                            {/* Team B */}
                                            <div style={{ flex: 1, textAlign: 'left', opacity: match.winnerId && match.winnerId !== match.teamBId ? 0.5 : 1 }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isTeamBMine ? '#E32636' : '#fff' }}>{teamBName}</div>
                                                {match.status !== 'pending' && <div style={{ fontSize: '1.5rem', fontFamily: "'Racing Sans One', cursive" }}>{match.scoreB || 0}</div>}
                                            </div>
                                        </div>

                                        {match.winnerId && (
                                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                                                Ganador: {match.winnerId === match.teamAId ? teamAName : teamBName}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="dashboard-layout">
            {/* Extended Navbar */}
            <nav className="dashboard-nav">
                <div className="container nav-content">
                    <Link href="/dashboard" className="nav-logo">
                        <img src="/logotypes/logo.png" alt="Racing Cup" style={{ height: '30px' }} />
                        <span>Racing Cup TICs</span>
                    </Link>

                    <div className="nav-links">
                        <Link href="/dashboard" className="nav-link">Inicio</Link>
                        <Link href="/dashboard/eventos" className="nav-link">Eventos</Link>
                        <Link href="/dashboard/equipos" className="nav-link">Equipos</Link>
                    </div>

                    <Link href="/dashboard/profile" className="nav-user-pill active" style={{ textDecoration: 'none' }}>
                        <div style={{ color: profile.playerColor || 'inherit' }}>
                            {icons[getIconIdx(profile.playerIcon || 'user')]}
                        </div>
                        <div className="pill-content">
                            <span className="pill-gamertag">{profile.gamertag}</span>
                            <span className="pill-subtitle">Ver mi perfil</span>
                        </div>
                    </Link>
                </div>
            </nav>

            <main className="dashboard-main container" ref={containerRef}>
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-banner"></div>
                    <div className="profile-info-row">
                        <div className="profile-identity">
                            <div className="profile-avatar" style={{ color: profile.playerColor || 'inherit' }}>
                                {icons[getIconIdx(profile.playerIcon || 'user')]}
                            </div>
                            <div className="profile-texts">
                                <div className="profile-name-row">
                                    <h1 className="profile-name">{profile.displayName}</h1>
                                    {profile.isTeacher && <span className="badge-docente">Docente</span>}
                                </div>
                                <p className="profile-gamertag">{profile.gamertag}</p>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button className="btn-icon-text" onClick={() => setIsEditModalOpen(true)} disabled={!canEdit.canEdit}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Editar
                            </button>
                            <button className="btn-icon-text" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Salir
                            </button>
                        </div>
                    </div>
                    {!canEdit.canEdit && canEdit.reason && (
                        <div style={{ padding: '0 24px 16px', color: '#F59E0B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {canEdit.reason}
                        </div>
                    )}
                </div>

                {/* Info Grid */}
                <div className="info-grid">
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <div>
                            <p className="info-label">Email</p>
                            <p className="info-value">{profile.email}</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M13 10v11M17 10v11M9 10v11"></path>
                        </svg>
                        <div>
                            <p className="info-label">Escuela</p>
                            <p className="info-value">{profile.school}</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                        </svg>
                        <div>
                            <p className="info-label">Gamertag</p>
                            <p className="info-value">{profile.gamertag}</p>
                        </div>
                    </div>
                    <div className="info-card">
                        <svg className="info-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                        <div>
                            <p className="info-label">Nivel Educativo</p>
                            <p className="info-value">{profile.educationLevel || 'No especificado'}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-bar dashboard-tabs">
                    <button
                        className={`tab-item ${activeTab === 'teams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('teams')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        Mis equipos <span className="tab-count">{myTeams.length}</span>
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Notificaciones {unreadCount > 0 && <span className="tab-count badge-new">{unreadCount}</span>}
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'invitations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invitations')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                        </svg>
                        Invitaciones {invites.length > 0 && <span className="tab-count badge-new">{invites.length}</span>}
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'matches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matches')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <path d="M8 13h2"></path>
                            <path d="M8 17h2"></path>
                            <path d="M14 13h2"></path>
                            <path d="M14 17h2"></path>
                        </svg>
                        Partidos
                    </button>
                </div>

                {/* Content Area */}
                <div className="content-area-block">
                    {renderContent()}
                </div>

            </main>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Editar perfil</h3>
                                <p className="modal-desc">Actualiza tu información personal</p>
                            </div>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre completo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                placeholder="Ingresa tu nombre completo"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gamertag (8 caracteres alfanuméricos)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editForm.gamertag}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
                                        setEditForm({ ...editForm, gamertag: val })
                                    }}
                                    maxLength={8}
                                    style={{
                                        textTransform: 'uppercase',
                                        borderColor: gamertagStatus === 'available' ? '#10B981' : gamertagStatus === 'taken' ? '#EF4444' : 'rgba(255,255,255,0.1)'
                                    }}
                                />
                                {gamertagStatus === 'checking' && (
                                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                        <div className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                    {editForm.gamertag.length}/8 caracteres
                                </small>
                                {gamertagStatus === 'available' && <small style={{ color: '#10B981', fontSize: '0.75rem' }}>Disponible</small>}
                                {gamertagStatus === 'taken' && <small style={{ color: '#EF4444', fontSize: '0.75rem' }}>No disponible</small>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Escuela</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editForm.school}
                                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Icono de jugador</label>
                            <div className="avatar-grid">
                                {PLAYER_ICONS.slice(0, 10).map((iconStr, index) => (
                                    <div
                                        key={iconStr}
                                        className={`avatar-option ${editForm.playerIcon === iconStr ? 'selected' : ''}`}
                                        style={{ color: editForm.playerColor }}
                                        onClick={() => setEditForm({ ...editForm, playerIcon: iconStr })}
                                    >
                                        {icons[index]}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Color del icono</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {TEAM_COLORS.map((c) => (
                                    <div
                                        key={c.value}
                                        onClick={() => setEditForm({ ...editForm, playerColor: c.value })}
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            backgroundColor: c.value,
                                            cursor: 'pointer',
                                            border: editForm.playerColor === c.value ? '3px solid white' : 'none',
                                            boxShadow: editForm.playerColor === c.value ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                                        }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {editError && (
                            <p style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '10px' }}>{editError}</p>
                        )}

                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setIsEditModalOpen(false)}
                                style={{ border: 'none', color: '#ccc' }}
                            >
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                                {savingProfile ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Team Modal */}
            {teamToLeave && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Salir del equipo</h3>
                            <button className="close-btn" onClick={() => setTeamToLeave(null)}>×</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                ¿Estás seguro de que quieres salir del equipo <strong>{teamToLeave.name}</strong>?
                            </p>
                            {teamToLeave.isLeader && (
                                <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '12px' }}>
                                    Aviso: Eres el líder de este equipo. Si sales, el equipo será eliminado y todos los miembros serán removidos.
                                </p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setTeamToLeave(null)} style={{ border: 'none', color: '#ccc' }}>
                                Cancelar
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#EF4444', color: 'white' }}
                                onClick={handleLeaveTeam}
                                disabled={leavingTeam}
                            >
                                {leavingTeam ? 'Saliendo...' : 'Salir del equipo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
