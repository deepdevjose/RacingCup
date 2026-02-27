'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/common/PDFViewer'), { ssr: false })

/**
 * RoboFut Category Page
 * Robot soccer competition details
 */
export default function RoboFutPage() {
    return (
        <div className="category-page">
            <Navbar />

            <CategoryHero
                title="RoboFut"
                titleImage="/logotypes/robofut.png"
                subtitle="Fútbol Robótico"
                description="Robots controlados remotamente compitiendo en el deporte más popular del mundo. Estrategia + destreza = victoria."
                accentColor="#FFFFFF"
                backgroundColor="#2E7D32"
            />

            <ContentSection title="¿Qué es RoboFut?" variant="dark" backgroundColor="#2E7D32" accentColor="#EA80FC">
                <p>
                    <strong>RoboFut</strong> es una competencia donde la estrategia y el control lo son todo.
                    Dos equipos de robots controlados vía remota se enfrentan en una cancha para anotar la mayor cantidad de goles.
                </p>
                <p>
                    La combinación de ingeniería mecánica, electrónica y trabajo en equipo
                    hacen de RoboFut una experiencia única e intensa de principio a fin.
                </p>
            </ContentSection>

            <ContentSection title="Generalidades de Inscripción" variant="dark" backgroundColor="#2E7D32" accentColor="#EA80FC">
                <p>
                    <strong>Fecha Límite:</strong> 13 de marzo de 2026.<br />
                    <strong>Costo:</strong> $100.00 MXN.<br />
                    <strong>Integrantes:</strong> Máximo 5 personas por equipo, incluyendo opcionalmente a un docente.<br />
                    <strong>Registro:</strong> En línea a través de <a href="/signup" className="text-[#EA80FC] hover:underline">racing-cup.vercel.app</a>.<br />
                    <strong>Asistencia:</strong> Teléfono 55 4706 1280.
                </p>
            </ContentSection>

            <ContentSection title="Especificaciones Técnicas" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">📏</div>
                        <h3 className="rule-card-title">Dimensiones y Peso</h3>
                        <p className="rule-card-text">
                            Máximo: 15 x 15 x 15 cm.<br />
                            Peso: Máximo 500g.<br />
                            Construcción: Libre (ruedas, orugas, patas).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚡</div>
                        <h3 className="rule-card-title">Electrónica</h3>
                        <p className="rule-card-text">
                            Voltaje Máximo: 12V.<br />
                            Baterías: Arreglos no pueden superar 12V.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎮</div>
                        <h3 className="rule-card-title">Control</h3>
                        <p className="rule-card-text">
                            100% Remoto (Bluetooth, RF, Wi-Fi).<br />
                            <strong>Prohibido:</strong> Sensores para autonomía (ultrasónicos, proximidad).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚽</div>
                        <h3 className="rule-card-title">Equipo en Cancha</h3>
                        <p className="rule-card-text">
                            2 robots por equipo en cancha simultáneamente.<br />
                            Cambios ilimitados permitidos.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Reglas del Juego" variant="dark">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">🥅</div>
                        <h3 className="rule-card-title">Cancha</h3>
                        <p className="rule-card-text">
                            Largo: 1500 mm. Material MDF.
                            Porterías de 200 mm de ancho.
                            Balón: Tamaño pelota de golf.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⏰</div>
                        <h3 className="rule-card-title">Tiempo</h3>
                        <p className="rule-card-text">
                            2 tiempos de 2 minutos cada uno.
                            En empate: Penales (tiro libre directo).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🚫</div>
                        <h3 className="rule-card-title">Faltas</h3>
                        <p className="rule-card-text">
                            Golpes deliberados, aprisionar el balón o levantarlo del suelo.
                            Sanción: Tiro penal.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🏟️</div>
                        <h3 className="rule-card-title">Desempate</h3>
                        <p className="rule-card-text">
                            En caso de empate al final del tiempo reglamentario, se procede a penales con tiro libre directo.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Área de Competencia e Incidentes" variant="light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#2E7D32]">Cancha</h3>
                        <p className="text-gray-800 mb-4">
                            Mesa de MDF de 1500 mm de largo con porterías de 200 mm. Superficie plana y uniforme.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#2E7D32]">Tiempo de Partido</h3>
                        <p className="text-gray-800">
                            2 tiempos de 2 minutos. Si al término no hay ganador, se procede a ronda de penales.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#2E7D32]">Tiempo Técnico</h3>
                        <p className="text-gray-800 mb-4">
                            Se permite un tiempo fuera de 30 segundos por equipo por partido para reparaciones.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#2E7D32]">Intervención</h3>
                        <p className="text-gray-800">
                            Prohibido tocar los robots o la cancha durante el juego. Solo el Staff puede intervenir en situaciones de emergencia.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Premios y Reconocimientos" variant="primary">
                <div className="max-w-xl mx-auto mb-10 mt-4">
                    <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold mb-6 text-center">🏆 Premio Único</h3>
                        <ul className="space-y-6">
                            <li className="flex justify-between items-center px-4">
                                <span className="text-xl">1er Lugar</span>
                                <span className="text-xl font-bold text-[#FFD700]">$1,000 MXN + Diploma</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="cta-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                    <a href="/ayuda" className="btn btn-accent">Ver Guía de Inscripción</a>
                    <a href="/signup" className="btn btn-primary">Inscribete</a>
                </div>
            </ContentSection>

            <ContentSection title="Reglamento Oficial" variant="light" customMaxWidth="100%">
                <div className="w-full max-w-[1600px] mx-auto">
                    <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0D0D1A]">
                            <div className="flex items-center gap-2">
                                <span className="text-red-500">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </span>
                                <span className="font-semibold text-white/90">ROBOFUT_REGLAMENTO OFICIALv1.pdf</span>
                            </div>
                            <a
                                href="/api/docs/ROBOFUT_REGLAMENTO%20OFICIALv1.pdf"
                                download="ROBOFUT_REGLAMENTO_OFICIAL.pdf"
                                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Descargar
                            </a>
                        </div>

                        <PDFViewer url="/api/docs/ROBOFUT_REGLAMENTO%20OFICIALv1.pdf" />

                    </div>
                    <p className="text-center mt-4 text-sm text-gray-500">
                        ¿No puedes ver el documento? <a href="/api/docs/ROBOFUT_REGLAMENTO%20OFICIALv1.pdf" target="_blank" className="text-blue-600 hover:underline">Ábrelo en una nueva pestaña</a>
                    </p>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
