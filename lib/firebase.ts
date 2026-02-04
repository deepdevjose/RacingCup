import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// ==================== TYPES ====================

export type EventStatus = "registro_abierto" | "cerrado" | "en_curso" | "finalizado"
export type InviteStatus = "pending" | "accepted" | "rejected"

// Team icons (20 options)
export const TEAM_ICONS = [
  "robot", "cpu", "zap", "rocket", "target", 
  "shield", "flame", "star", "bolt", "gear",
  "circuit", "chip", "drone", "claw", "laser",
  "antenna", "motor", "wheel", "sensor", "battery"
] as const

// Team colors (6 options)
export const TEAM_COLORS = [
  { name: "Rojo", value: "#DC2626" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#16A34A" },
  { name: "Amarillo", value: "#CA8A04" },
  { name: "Morado", value: "#9333EA" },
  { name: "Cyan", value: "#0891B2" },
] as const

export interface UserProfile {
  userId: string
  email: string
  displayName: string
  gamertag: string
  school: string
  isTeacher: boolean
  createdAt: Date
}

export interface Event {
  id?: string
  name: string
  description: string
  date: Date
  location: string
  format: string
  status: EventStatus
  maxTeamSize: number
  minTeamSize: number
  categories: string[]
  winnersConfirmed: boolean
  firstTeamId?: string
  secondTeamId?: string
  thirdTeamId?: string
  createdAt: Date
}

export interface Team {
  id?: string
  eventId: string
  name: string
  leaderUserId: string
  icon: typeof TEAM_ICONS[number]
  color: string
  inviteCode: string
  seed?: number
  isConfirmed: boolean
  createdAt: Date
}

export interface TeamMember {
  id?: string
  eventId: string
  teamId: string
  userId: string
  inviteStatus: InviteStatus
  joinedAt: Date
}

export interface TeamInvite {
  id?: string
  teamId: string
  eventId: string
  invitedUserId: string
  inviterUserId: string
  status: InviteStatus
  createdAt: Date
}

// ==================== AUTH FUNCTIONS ====================

export async function registerUser(email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(userCredential.user)
  return userCredential.user
}

export async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser)
  }
}

// ==================== PROFILE FUNCTIONS ====================

const profilesCollection = collection(db, "profiles")

export async function createProfile(profile: Omit<UserProfile, "createdAt">): Promise<void> {
  const docRef = doc(db, "profiles", profile.userId)
  await setDoc(docRef, {
    ...profile,
    createdAt: Timestamp.now(),
  })
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, "profiles", userId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    ...convertTimestamps(snapshot.data()),
    userId: snapshot.id,
  } as UserProfile
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, "profiles", userId)
  await updateDoc(docRef, updates)
}

export async function isGamertagAvailable(gamertag: string, excludeUserId?: string): Promise<boolean> {
  const q = query(profilesCollection, where("gamertag", "==", gamertag))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return true
  if (excludeUserId && snapshot.docs.length === 1 && snapshot.docs[0].id === excludeUserId) return true
  return false
}

export async function getProfileByGamertag(gamertag: string): Promise<UserProfile | null> {
  const q = query(profilesCollection, where("gamertag", "==", gamertag))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return {
    ...convertTimestamps(doc.data()),
    userId: doc.id,
  } as UserProfile
}

// ==================== EVENT FUNCTIONS ====================

const eventsCollection = collection(db, "events")

export async function createEvent(event: Omit<Event, "id" | "createdAt" | "winnersConfirmed">): Promise<string> {
  const docRef = await addDoc(eventsCollection, {
    ...event,
    date: Timestamp.fromDate(event.date),
    winnersConfirmed: false,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getAllEvents(): Promise<Event[]> {
  const snapshot = await getDocs(eventsCollection)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Event[]
}

export async function getActiveEvents(): Promise<Event[]> {
  const q = query(eventsCollection, where("status", "in", ["registro_abierto", "en_curso"]))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Event[]
}

export async function getEventById(id: string): Promise<Event | null> {
  const docRef = doc(db, "events", id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data()),
  } as Event
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<void> {
  const docRef = doc(db, "events", id)
  const updateData = { ...updates }
  if (updates.date) {
    (updateData as Record<string, unknown>).date = Timestamp.fromDate(updates.date)
  }
  await updateDoc(docRef, updateData)
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, "events", id)
  await deleteDoc(docRef)
}

// ==================== TEAM FUNCTIONS ====================

const teamsCollection = collection(db, "teams")

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createTeam(
  eventId: string,
  name: string,
  leaderUserId: string,
  icon: typeof TEAM_ICONS[number],
  color: string
): Promise<string> {
  // Check if user already has a team in this event
  const existingTeam = await getUserTeamInEvent(leaderUserId, eventId)
  if (existingTeam) {
    throw new Error("Ya tienes un equipo en este evento")
  }

  const inviteCode = generateInviteCode()
  const docRef = await addDoc(teamsCollection, {
    eventId,
    name,
    leaderUserId,
    icon,
    color,
    inviteCode,
    isConfirmed: false,
    createdAt: Timestamp.now(),
  })

  // Add leader as team member
  await addTeamMember(eventId, docRef.id, leaderUserId, "accepted")

  return docRef.id
}

export async function getTeamById(id: string): Promise<Team | null> {
  const docRef = doc(db, "teams", id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data()),
  } as Team
}

export async function getTeamByInviteCode(code: string): Promise<Team | null> {
  const q = query(teamsCollection, where("inviteCode", "==", code.toUpperCase()))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...convertTimestamps(doc.data()),
  } as Team
}

export async function getTeamsByEvent(eventId: string): Promise<Team[]> {
  const q = query(teamsCollection, where("eventId", "==", eventId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Team[]
}

export async function getConfirmedTeamsByEvent(eventId: string): Promise<Team[]> {
  const q = query(teamsCollection, where("eventId", "==", eventId), where("isConfirmed", "==", true))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Team[]
}

export async function getUserTeamInEvent(userId: string, eventId: string): Promise<Team | null> {
  // First check if user is a member of any team in this event
  const membersCollection = collection(db, "team_members")
  const memberQ = query(
    membersCollection,
    where("userId", "==", userId),
    where("eventId", "==", eventId),
    where("inviteStatus", "==", "accepted")
  )
  const memberSnapshot = await getDocs(memberQ)
  
  if (memberSnapshot.empty) return null
  
  const teamId = memberSnapshot.docs[0].data().teamId
  return getTeamById(teamId)
}

export async function getUserLeadingTeams(userId: string): Promise<Team[]> {
  const q = query(teamsCollection, where("leaderUserId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Team[]
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<void> {
  const docRef = doc(db, "teams", id)
  await updateDoc(docRef, updates)
}

export async function deleteTeam(id: string): Promise<void> {
  // Delete all team members first
  const membersCollection = collection(db, "team_members")
  const q = query(membersCollection, where("teamId", "==", id))
  const snapshot = await getDocs(q)
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref)
  }
  
  // Delete invites
  const invitesCollection = collection(db, "team_invites")
  const inviteQ = query(invitesCollection, where("teamId", "==", id))
  const inviteSnapshot = await getDocs(inviteQ)
  for (const doc of inviteSnapshot.docs) {
    await deleteDoc(doc.ref)
  }
  
  // Delete team
  const docRef = doc(db, "teams", id)
  await deleteDoc(docRef)
}

// ==================== TEAM MEMBER FUNCTIONS ====================

const teamMembersCollection = collection(db, "team_members")

export async function addTeamMember(
  eventId: string,
  teamId: string,
  userId: string,
  status: InviteStatus = "pending"
): Promise<string> {
  const docRef = await addDoc(teamMembersCollection, {
    eventId,
    teamId,
    userId,
    inviteStatus: status,
    joinedAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const q = query(teamMembersCollection, where("teamId", "==", teamId), where("inviteStatus", "==", "accepted"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as TeamMember[]
}

export async function updateMemberStatus(memberId: string, status: InviteStatus): Promise<void> {
  const docRef = doc(db, "team_members", memberId)
  await updateDoc(docRef, { inviteStatus: status })
}

export async function removeMemberFromTeam(memberId: string): Promise<void> {
  const docRef = doc(db, "team_members", memberId)
  await deleteDoc(docRef)
}

// ==================== INVITE FUNCTIONS ====================

const invitesCollection = collection(db, "team_invites")

export async function createInvite(teamId: string, eventId: string, invitedUserId: string, inviterUserId: string): Promise<string> {
  // Check if invite already exists
  const existing = query(
    invitesCollection,
    where("teamId", "==", teamId),
    where("invitedUserId", "==", invitedUserId),
    where("status", "==", "pending")
  )
  const existingSnapshot = await getDocs(existing)
  if (!existingSnapshot.empty) {
    throw new Error("Ya existe una invitacion pendiente para este usuario")
  }

  const docRef = await addDoc(invitesCollection, {
    teamId,
    eventId,
    invitedUserId,
    inviterUserId,
    status: "pending",
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getUserPendingInvites(userId: string): Promise<TeamInvite[]> {
  const q = query(invitesCollection, where("invitedUserId", "==", userId), where("status", "==", "pending"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as TeamInvite[]
}

export async function acceptInvite(inviteId: string, userId: string): Promise<void> {
  const inviteRef = doc(db, "team_invites", inviteId)
  const inviteSnap = await getDoc(inviteRef)
  if (!inviteSnap.exists()) throw new Error("Invitacion no encontrada")

  const invite = inviteSnap.data() as TeamInvite

  // Check if user is leader of another team - if so, delete that team
  const userLeadingTeams = await getUserLeadingTeams(userId)
  const teamsInSameEvent = userLeadingTeams.filter(t => t.eventId === invite.eventId)
  
  for (const team of teamsInSameEvent) {
    if (team.id) await deleteTeam(team.id)
  }

  // Remove user from any other team in this event
  const existingTeam = await getUserTeamInEvent(userId, invite.eventId)
  if (existingTeam) {
    const membersQ = query(
      teamMembersCollection,
      where("userId", "==", userId),
      where("eventId", "==", invite.eventId)
    )
    const membersSnap = await getDocs(membersQ)
    for (const doc of membersSnap.docs) {
      await deleteDoc(doc.ref)
    }
  }

  // Add user to new team
  await addTeamMember(invite.eventId, invite.teamId, userId, "accepted")

  // Update invite status
  await updateDoc(inviteRef, { status: "accepted" })
}

export async function rejectInvite(inviteId: string): Promise<void> {
  const inviteRef = doc(db, "team_invites", inviteId)
  await updateDoc(inviteRef, { status: "rejected" })
}

// ==================== ADMIN FUNCTIONS ====================

export async function confirmTeam(teamId: string): Promise<void> {
  await updateTeam(teamId, { isConfirmed: true })
}

export async function unconfirmTeam(teamId: string): Promise<void> {
  await updateTeam(teamId, { isConfirmed: false })
}

export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await getDocs(teamsCollection)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Team[]
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const snapshot = await getDocs(profilesCollection)
  return snapshot.docs.map((doc) => ({
    ...convertTimestamps(doc.data()),
    userId: doc.id,
  })) as UserProfile[]
}

// ==================== HELPERS ====================

function convertTimestamps(data: DocumentData): DocumentData {
  const result = { ...data }
  for (const key of Object.keys(result)) {
    if (result[key]?.toDate) {
      result[key] = result[key].toDate()
    }
  }
  return result
}

export { db, auth }
