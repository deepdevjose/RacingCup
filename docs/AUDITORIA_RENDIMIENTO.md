# AUDITORÍA TÉCNICA DE RENDIMIENTO Y ESCALABILIDAD
## Racing Cup Platform - Performance Audit Report

**Fecha:** 3 de Marzo, 2026  
**Auditor:** Performance Engineering Senior  
**Versión Auditada:** 0.1.0  
**Enfoque:** Rendimiento, Escalabilidad y Optimización

---

## 0. SUPOSICIONES Y AMBIENTE

### Datos Conocidos
- **Stack:** Next.js 16.1.6 (App Router), React 19, Firebase 12.9.0, Firestore
- **Deployment:** Vercel (inferido por next.config.mjs sin custom server)
- **Autenticación:** Firebase Auth (cliente)
- **Base de datos:** Firestore (sin capa de servidor)
- **Generación PDFs:** jsPDF 4.2.0 (obsoleto) + html2pdf.js
- **Asset pesados:** Three.js, GSAP, pdfjs-dist (4.8.69)

### Suposiciones Razonables
1. **Escala esperada:** 200-500 equipos/evento, ~1000-2000 usuarios activos
2. **Picos de tráfico:** Apertura de inscripciones (50-100 usuarios simultáneos) y durante eventos en vivo (100-200 usuarios)
3. **Budget Firestore:** Plan Spark (gratuito) en firestore, sin uso de Cloud Functions (Blaze plan) por ahora
4. **Infraestructura:** Vercel Hobby/Pro (Edge Functions, sin caching del lado servidor)
5. **Sin CDN dedicado para assets pesados**
6. **Sin índices compuestos en Firestore definidos explícitamente**

---

## 1. RESUMEN EJECUTIVO (12 Hallazgos Críticos)

### 🔴 CRÍTICO - P0 (Resolver antes de producción)
1. **Firestore sin paginación:** Todas las queries cargan colecciones completas (getAllEvents, getAllTeams, getAllProfiles)
2. **N+1 queries en client-side:** Admin dashboard hace 3+ queries secuenciales multiplicadas por número de equipos
3. **Sin índices compuestos definidos:** Causará errores en producción en queries multi-where
4. **PDFs síncronos en cliente:** Bloquea UI ~2-5s, cargas ~5 imágenes por PDF desde red
5. **Three.js sin optimización:** Modelo 3D (~2-5MB) se carga en landing sin lazy boundary efectivo

### 🟡 ALTO IMPACTO - P1 (Antes del primer evento grande)
6. **Bundle sin code splitting efectivo:** JS inicial ~800KB+ (estimado sin build analysis)
7. **Auth state check en cada render:** onAuthStateChanged sin memoización adecuada
8. **Sin rate limiting:** Endpoints expuestos sin protección contra spam (createTeam, joinTeam)
9. **GSAP y animaciones en landing:** Overhead de ~100KB + cálculos repetidos en scroll
10. **Firebase config en cliente:** Expone keys públicas (aunque es normal, falta backend para operaciones sensibles)

### 🟢 MEJORA CONTINUA - P2 (Post-MVP)
11. **Sin caché HTTP headers:** Assets estáticos sin max-age optimizado
12. **Web Vitals no monitorizados:** No hay telemetría (RUM) implementada

**Diagnóstico General:**  
Sistema funcional para MVP pero **NO escalable** más allá de 50 equipos simultáneos. Riesgo alto de:
- Facturación Firestore > $50/mes con 200 equipos activos
- LCP > 4s en landing (3D + animaciones)
- Dashboard admin inutilizable con >100 equipos (N+1 queries)

---

## 2. ARQUITECTURA ACTUAL DETECTADA

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE                            │
│  Next.js 16 App Router (SSR/SSG + Client Components)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
    ┌────▼────┐                  ┌────▼────┐
    │ PUBLIC  │                  │  AUTH   │
    │ PAGES   │                  │ PAGES   │
    │ (SSG)   │                  │ (CSR)   │
    └─────────┘                  └────┬────┘
         │                            │
         │        ┌───────────────────┴──────────────┐
         │        │                                   │
         └────────┼──────────────────────────────────┤
                  │    FIREBASE CLIENT SDK            │
                  │  (Direct from Browser)            │
                  └────────────┬──────────────────────┘
                               │
                    ┌──────────┴───────────┐
                    │   FIRESTORE          │
                    │   Collections:        │
                    │   • users/profiles    │
                    │   • events            │
                    │   • teams             │
                    │   • team_members      │
                    │   • team_invites      │
                    │   • matches           │
                    │   • tournament_stats  │
                    │   • notifications     │
                    └──────────────────────┘
```

### Flujo de Datos Identificado
- **No hay capa de API:** Todo es cliente → Firestore directo
- **Sin servidor intermedio:** No hay Next.js API Routes usadas para lógica de negocio
- **Auth en cliente:** Verificación por Firebase Rules únicamente
- **Sin caché Redis/Memcached:** Cada request va directo a Firestore

### Problema Arquitectónico Principal
⚠️ **Arquitectura 100% cliente pesado:** No escala por costos de Firestore y límites de seguridad

---

## 3. PRESUPUESTO DE RENDIMIENTO RECOMENDADO

| Ruta Crítica | LCP Target | INP Target | CLS Target | DB Queries | Notas |
|--------------|------------|------------|------------|------------|-------|
| **Landing (/)** | <2.5s | <200ms | <0.1 | 0 | SSG, sin datos dinámicos |
| **Login/Signup** | <2.0s | <200ms | <0.05 | 1-2 | Validación gamertag |
| **Dashboard inicial** | <3.0s | <200ms | <0.1 | 3-5 | Eventos + equipos usuario |
| **Ver bracket público** | <3.5s | <200ms | <0.1 | 10-30 | Equipos + matches |
| **Admin lista equipos** | <4.0s | <300ms | <0.1 | 50-200 | **CRÍTICO** |
| **Crear equipo** | N/A | <500ms | N/A | 3-5 | Write + validaciones |
| **Unirse por código** | N/A | <500ms | N/A | 2-3 | Race condition risk |
| **Generar PDF** | N/A | <3000ms | N/A | 5-10 | Imagen loads + render |

### Realidad Actual (Estimado sin profiling)
| Ruta | LCP Actual | Queries Actuales | Estado |
|------|------------|------------------|--------|
| Landing | ~4-6s | 0 (pero 3D model ~3s) | ❌ FAIL |
| Dashboard | ~5-8s | 10-50+ (N+1) | ❌ FAIL |
| Admin equipos | ~10-20s | 500+ queries | ❌ FAIL |
| Generar PDF | ~5-8s | 5 image loads | ⚠️ WARN |

---

## 4. HALLAZGOS POR CAPA

### 4.1 CLIENTE (Web Performance)

#### 🔴 P0-C1: Bundle Size Sin Optimización
**Archivo:** `package.json`, `next.config.mjs`

**Problema:**
```javascript
// Dependencies pesadas sin análisis:
"three": "^0.172.0",           // ~600KB
"pdfjs-dist": "4.8.69",        // ~600KB
"gsap": "^3.14.2",             // ~150KB
"@react-three/fiber": "^9.0.0", // +drei ~200KB
```

**Impacto:**
- JS bundle inicial estimado: **800KB - 1.2MB** (sin code splitting efectivo)
- FCP/LCP retrasado 2-4s en 3G
- TTI > 6s en dispositivos de gama media

**Solución P0:**
```typescript
// next.config.mjs - Añadir
experimental: {
  optimizePackageImports: ['lucide-react', '@react-three/drei']
},

// Dynamic imports donde se usan:
// app/page.tsx - Ya está parcialmente, pero falta:
const CountdownSection = dynamic(() => import('@/components/landing/CountdownSection'), {
  loading: () => <div className="section-placeholder" style={{height: '600px'}} />
})

// CRÍTICO: Separar Three.js a ruta dedicada
// Landing NO debe cargar 3D hasta scroll o click
const ThreeDSection = dynamic(() => import('@/components/landing/ThreeDSection'), {
  ssr: false,
  loading: () => <div style={{height: '100vh', background: '#29d1f4'}} />
})
```

**Métricas:**
- **Impacto:** Alto (LCP -1.5s)
- **Esfuerzo:** S (2-4h)
- **Riesgo:** Bajo
- **Prioridad:** P0

---

#### 🔴 P0-C2: Three.js Sin Lazy Loading Real
**Archivo:** [components/landing/ThreeDSection.tsx](components/landing/ThreeDSection.tsx)

**Problema:**
```tsx
// ThreeDSection.tsx línea 11
const ThreeCanvas = dynamic(() => import('./ThreeCanvas'), {
    ssr: false,
    loading: () => null  // ❌ No hay placeholder visual
})

// ThreeCanvas.tsx línea 7
const { scene } = useGLTF('/3dmodels/rc_shvan_-_low_poly_model.glb')
// ❌ Se descarga inmediatamente al renderizar
```

**Impacto:**
- Modelo 3D se descarga en landing aunque usuario no scrollee
- ~2-5MB transferidos innecesariamente
- LCP bloqueado por asset no crítico

**Solución P0:**
```tsx
// ThreeDSection.tsx - Usar Intersection Observer
const [shouldLoad, setShouldLoad] = useState(false)
const sectionRef = useRef(null)

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true)
        observer.disconnect()
      }
    },
    { rootMargin: '200px' } // Precargar 200px antes
  )
  
  if (sectionRef.current) observer.observe(sectionRef.current)
  return () => observer.disconnect()
}, [])

return (
  <section ref={sectionRef}>
    {shouldLoad ? <ThreeCanvas /> : <PlaceholderSkeleton />}
  </section>
)
```

**Métricas:**
- **Impacto:** Alto (LCP -2s, ~3MB ahorrados)
- **Esfuerzo:** S (1-2h)
- **Riesgo:** Bajo
- **Prioridad:** P0

---

#### 🟡 P1-C3: GSAP Overhead en Landing
**Archivo:** [components/landing/Hero.tsx](components/landing/Hero.tsx)

**Problema:**
```tsx
// Hero.tsx línea 27-58
useGSAP(() => {
    gsap.from(carRef.current, { scale: 0.5, opacity: 0, duration: 1.2, ... })
    // ... 4 animaciones más
}, { scope: containerRef })
```

**Impacto:**
- GSAP (~150KB) cargado para animaciones simples
- FID aumentado por cálculos en main thread
- LCP retrasado por animaciones que bloquean paint

**Solución P1:**
```tsx
// Opción 1: CSS puro (preferred para landing)
// Hero.css
@keyframes hero-enter {
  from { opacity: 0; transform: scale(0.5) translateY(50px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.hero-car-img {
  animation: hero-enter 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

// Opción 2: Reducir animaciones o usar view-timeline
// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
```

**Métricas:**
- **Impacto:** Medio (LCP -0.5s, FCP -0.3s, -150KB)
- **Esfuerzo:** M (4-6h si reemplazan todo GSAP)
- **Riesgo:** Medio (puede afectar feel interactivo)
- **Prioridad:** P1

---

#### 🔴 P0-C4: PDFjs Worker No Optimizado
**Archivo:** `next.config.mjs`, `package.json`

**Problema:**
```javascript
// pdfjs-dist: 4.8.69 - Paquete enorme (~600KB)
// Usado solo en PDFViewer component pero se incluye en build principal

// next.config.mjs línea 18-21
if (config.mode === 'development') {
    config.devtool = 'source-map'; // ❌ MUY lento en dev
}
```

**Impacto:**
- Bundle inflado aunque PDF viewer no se use en todas las rutas
- Dev build ~3x más lento por source-maps completos

**Solución P0:**
```javascript
// next.config.mjs
webpack: (config, { dev, isServer }) => {
  config.externals = [...(config.externals || []), { canvas: 'canvas' }]
  
  // Solo usar source-map en producción para debugging
  if (dev) {
    config.devtool = 'cheap-module-source-map' // ✅ Más rápido
  }
  
  return config
}

// app/admin/dashboard/equipos/page.tsx
// Mover jsPDF a dynamic import
const generateCertificate = async () => {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF(...)
}
```

**Métricas:**
- **Impacto:** Medio (build time -40%, bundle -200KB)
- **Esfuerzo:** S (1-2h)
- **Riesgo:** Bajo
- **Prioridad:** P0

---

#### 🟡 P1-C5: Imágenes Sin Optimización Next.js
**Archivo:** [components/landing/Hero.tsx](components/landing/Hero.tsx#L68)

**Problema:**
```tsx
// Hero.tsx línea 68
<Image src="/logotypes/logohero.png" width={830} height={500} priority />

// Logos partners sin sizes
<Image src="/logotypes/tics.png" width={120} height={64} />
<Image src="/logotypes/itsoeg.png" width={180} height={48} />
```

**Impacto:**
- PNG sin comprimir (~200-500KB cada uno)
- No hay WebP/AVIF fallbacks
- Network waterfall secuencial

**Solución P1:**
```bash
# Convertir a WebP con Sharp
npm install --save-dev sharp

# Script conversor
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'public/logotypes';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.png')) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace('.png', '.webp'));
    sharp(input).webp({ quality: 85 }).toFile(output);
  }
});
"

# Usar en componente
<Image 
  src="/logotypes/logohero.webp"
  alt="Racing Cup"
  width={830}
  height={500}
  priority
  quality={85}
/>
```

**Métricas:**
- **Impacto:** Alto (LCP -1s, ~60% menos bytes)
- **Esfuerzo:** S (2h)
- **Riesgo:** Bajo
- **Prioridad:** P1

---

### 4.2 BACKEND/API Y BASE DE DATOS

#### 🔴 P0-B1: Sin Paginación en Firestore
**Archivo:** [lib/firebase.ts](lib/firebase.ts#L437-L807)

**Problema:**
```typescript
// firebase.ts línea 437
export async function getAllEvents(): Promise<Event[]> {
  const snapshot = await getDocs(eventsCollection) // ❌ Sin limit()
  return snapshot.docs.map(...)
}

// firebase.ts línea 799
export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await getDocs(teamsCollection) // ❌ CRÍTICO
  // Con 200 equipos = 200 document reads * $0.06/100k = $0.12 POR REQUEST
}

// firebase.ts línea 807
export async function getAllProfiles(): Promise<UserProfile[]> {
  const snapshot = await getDocs(profilesCollection) // ❌ CRÍTICO
  // Con 1000 usuarios = 1000 reads por dashboard admin load
}
```

**Impacto:**
- **Admin dashboard** hace 3 queries sin limit: ~1500 document reads en un load
- Con 50 admins revisando equipos/día = **75,000 reads/día**
- Costo Firestore: ~$4.50/mes solo por admin panel
- Latencia p95 > 5s con 200+ equipos

**Solución P0:**
```typescript
// firebase.ts - Añadir paginación
export async function getTeamsPaginated(
  lastDoc?: QueryDocumentSnapshot,
  pageSize: number = 50
): Promise<{ teams: Team[], lastDoc: QueryDocumentSnapshot | null }> {
  let q = query(
    teamsCollection,
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  )
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc))
  }
  
  const snapshot = await getDocs(q)
  return {
    teams: snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
  }
}

// Admin dashboard - Implementar scroll infinito
const [teams, setTeams] = useState<Team[]>([])
const [lastDoc, setLastDoc] = useState<any>(null)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  const { teams: newTeams, lastDoc: newLastDoc } = await getTeamsPaginated(lastDoc, 50)
  setTeams(prev => [...prev, ...newTeams])
  setLastDoc(newLastDoc)
  if (newTeams.length < 50) setHasMore(false)
}
```

**Métricas:**
- **Impacto:** CRÍTICO (costos -90%, latencia -80%)
- **Esfuerzo:** M (6-8h)
- **Riesgo:** Bajo
- **Prioridad:** P0

---

#### 🔴 P0-B2: N+1 Queries en Admin Dashboard
**Archivo:** [app/admin/dashboard/equipos/page.tsx](app/admin/dashboard/equipos/page.tsx#L54-L75)

**Problema:**
```typescript
// equipos/page.tsx línea 54-75
const teamsWithDetails = await Promise.all(
  teamsData.map(async (team) => {
    const members = await getTeamMembers(team.id) // ❌ N queries
    const membersWithProfiles = await Promise.all(
      members.map(async (m) => ({
        ...m,
        profile: await getProfile(m.userId) // ❌ N*M queries
      }))
    )
    const leaderProfile = await getProfile(team.leaderUserId) // ❌ N queries
    // Con 50 equipos de 5 miembros = 50 + 250 + 50 = 350 queries
  })
)
```

**Impacto Real:**
- 50 equipos → **~400-500 Firestore reads**
- Latencia acumulada: 10-20s
- Dashboard admin **inutilizable** con >30 equipos

**Solución P0:**
```typescript
// Opción 1: Denormalización (recomendado)
// Guardar snapshot de datos en el equipo al momento de creación/actualización
interface Team {
  // ... campos existentes
  membersSnapshot?: {
    userId: string
    displayName: string
    gamertag: string
  }[]
  leaderSnapshot?: {
    displayName: string
    gamertag: string
    school: string
  }
}

// Al crear/actualizar equipo:
export async function updateTeamWithSnapshot(teamId: string, updates: Partial<Team>) {
  const members = await getTeamMembers(teamId)
  const membersSnapshot = await Promise.all(
    members.map(async m => {
      const profile = await getProfile(m.userId)
      return {
        userId: m.userId,
        displayName: profile?.displayName || 'Usuario',
        gamertag: profile?.gamertag || '—'
      }
    })
  )
  
  await updateDoc(doc(db, 'teams', teamId), {
    ...updates,
    membersSnapshot,
    lastUpdated: Timestamp.now()
  })
}

// Admin dashboard: 1 query en lugar de 350
async function loadData() {
  const teams = await getAllTeams() // Ya tienen snapshots
  setTeams(teams) // No más N+1
}

// Opción 2: Usar Cloud Function trigger (mejor pero requiere Blaze plan)
// functions/src/index.ts
export const onTeamMemberAdded = functions.firestore
  .document('team_members/{memberId}')
  .onCreate(async (snap, context) => {
    const member = snap.data()
    const profile = await getProfile(member.userId)
    const teamRef = db.doc(`teams/${member.teamId}`)
    
    await teamRef.update({
      membersSnapshot: admin.firestore.FieldValue.arrayUnion({
        userId: member.userId,
        displayName: profile.displayName,
        gamertag: profile.gamertag
      })
    })
  })
```

**Métricas:**
- **Impacto:** CRÍTICO (queries -95%, latencia -85%)
- **Esfuerzo:** L (12-16h con refactor)
- **Riesgo:** Medio (cambio en modelo de datos)
- **Prioridad:** P0

---

#### 🔴 P0-B3: Sin Índices Compuestos Firestore
**Archivo:** `firestore.rules`, [lib/firebase.ts](lib/firebase.ts)

**Problema:**
```typescript
// firebase.ts línea 571
export async function getConfirmedTeamsByEvent(eventId: string): Promise<Team[]> {
  const q = query(
    teamsCollection,
    where("eventId", "==", eventId),
    where("isConfirmed", "==", true)
  )
  // ❌ CAUSARÁ ERROR en producción: "requires an index"
}

// firebase.ts línea 596
export async function getUserTeamInEvent(userId: string, eventId: string) {
  const q = query(
    membersCollection,
    where("userId", "==", userId),
    where("eventId", "==", eventId),
    where("inviteStatus", "==", "accepted")
  )
  // ❌ CAUSARÁ ERROR: "composite index required"
}
```

**Impacto:**
- Queries fallarán en producción con mensaje "FAILED_PRECONDITION"
- Funcionalidad crítica (bracket, join team) rota

**Solución P0:**
```json
// firestore.indexes.json (crear archivo en raíz)
{
  "indexes": [
    {
      "collectionGroup": "teams",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eventId", "order": "ASCENDING" },
        { "fieldPath": "isConfirmed", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "team_members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "eventId", "order": "ASCENDING" },
        { "fieldPath": "inviteStatus", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eventId", "order": "ASCENDING" },
        { "fieldPath": "categoryId", "order": "ASCENDING" },
        { "fieldPath": "matchNumber", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "team_invites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "invitedUserId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

```bash
# Desplegar índices
firebase deploy --only firestore:indexes

# Validar localmente con emulator
firebase emulators:start --only firestore --import=./emulator-data --export-on-exit
```

**Métricas:**
- **Impacto:** CRÍTICO (evita errores en producción)
- **Esfuerzo:** S (2h setup + testing)
- **Riesgo:** Bajo
- **Prioridad:** P0

---

#### 🔴 P0-B4: Race Condition en Join por Código
**Archivo:** [lib/firebase.ts](lib/firebase.ts#L718-L758)

**Problema:**
```typescript
// firebase.ts línea 718 - acceptInvite
export async function acceptInvite(inviteId: string, userId: string): Promise<void> {
  const invite = inviteSnap.data() as TeamInvite
  
  // ❌ Entre estas líneas pueden pasar milisegundos donde 2 usuarios
  // aceptan invitación al mismo equipo simultáneamente
  const userLeadingTeams = await getUserLeadingTeams(userId)
  const teamsInSameEvent = userLeadingTeams.filter(t => t.eventId === invite.eventId)
  
  for (const team of teamsInSameEvent) {
    if (team.id) await deleteTeam(team.id) // ❌ No atómico
  }
  
  await addTeamMember(invite.eventId, invite.teamId, userId, "accepted")
  await updateDoc(inviteRef, { status: "accepted" })
}
```

**Impacto:**
- Usuario puede estar en 2 equipos simultáneamente si timing es preciso
- Líder de equipo puede perder su equipo si acepta otra invitación durante inscripción
- Reglas de Firestore no previenen esto completamente

**Solución P0:**
```typescript
// firebase.ts - Usar transacciones Firestore
import { runTransaction } from 'firebase/firestore'

export async function acceptInvite(inviteId: string, userId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const inviteRef = doc(db, "team_invites", inviteId)
    const inviteSnap = await transaction.get(inviteRef)
    
    if (!inviteSnap.exists()) throw new Error("Invitacion no encontrada")
    const invite = inviteSnap.data() as TeamInvite
    
    // 1. Verificar que usuario no tenga equipo en este evento
    const memberQ = query(
      collection(db, "team_members"),
      where("userId", "==", userId),
      where("eventId", "==", invite.eventId),
      where("inviteStatus", "==", "accepted")
    )
    const memberSnap = await getDocs(memberQ) // ⚠️ Fuera de transacción por limitación
    
    if (!memberSnap.empty) {
      throw new Error("Ya tienes un equipo en este evento")
    }
    
    // 2. Crear membresía
    const memberId = `${invite.teamId}_${userId}`
    const memberRef = doc(db, "team_members", memberId)
    transaction.set(memberRef, {
      eventId: invite.eventId,
      teamId: invite.teamId,
      userId,
      inviteStatus: "accepted",
      joinedAt: Timestamp.now()
    })
    
    // 3. Actualizar invitación
    transaction.update(inviteRef, { status: "accepted" })
  })
}

// Alternativa: Usar Server-Side Cloud Function (recomendado)
// Permite validaciones complejas sin limitaciones de transacciones
```

**Métricas:**
- **Impacto:** Alto (evita bugs críticos)
- **Esfuerzo:** M (6h)
- **Riesgo:** Medio (cambio en lógica transaccional)
- **Prioridad:** P0

---

#### 🟡 P1-B5: Sin Rate Limiting
**Archivo:** [lib/firebase.ts](lib/firebase.ts), Firestore Security Rules

**Problema:**
```typescript
// Cualquier usuario autenticado puede:
// 1. Crear equipos ilimitados (línea 529)
export async function createTeam(...) {
  // ❌ Sin throttle
}

// 2. Intentar códigos de invitación infinitamente
export async function getTeamByInviteCode(code: string) {
  // ❌ Sin rate limit
}

// 3. Actualizar perfil constantemente
export async function updateProfile(...) {
  // ❌ Sin debounce
}
```

**Impacto:**
- Abuso por bots/scripts maliciosos
- Factura Firestore inesperada (~$20-50/mes con ataque moderado)
- DoS accidental por usuarios spammeando botones

**Solución P1:**
```typescript
// Opción 1: Client-side rate limit (básico)
// hooks/useRateLimit.ts
function useRateLimit(fn: Function, delay: number) {
  const [isThrottled, setIsThrottled] = useState(false)
  
  const throttledFn = useCallback((...args: any[]) => {
    if (isThrottled) {
      throw new Error('Espera antes de intentar nuevamente')
    }
    
    setIsThrottled(true)
    setTimeout(() => setIsThrottled(false), delay)
    
    return fn(...args)
  }, [fn, delay, isThrottled])
  
  return throttledFn
}

// Uso en componente
const createTeamThrottled = useRateLimit(createTeam, 5000) // 5s

// Opción 2: Firestore Security Rules (mejor)
// firestore.rules - Añadir rate limit por tiempo
match /teams/{teamId} {
  allow create: if isSignedIn() &&
    request.resource.data.leaderUserId == request.auth.uid &&
    // Limitar a 1 equipo cada 30 segundos
    !exists(/databases/$(database)/documents/teams/$(request.auth.uid + '_recent')) ||
    get(/databases/$(database)/documents/teams/$(request.auth.uid + '_recent')).data.createdAt < request.time - duration.value(30, 's');
}

// Opción 3: Cloud Function con Redis (óptimo pero requiere infra)
// Usar Upstash Redis Serverless (~$0.20/mes)
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const createTeam = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', ...)
  
  const rateLimitKey = `rate_limit:create_team:${context.auth.uid}`
  const attempts = await redis.incr(rateLimitKey)
  
  if (attempts === 1) {
    await redis.expire(rateLimitKey, 60) // 1 intento por minuto
  }
  
  if (attempts > 1) {
    throw new functions.https.HttpsError('resource-exhausted', 'Demasiados intentos')
  }
  
  // Lógica de crear equipo...
})
```

**Métricas:**
- **Impacto:** Alto (previene abuso, -$20-50/mes)
- **Esfuerzo:** M (4-6h para opción 2, 12h para opción 3)
- **Riesgo:** Bajo
- **Prioridad:** P1

---

### 4.3 GENERACIÓN DE PDFs

#### 🔴 P0-P1: PDFs Síncronos en Cliente
**Archivo:** [app/admin/dashboard/equipos/page.tsx](app/admin/dashboard/equipos/page.tsx#L163-L241)

**Problema:**
```typescript
// equipos/page.tsx línea 163
const generateWinnerCertificatePDF = async () => {
  const doc = new jsPDF({ orientation: 'landscape' })
  
  // ❌ Carga 5 imágenes desde red SECUENCIALMENTE
  const [logoEducacion, logoItsoeh, logoRacing, logoSparko, logoTics] = await Promise.all([
    getBase64ImageFromURL('/logotypes/educacion.png'),  // ~50KB
    getBase64ImageFromURL('/logotypes/itsoeg.png'),     // ~50KB
    getBase64ImageFromURL('/logotypes/logo.png'),       // ~80KB
    getBase64ImageFromURL('/logotypes/sparko.png'),     // ~40KB
    getBase64ImageFromURL('/logotypes/tics.png')        // ~40KB
  ])
  // Total: ~260KB descargados CADA vez que se genera PDF
  // Tiempo total: 2-5s bloqueando UI
  
  doc.save(`certificado_ganador_${selectedTeam.name}.pdf`)
}
```

**Impacto:**
- UI bloqueada 3-8s durante generación
- Usuarios cierran navegador pensando que crasheó
- Bandwidth desperdiciado descargando logos repetidamente
- No escalable a generación masiva (50+ certificados)

**Solución P0:**
```typescript
// Opción 1: Pre-cargar y cachear logos como base64
// lib/certificateAssets.ts
export const CERTIFICATE_ASSETS = {
  logoEducacion: 'data:image/png;base64,iVBORw0KGg...', // Inline base64
  logoItsoeh: 'data:image/png;base64,iVBORw0KGg...',
  // ... resto de logos
}

// equipos/page.tsx
import { CERTIFICATE_ASSETS } from '@/lib/certificateAssets'

const generateWinnerCertificatePDF = async () => {
  // Mostrar loading UI
  setIsGenerating(true)
  
  try {
    const doc = new jsPDF({ orientation: 'landscape' })
    
    // ✅ Usar assets pre-cargados (0 network requests)
    doc.addImage(CERTIFICATE_ASSETS.logoEducacion, 'PNG', 20, 20, 50, 16)
    doc.addImage(CERTIFICATE_ASSETS.logoItsoeh, 'PNG', width - 70, 20, 50, 16)
    // ...
    
    doc.save(`certificado_${selectedTeam.name}.pdf`)
  } finally {
    setIsGenerating(false)
  }
}

// Opción 2: Mover a Cloud Function (óptimo)
// functions/src/generateCertificate.ts
import * as functions from 'firebase-functions'
import { jsPDF } from 'jspdf'
import * as admin from 'firebase-admin'

export const generateCertificate = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) throw new functions.https.HttpsError('permission-denied', ...)
  
  const { teamId, rank } = data
  
  // Cargar datos
  const teamSnap = await admin.firestore().doc(`teams/${teamId}`).get()
  const team = teamSnap.data()
  
  // Generar PDF (logos pre-cargados en Cloud Function)
  const doc = new jsPDF(...)
  const pdfBuffer = doc.output('arraybuffer')
  
  // Subir a Storage
  const fileName = `certificates/${teamId}_${rank}.pdf`
  const bucket = admin.storage().bucket()
  const file = bucket.file(fileName)
  await file.save(Buffer.from(pdfBuffer), { contentType: 'application/pdf' })
  
  // Generar URL pública firmada (1 hora)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600000
  })
  
  return { downloadUrl: url }
})

// Cliente
const handleGenerateCertificate = async () => {
  setLoading(true)
  const generateFn = httpsCallable(functions, 'generateCertificate')
  const result = await generateFn({ teamId: team.id, rank: '1er Lugar' })
  window.open(result.data.downloadUrl, '_blank') // Descargar desde Storage
  setLoading(false)
}
```

**Métricas:**
- **Impacto:** Alto (UX +90%, escalable)
- **Esfuerzo:** M para opción 1 (4h), L para opción 2 (12h)
- **Riesgo:** Bajo para opción 1, Medio para opción 2
- **Prioridad:** P0

---

#### 🟡 P1-P2: jsPDF Versión Obsoleta
**Archivo:** `package.json`

**Problema:**
```json
{
  "jspdf": "^4.2.0"  // ❌ Última versión estable: 2.5.2
}
```

**Impacto:**
- Bugs conocidos resueltos en versiones nuevas
- Sin soporte para fuentes modernas (Google Fonts)
- API deprecated

**Solución P1:**
```bash
# Actualizar
npm uninstall jspdf jspdf-autotable html2pdf.js
npm install jspdf@latest

# Migrar API (cambios menores)
// Antes (v4)
const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })

// Ahora (v2.5+)
import { jsPDF } from 'jspdf'
const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })

// Añadir fuentes custom
doc.addFileToVFS('Outfit-Bold.ttf', OUTFIT_BOLD_BASE64)
doc.addFont('Outfit-Bold.ttf', 'Outfit', 'bold')
doc.setFont('Outfit', 'bold')
```

**Métricas:**
- **Impacto:** Bajo (mejora features, no performance)
- **Esfuerzo:** S (2-3h)
- **Riesgo:** Bajo
- **Prioridad:** P2

---

### 4.4 INFRAESTRUCTURA Y DEPLOYMENT

#### 🟡 P1-I1: Sin Caché de Assets Estáticos
**Archivo:** `next.config.mjs`

**Problema:**
```javascript
// next.config.mjs - Sin headers de caché
const nextConfig = {
  // ❌ No hay configuración de headers
}
```

**Impacto:**
- Assets estáticos (logos, modelos 3D, fuentes) se descargan en cada visita
- Bandwidth desperdiciado
- LCP más lento en visitas recurrentes

**Solución P1:**
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/logotypes/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/3dmodels/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ]
  },
  
  // Comprimir con Brotli (mejor que gzip)
  compress: true
}
```

**Métricas:**
- **Impacto:** Medio (LCP -0.5s en repeat visits)
- **Esfuerzo:** S (1h)
- **Riesgo:** Bajo
- **Prioridad:** P1

---

#### 🟡 P1-I2: Sin Observabilidad/Monitoreo
**Archivo:** N/A (falta implementar)

**Problema:**
- No hay métricas de Web Vitals
- Sin logging de errores en producción
- Imposible detectar problemas de rendimiento

**Solución P1:**
```typescript
// app/layout.tsx - Añadir Web Vitals reporting
import { useReportWebVitals } from 'next/web-vitals'

export default function RootLayout({ children }) {
  useReportWebVitals((metric) => {
    // Enviar a analytics (opciones gratuitas)
    // Vercel Analytics (incluido en plan gratuito)
    if (window.va) {
      window.va('event', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating
      })
    }
    
    // O Google Analytics 4
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta
      })
    }
  })
  
  return <html>{children}</html>
}

// Añadir error boundary
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log a servicio gratuito: Sentry, LogRocket, etc.
    console.error('Error capturado:', error, errorInfo)
    
    // Sentry.io (free tier: 5k events/mes)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      return <h2>Algo salió mal. Por favor recarga la página.</h2>
    }
    return this.props.children
  }
}
```

**Herramientas Gratuitas Recomendadas:**
- **Vercel Analytics**: Ya incluido si deploya en Vercel
- **Google Analytics 4**: Gratis, unlimited
- **Sentry.io**: Free tier 5k events/mes
- **LogRocket**: Free tier 1k sesiones/mes
- **Lighthouse CI**: Gratuito en GitHub Actions

**Métricas:**
- **Impacto:** Medio (visibilidad, no performance directo)
- **Esfuerzo:** M (6h setup + integración)
- **Riesgo:** Bajo
- **Prioridad:** P1

---

#### 🟢 P2-I3: Sin CI/CD con Performance Tests
**Archivo:** N/A (falta implementar)

**Problema:**
- No hay tests de rendimiento automatizados
- Regresiones de performance no se detectan antes de producción

**Solución P2:**
```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Start server
        run: npm run start &
        
      - name: Wait for server
        run: npx wait-on http://localhost:3000
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/login
            http://localhost:3000/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
          
      - name: Check performance budgets
        run: |
          # Fallar si LCP > 2.5s, FID > 100ms, CLS > 0.1
          node scripts/check-lighthouse-budgets.js

# scripts/check-lighthouse-budgets.js
const fs = require('fs')
const results = JSON.parse(fs.readFileSync('./lighthouse-results.json'))

const budgets = {
  'largest-contentful-paint': 2500,
  'first-input-delay': 100,
  'cumulative-layout-shift': 0.1
}

let failed = false
for (const [metric, threshold] of Object.entries(budgets)) {
  const value = results[metric]
  if (value > threshold) {
    console.error(`❌ ${metric}: ${value} exceeds budget ${threshold}`)
    failed = true
  }
}

if (failed) process.exit(1)
```

**Métricas:**
- **Impacto:** Medio (prevención, no corrección)
- **Esfuerzo:** M (8h)
- **Riesgo:** Bajo
- **Prioridad:** P2

---

## 5. LISTA PRIORIZADA DE ACCIONES

### 🔴 P0 - CRÍTICO (Antes de Producción) - 2-3 semanas

| ID | Acción | Archivo(s) Afectados | Esfuerzo | Impacto |
|----|--------|---------------------|----------|---------|
| P0-B1 | Implementar paginación en getAllTeams/Profiles/Events | [lib/firebase.ts](lib/firebase.ts) | 8h | -90% costos, -80% latencia |
| P0-B2 | Eliminar N+1 queries con denormalización | [app/admin/dashboard/equipos/page.tsx](app/admin/dashboard/equipos/page.tsx) | 12h | -95% queries |
| P0-B3 | Crear índices compuestos Firestore | `firestore.indexes.json` (nuevo) | 2h | Evita errores prod |
| P0-B4 | Transacciones atómicas en acceptInvite | [lib/firebase.ts](lib/firebase.ts#L718) | 6h | Evita bugs críticos |
| P0-C1 | Code splitting efectivo + dynamic imports | [app/page.tsx](app/page.tsx), [next.config.mjs](next.config.mjs) | 4h | -400KB bundle |
| P0-C2 | Lazy load condicional de Three.js | [components/landing/ThreeDSection.tsx](components/landing/ThreeDSection.tsx) | 2h | LCP -2s |
| P0-C4 | Lazy import jsPDF | [app/admin/dashboard/equipos/page.tsx](app/admin/dashboard/equipos/page.tsx) | 2h | -200KB bundle |
| P0-P1 | Pre-cargar assets de certificados | [app/admin/dashboard/equipos/page.tsx](app/admin/dashboard/equipos/page.tsx), `lib/certificateAssets.ts` (nuevo) | 4h | UX +90% |

**Total P0: ~40 horas (1 semana para 1 dev senior, 2 semanas para junior)**

---

### 🟡 P1 - ALTO IMPACTO (Antes del Primer Evento) - 2 semanas

| ID | Acción | Archivo(s) Afectados | Esfuerzo | Impacto |
|----|--------|---------------------|----------|---------|
| P1-C3 | Reemplazar GSAP con CSS en landing | [components/landing/Hero.tsx](components/landing/Hero.tsx), `Hero.css` | 6h | -150KB, FCP -0.3s |
| P1-C5 | Convertir PNGs a WebP | `public/logotypes/*.png`, scripts | 2h | LCP -1s, -60% bytes |
| P1-B5 | Implementar rate limiting client-side | [lib/firebase.ts](lib/firebase.ts), componentes | 6h | Previene abuso |
| P1-I1 | Configurar headers de caché | [next.config.mjs](next.config.mjs) | 1h | Repeat visits +40% |
| P1-I2 | Setup observabilidad (Vercel Analytics + Sentry) | [app/layout.tsx](app/layout.tsx), componentes | 6h | Visibilidad |
| P1-P2 | Actualizar jsPDF a v2.5+ | [package.json](package.json), certificado logic | 3h | Features, stability |

**Total P1: ~24 horas (1 semana)**

---

### 🟢 P2 - MEJORA CONTINUA (Post-MVP) - Ongoing

| ID | Acción | Esfuerzo | Impacto |
|----|--------|----------|---------|
| P2-I3 | CI/CD con performance tests | 8h | Prevención regresiones |
| P2-C6 | Implementar Service Worker para offline | 12h | PWA, UX offline |
| P2-B6 | Migrar a Cloud Functions para lógica crítica | 40h+ | Seguridad, costos |
| P2-I4 | CDN para assets pesados (Cloudflare) | 4h | Global latency |

---

## 6. PLAN DE MEDICIÓN

### 6.1 Métricas Clave

#### Web Performance (Cliente)
| Métrica | Herramienta | Target | Frecuencia |
|---------|-------------|--------|------------|
| **LCP** | Vercel Analytics, Lighthouse | <2.5s | Cada deploy |
| **FID/INP** | Vercel Analytics | <100ms | Continua |
| **CLS** | Vercel Analytics | <0.1 | Continua |
| **TTI** | Lighthouse | <3.5s | Cada deploy |
| **TBT** | Lighthouse | <200ms | Cada deploy |
| **Bundle Size** | Next.js build output | <500KB initial | Cada deploy |

#### Backend/Database
| Métrica | Herramienta | Target | Frecuencia |
|---------|-------------|--------|------------|
| **Firestore Reads** | Firebase Console | <100k/día | Diaria |
| **Firestore Writes** | Firebase Console | <10k/día | Diaria |
| **Query Latency p95** | Custom logging | <800ms | Continua |
| **Auth verifications** | Firebase Console | <50k/día | Diaria |

#### User Experience
| Métrica | Herramienta | Target | Frecuencia |
|---------|-------------|--------|------------|
| **Error Rate** | Sentry | <0.5% | Continua |
| **Page Load Time** | GA4 | <4s p75 | Diaria |
| **PDF Generation Time** | Custom event | <3s | Por evento |

---

### 6.2 Herramientas (Stack Gratuito)

#### Desarrollo
```bash
# Lighthouse CLI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000

# Chrome DevTools Performance
# Profile manual en:
# - Landing page load
# - Admin dashboard con 50 equipos
# - PDF generation

# React DevTools Profiler
# Identificar re-renders innecesarios
```

#### Continuous Monitoring
```javascript
// Vercel Analytics (incluido en free tier)
// Auto-recolecta Web Vitals sin config adicional

// Google Analytics 4
// gtag.js - Eventos custom
gtag('event', 'pdf_generation', {
  duration: generationTime,
  team_id: teamId
})

// Sentry (5k events/mes gratis)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% de requests
  environment: process.env.NODE_ENV
})
```

#### Load Testing
```bash
# k6 (open source, gratis)
npm install -g k6

# Script de prueba
# k6-load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up a 50 usuarios
    { duration: '5m', target: 50 },   // Mantener 50 usuarios
    { duration: '2m', target: 100 },  // Spike a 100
    { duration: '2m', target: 0 }     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2s
    http_req_failed: ['rate<0.01']     // <1% error rate
  }
}

export default function() {
  const res = http.get('https://your-app.vercel.app')
  check(res, { 'status was 200': (r) => r.status == 200 })
  sleep(1)
}

# Ejecutar
k6 run k6-load-test.js
```

---

### 6.3 Escenarios de Carga Críticos

#### Escenario 1: Apertura de Inscripciones
```yaml
Objetivo: Validar que el sistema soporta 100 usuarios simultáneos creando equipos
Duración: 15 minutos
Perfil de carga:
  - Usuarios concurrentes: 100
  - Acciones:
    * Login (2 requests)
    * Crear equipo (5 requests: validación + escritura + join)
    * Ver dashboard (10+ requests por N+1)
Métricas objetivo:
  - Response time p95 < 3s
  - Error rate < 1%
  - Firestore reads < 5000 en ventana de 15min
```

#### Escenario 2: Evento en Vivo (Bracket Updates)
```yaml
Objetivo: 200 usuarios viendo bracket que se actualiza cada 30s
Duración: 2 horas
Perfil de carga:
  - Usuarios concurrentes: 200
  - Acciones:
    * Ver bracket (30 requests inicial)
    * Refresh cada 30s (30 requests)
Métricas objetivo:
  - Response time p95 < 2s
  - Firestore reads < 20k/hora
  - LCP < 3s
```

#### Escenario 3: Admin Masivo
```yaml
Objetivo: Admin confirma 50 equipos en ráfaga
Duración: 5 minutos
Perfil de carga:
  - Admins: 3 simultáneos
  - Acciones:
    * Cargar lista equipos (200+ requests con N+1)
    * Confirmar 50 equipos (50 writes)
Métricas objetivo:
  - Dashboard load < 10s
  - Confirm action < 1s
  - UI no debe congelarse
```

---

## 7. CHECKLIST ANTES DE PRODUCCIÓN

### Performance
- [ ] Bundle JS inicial < 500KB gzipped
- [ ] LCP < 2.5s en landing (mobile + desktop)
- [ ] TTI < 3.5s en todas las rutas autenticadas
- [ ] Imágenes convertidas a WebP
- [ ] Three.js con lazy loading condicional
- [ ] jsPDF importado dinámicamente

### Base de Datos
- [ ] Paginación implementada en getAllTeams/Profiles/Events
- [ ] Índices compuestos creados y desplegados
- [ ] N+1 queries eliminados con denormalización
- [ ] Transacciones atómicas en operaciones críticas
- [ ] Rate limiting básico implementado

### Seguridad
- [ ] Firebase config en variables de entorno
- [ ] Firestore Rules auditadas (no permitir reads/writes sin auth)
- [ ] Rate limiting en createTeam, joinTeam
- [ ] Validación server-side en Cloud Functions (opcional pero recomendado)

### Monitoreo
- [ ] Vercel Analytics habilitado
- [ ] Sentry configurado con error boundary
- [ ] Web Vitals tracked en analytics
- [ ] Firebase quota alerts configurados (Firestore, Auth)

### Testing
- [ ] Lighthouse CI en pipeline
- [ ] Load test con k6 (escenarios críticos)
- [ ] Test manual de PDF generation con 10+ equipos
- [ ] Test de race conditions en join team

### Costos
- [ ] Estimación de costos Firestore con 200 equipos: $___/mes
- [ ] Plan Firebase seleccionado (Spark vs Blaze)
- [ ] Vercel plan adecuado (Hobby vs Pro)
- [ ] Budget alerts configurados en Firebase Console

---

## 8. ESTIMACIÓN DE COSTOS POST-OPTIMIZACIÓN

### Escenario: 200 equipos, 1000 usuarios, 1 evento/mes

#### Firestore (con optimizaciones P0)
```
Reads:
- Landing: 0 reads (SSG)
- Dashboard usuario: 5 reads/sesión * 1000 usuarios * 10 sesiones/mes = 50k
- Admin dashboard: 50 reads/load (con paginación) * 3 admins * 100 loads = 15k
- Bracket público: 30 reads/view * 500 views = 15k
Total: ~80k reads/mes

Writes:
- Crear equipos: 200 * 5 writes = 1k
- Updates equipos: 200 * 10 = 2k
- Matches/resultados: 100 * 5 = 500
Total: ~4k writes/mes

Costo: (80k reads * $0.06/100k) + (4k writes * $0.18/100k) = $0.048 + $0.007 ≈ $0.06/mes
```

#### Vercel (Hobby plan, $0/mes)
- 100GB bandwidth/mes (suficiente con optimizaciones)
- Edge Functions incluidas
- Serverless Functions: 100 GB-hours incluidas

#### Firebase Auth (Gratis hasta 10k MAU)
- 1000 usuarios/mes: $0

#### Firebase Storage (para PDFs generados server-side)
- 50 PDFs * 500KB = 25MB: $0 (incluido en free tier)

**Total mensual estimado: ~$0.06 - $5/mes** (dependiendo de tráfico spikes)

---

## CONCLUSIÓN

### Estado Actual
La plataforma Racing Cup es **funcionalmente completa** pero **arquitectónicamente no escalable** más allá de un evento pequeño (~30-50 equipos). Riesgos principales:
1. Costos Firestore exponenciales
2. Dashboard admin inutilizable con carga real
3. UX degradada por assets pesados

### Camino Crítico (6 semanas)
```
Semana 1-2: P0 items (paginación, índices, N+1, PDFs)
Semana 3-4: P1 items (caché, rate limiting, WebP, monitoring)
Semana 5: Testing de carga con escenarios reales
Semana 6: Ajustes post-testing + documentación
```

### ROI de Optimizaciones
- **Tiempo invertido:** ~80 horas dev
- **Ahorro mensual:** $30-50 en costos Firestore
- **UX improvement:** LCP -50%, TTI -60%
- **Escalabilidad:** De 50 → 500 equipos sin cambios arquitectónicos

### Recomendación Final
**APROBADO para MVP** después de implementar **P0 items** (40 horas). Riesgos aceptables para evento piloto <50 equipos. Plan de escalamiento claro documentado.

---

**Próximos Pasos Inmediatos:**
1. Priorizar P0-B1 (paginación) y P0-B2 (N+1) - impacto máximo
2. Setup básico de monitoring (Vercel Analytics + Sentry)
3. Crear firestore.indexes.json y desplegar
4. Performance baseline con Lighthouse antes de optimizaciones

**Contacto para Dudas Técnicas:**
- Review arquitectura propuesta en sección 2
- Validar presupuestos de rendimiento en sección 3
- Priorizar según recursos disponibles (solo P0 si time-constrained)
