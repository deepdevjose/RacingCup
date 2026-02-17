"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/common/Navbar"
import Footer from "@/components/common/Footer"
import { ChevronDown, LifeBuoy, Book, MessageCircle, UserPlus, LogIn, Trophy, Users, Settings } from "lucide-react"
import "./ayuda.css"

interface FAQItem {
    question: string
    answer: string
}

const faqsRegistro: FAQItem[] = [
    {
        question: "¿Cómo crear una cuenta?",
        answer: "Ve a racing-cup.vercel.app/signup. El registro tiene 2 pasos:\n\n• Paso 1 – Ingresa tu correo electrónico y crea una contraseña (mínimo 6 caracteres). Confírmala escribiéndola nuevamente.\n\n• Paso 2 – Completa tu perfil: nombre completo, Gamertag (exactamente 8 caracteres alfanuméricos, por ejemplo PLAYER01), institución educativa, nivel educativo (Media Superior o Superior), y marca la casilla si eres docente.\n\nAl finalizar, recibirás un correo de verificación. Haz clic en el enlace del correo para activar tu cuenta."
    },
    {
        question: "¿Qué es el Gamertag y cómo funciona?",
        answer: "El Gamertag es tu identificador único dentro de la plataforma. Debe tener exactamente 8 caracteres alfanuméricos (letras y números). Se convierte automáticamente a mayúsculas. Ejemplo: RACR2026.\n\nEl sistema verifica en tiempo real si tu Gamertag está disponible:\n• Verde = Disponible ✅\n• Rojo = Ya está en uso ❌\n\nNo podrás registrarte con un Gamertag que ya esté tomado."
    },
    {
        question: "¿Cómo verifico mi correo electrónico?",
        answer: "Al completar el registro, te enviamos un correo de verificación automáticamente. Revisa tu bandeja de entrada (y la carpeta de spam). Haz clic en el enlace del correo para activar tu cuenta.\n\nImportante: No podrás iniciar sesión hasta que tu correo esté verificado. Si intentas entrar sin verificar, verás el mensaje: \"Por favor verifica tu correo electrónico antes de iniciar sesión.\""
    },
    {
        question: "¿Cómo inicio sesión?",
        answer: "Entra a racing-cup.vercel.app/login. Ingresa tu correo electrónico y contraseña, y presiona \"Entrar\".\n\nSi tus datos son correctos y tu correo está verificado, serás redirigido automáticamente al Panel de Control (Dashboard).\n\n¿No tienes cuenta? Desde la pantalla de login puedes ir directamente al registro haciendo clic en \"Regístrate aquí\"."
    }
]

const faqsDashboard: FAQItem[] = [
    {
        question: "¿Qué puedo hacer en el Dashboard?",
        answer: "El Dashboard es tu panel de control principal. Desde ahí puedes:\n\n• Explorar Eventos – Ver los torneos y competencias disponibles, con fecha, ubicación y estado (Registro Abierto, En Curso, Cerrado, Finalizado).\n\n• Mis Equipos – Gestionar los integrantes de tu equipo, ver invitaciones o unirte a un equipo existente.\n\n• Mi Perfil – Actualizar tus datos personales, personalizar tu avatar y revisar tus estadísticas."
    },
    {
        question: "¿Cómo exploro los eventos disponibles?",
        answer: "Desde el Dashboard, haz clic en \"Explorar Eventos\" o ve a la pestaña \"Eventos\" en la barra de navegación.\n\nVerás una lista de todos los torneos disponibles, con:\n• Fecha del evento\n• Estado (Registro Abierto, Cerrado, En Curso, etc.)\n• Ubicación\n• Descripción\n\nPuedes usar la barra de búsqueda para filtrar por nombre o ubicación. Haz clic en \"Ver Detalles\" para ver la información completa de cada evento."
    }
]

const faqsEquipos: FAQItem[] = [
    {
        question: "¿Cómo creo un equipo?",
        answer: "1. Ve a Eventos → selecciona el evento donde quieres participar → haz clic en \"Crear Equipo\".\n\n2. Elige un nombre para tu equipo (máximo 30 caracteres).\n\n3. Personaliza tu equipo seleccionando un icono y un color.\n\n4. Selecciona las categorías en las que vas a competir (Racing Cars, Sumo RC, RoboFut) y asigna un nombre a tu prototipo/robot para cada categoría.\n\n5. Haz clic en \"Crear equipo\". ¡Listo! Tu equipo quedará registrado en el evento."
    },
    {
        question: "¿Cómo me uno a un equipo existente?",
        answer: "Si alguien ya creó un equipo y te compartió el código de invitación:\n\n1. Ve a Eventos → selecciona el evento → haz clic en \"Unirse a un equipo\".\n\n2. Ingresa el código de invitación (6 caracteres, ej: ABC123).\n\n3. Presiona \"Buscar\". Si el código es válido, verás la información del equipo.\n\n4. Haz clic en \"Unirse al equipo\" para confirmar.\n\nNota: Si ya tenías un equipo propio en ese evento, el anterior será eliminado automáticamente al unirte a otro."
    },
    {
        question: "¿Cuántas personas puede tener un equipo?",
        answer: "Cada equipo puede tener hasta 5 integrantes, incluyendo opcionalmente a un docente asesor. El líder del equipo (quien lo creó) puede compartir el código de invitación con sus compañeros para que se unan."
    },
    {
        question: "¿Puedo participar en varias categorías con el mismo equipo?",
        answer: "Sí. Al crear tu equipo, puedes seleccionar múltiples categorías (Racing Cars, Sumo RC, RoboFut). Para cada categoría que selecciones, deberás asignar un nombre a tu prototipo o robot."
    }
]

const faqsGenerales: FAQItem[] = [
    {
        question: "¿Cuánto cuesta inscribirse?",
        answer: "La inscripción tiene un costo de $100.00 MXN por equipo. La fecha límite de registro es el 13 de marzo de 2026."
    },
    {
        question: "¿Qué categorías de competencia existen?",
        answer: "Racing Cup TICs 2026 tiene 3 categorías:\n\n• Racing Cars – Carreras de autos RC en pistas de velocidad.\n• Sumo RC – Robots que compiten en un ring circular para empujar al oponente fuera del dojo.\n• RoboFut – Fútbol robótico con equipos de robots controlados remotamente.\n\nCada categoría tiene su propio reglamento oficial que puedes consultar en la página de cada categoría."
    },
    {
        question: "¿Cómo puedo ver el reglamento oficial?",
        answer: "Cada página de categoría (Racing Cars, Sumo RC, RoboFut) tiene una sección de \"Reglamento Oficial\" al final con un visor de PDF integrado. También puedes descargar el PDF directamente."
    },
    {
        question: "¿Necesito ayuda adicional?",
        answer: "Si tienes dudas o problemas técnicos, puedes contactarnos:\n\n📞 Teléfono: 55 4706 1280\n\nTambién puedes visitar nuestras redes sociales para estar al día con novedades y anuncios del evento."
    }
]

const AccordionItem = ({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) => {
    return (
        <div className="faq-item">
            <button
                onClick={onClick}
                className="faq-question"
                aria-expanded={isOpen}
            >
                <span>{item.question}</span>
                <ChevronDown className={`w-5 h-5 faq-chevron ${isOpen ? 'open' : ''}`} />
            </button>
            <div
                className={`faq-answer-wrapper ${isOpen ? "open" : "closed"}`}
            >
                <p className="faq-answer" style={{ whiteSpace: 'pre-line' }}>{item.answer}</p>
            </div>
        </div>
    )
}

const FAQSection = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: FAQItem[] }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className="help-content-card" style={{ marginBottom: '2rem' }}>
            <h2 className="help-section-title">
                {icon}
                {title}
            </h2>
            <div className="faq-list">
                {items.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        item={faq}
                        isOpen={openIndex === index}
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                ))}
            </div>
        </div>
    )
}

export default function HelpPage() {
    return (
        <div className="help-page">
            <Navbar />

            <main className="help-container">
                <div className="help-header">
                    <h1 className="help-title">
                        Centro de Ayuda
                    </h1>
                    <p className="help-subtitle">
                        Todo lo que necesitas saber para registrarte, crear equipos y participar en la Racing Cup TICs 2026.
                    </p>
                </div>

                <Tabs defaultValue="guia" className="w-full">
                    <div className="flex justify-center">
                        <TabsList className="help-tabs-list">
                            <TabsTrigger value="guia" className="help-tab-trigger">
                                <Book className="w-4 h-4 mr-2" />
                                Guía Completa
                            </TabsTrigger>
                            <TabsTrigger value="soporte" className="help-tab-trigger">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Soporte
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="guia" className="animate-enter">
                        <FAQSection
                            title="Registro e Inicio de Sesión"
                            icon={<UserPlus className="w-6 h-6 help-icon-primary" />}
                            items={faqsRegistro}
                        />
                        <FAQSection
                            title="Tu Panel de Control"
                            icon={<Settings className="w-6 h-6 help-icon-primary" />}
                            items={faqsDashboard}
                        />
                        <FAQSection
                            title="Equipos y Competencia"
                            icon={<Users className="w-6 h-6 help-icon-primary" />}
                            items={faqsEquipos}
                        />
                        <FAQSection
                            title="Preguntas Generales"
                            icon={<Trophy className="w-6 h-6 help-icon-primary" />}
                            items={faqsGenerales}
                        />
                    </TabsContent>

                    <TabsContent value="soporte" className="animate-enter">
                        <div className="help-content-card">
                            <h2 className="help-section-title">
                                <LifeBuoy className="w-6 h-6 help-icon-primary" />
                                Contacto y Soporte
                            </h2>
                            <div style={{ padding: '1rem 0' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    <div style={{
                                        background: 'rgba(227, 38, 54, 0.08)',
                                        border: '1px solid rgba(227, 38, 54, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#E32636' }}>📞 Teléfono</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Llámanos o escríbenos por WhatsApp al <strong style={{ color: '#fff' }}>55 4706 1280</strong>.
                                            Disponible de Lunes a Viernes, 9:00 AM - 6:00 PM.
                                        </p>
                                    </div>
                                    <div style={{
                                        background: 'rgba(227, 38, 54, 0.08)',
                                        border: '1px solid rgba(227, 38, 54, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#E32636' }}>🏫 Sede</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            Instituto Tecnológico Superior de Oriente del Estado de Hidalgo (<strong style={{ color: '#fff' }}>ITSOEH</strong>).
                                            Ingeniería en TICs.
                                        </p>
                                    </div>
                                    <div style={{
                                        background: 'rgba(227, 38, 54, 0.08)',
                                        border: '1px solid rgba(227, 38, 54, 0.2)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#E32636' }}>📅 Evento</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                            <strong style={{ color: '#fff' }}>4ª Edición Racing Cup TICs 2026</strong><br />
                                            Fecha del evento: 13 de marzo de 2026.<br />
                                            Fecha límite de inscripción: 13 de marzo de 2026.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="help-content-card" style={{ marginTop: '2rem' }}>
                            <h2 className="help-section-title">
                                <MessageCircle className="w-6 h-6 help-icon-primary" />
                                Pasos Rápidos para Participar
                            </h2>
                            <div style={{ padding: '1rem 0' }}>
                                <ol style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    counterReset: 'steps'
                                }}>
                                    {[
                                        { step: "Crea tu cuenta", desc: "Regístrate en /signup con tu correo, contraseña y datos de perfil." },
                                        { step: "Verifica tu correo", desc: "Haz clic en el enlace que te enviamos por email." },
                                        { step: "Inicia sesión", desc: "Entra con tu correo y contraseña en /login." },
                                        { step: "Explora eventos", desc: "Desde el Dashboard, ve a Eventos y selecciona el torneo." },
                                        { step: "Crea o únete a un equipo", desc: "Crea tu equipo con nombre, icono y categorías, o únete con un código de invitación." },
                                        { step: "¡Compite!", desc: "Prepárate para el día del evento. ¡Buena suerte!" }
                                    ].map((item, i) => (
                                        <li key={i} style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            marginBottom: '1.25rem',
                                            alignItems: 'flex-start'
                                        }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '36px',
                                                height: '36px',
                                                background: 'linear-gradient(135deg, #E32636, #C41E2C)',
                                                borderRadius: '50%',
                                                fontWeight: 800,
                                                fontSize: '0.9rem',
                                                color: '#fff',
                                                flexShrink: 0
                                            }}>
                                                {i + 1}
                                            </span>
                                            <div>
                                                <strong style={{ color: '#fff', fontSize: '1rem' }}>{item.step}</strong>
                                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '2px' }}>{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    )
}
