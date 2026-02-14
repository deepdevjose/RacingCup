'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/common/PDFViewer'), { ssr: false })

/**
 * Racing Cars Category Page
 * Obstacle racing competition details
 */
export default function RacingCarsPage() {
    return (
        <div className="category-page">
            <Navbar />

            <CategoryHero
                title="Racing Cars"
                titleImage="/logotypes/racingcars.png"
                subtitle="Carreras de Obstáculos RC"
                description="Velocidad, precisión y estrategia en cada curva. ¿Tienes lo necesario para dominar la pista?"
                accentColor="#FFFFFF"
                backgroundColor="#D32F2F"
            />

            <ContentSection title="¿Qué es Racing Cars?" variant="dark" backgroundColor="#D32F2F" accentColor="#FFD700">
                <p>
                    <strong>Racing Cars</strong> es la categoría estrella del Racing Cup. Los competidores
                    deben demostrar sus habilidades de conducción guiando vehículos RC a control remoto
                    a través de una pista llena de obstáculos desafiantes.
                </p>
                <p>
                    No se trata solo de velocidad. Cada curva exige precisión, cada salto requiere
                    cálculo y cada segundo cuenta. Los mejores pilotos combinan reflejos rápidos
                    con estrategia inteligente.
                </p>
            </ContentSection>

            <ContentSection title="Generalidades de Inscripción" variant="dark" backgroundColor="#D32F2F" accentColor="#FFD700">
                <p>
                    <strong>Fecha Límite:</strong> 13 de marzo de 2026.<br />
                    <strong>Costo:</strong> $100.00 MXN.<br />
                    <strong>Integrantes:</strong> Máximo 5 personas por equipo, incluyendo opcionalmente a un docente.<br />
                    <strong>Registro:</strong> En línea a través de <a href="https://racing-cup.vercel.app/" className="text-[#FFD700] hover:underline">https://racing-cup.vercel.app/</a>.<br />
                    <strong>Asistencia:</strong> Teléfono 55 4706 1280.
                </p>
            </ContentSection>

            <ContentSection title="Especificaciones Técnicas (Hardware)" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">📏</div>
                        <h3 className="rule-card-title">Dimensiones</h3>
                        <p className="rule-card-text">
                            Largo máximo: 30 cm.<br />
                            Ancho y alto máximo: 20 cm x 20 cm.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚡</div>
                        <h3 className="rule-card-title">Energía</h3>
                        <p className="rule-card-text">
                            Voltaje máximo: 12V (prohibido exceder este límite).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎮</div>
                        <h3 className="rule-card-title">Control</h3>
                        <p className="rule-card-text">
                            Sistemas asistidos permitidos.<br />
                            <strong>Prohibido:</strong> Sistemas 100% autónomos.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎥</div>
                        <h3 className="rule-card-title">Asistencia</h3>
                        <p className="rule-card-text">
                            Permitido el uso de cámaras (FPV) y sensores para prevenir colisiones.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">📡</div>
                        <h3 className="rule-card-title">Comunicación</h3>
                        <p className="rule-card-text">
                            Protocolo libre (Bluetooth, Wi-Fi, RF).<br />
                            Gestión de saturación de banda por el equipo.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Dinámica de la Competencia" variant="dark">
                <p>La competencia se divide en dos fases principales:</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>
                        <strong>Fase de Clasificación:</strong> Enfrentamientos directos de 2 equipos por ronda.
                        <ul className="pl-6 mt-2 space-y-1 text-white/80">
                            <li><strong>Victoria:</strong> 3 puntos (cruzar la meta primero).</li>
                            <li><strong>Empate:</strong> 1 punto para cada uno (no terminar el circuito o llegar simultáneamente).</li>
                            <li><strong>Criterio de Desempate:</strong> Se utilizará el menor tiempo registrado para completar el circuito.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Fase Final (Top 16):</strong> Eliminatoria directa (muerte súbita) donde el primero en cruzar la meta avanza.
                    </li>
                </ul>
            </ContentSection>

            <ContentSection title="Área de Competencia e Incidentes" variant="light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#D32F2F]">Circuito</h3>
                        <p className="text-gray-800 mb-4">
                            Pista cerrada de 15 metros con terreno irregular (piedras, obstáculos) y al menos una rampa.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#D32F2F]">Tiempo de Carrera</h3>
                        <p className="text-gray-800">
                            Si tras 3 minutos nadie llega a la meta en clasificación, se declara empate.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#D32F2F]">Tiempo Técnico</h3>
                        <p className="text-gray-800 mb-4">
                            30 segundos únicos por carrera para reparaciones de emergencia.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#D32F2F]">Intervención</h3>
                        <p className="text-gray-800">
                            Prohibido entrar al circuito; solo el Staff puede tocar prototipos volcados o fuera de pista.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Premios y Reconocimientos" variant="primary">
                <p className="text-center mb-8">Se otorgan premios según el nivel educativo:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold mb-4 text-center">🏆 Nivel Media Superior</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span>1er Lugar</span>
                                <span className="font-bold text-[#FFD700]">$1,500 MXN + Diploma</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span>2do Lugar</span>
                                <span className="font-bold text-[#C0C0C0]">$1,000 MXN + Diploma</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>3er Lugar</span>
                                <span className="font-bold text-[#CD7F32]">Diploma + Obsequio Especial</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold mb-4 text-center">🏆 Nivel Superior</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span>1er Lugar</span>
                                <span className="font-bold text-[#FFD700]">$1,000 MXN + Diploma</span>
                            </li>
                            <li className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span>2do Lugar</span>
                                <span className="font-bold text-[#C0C0C0]">$500 MXN + Diploma</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>3er Lugar</span>
                                <span className="font-bold text-[#CD7F32]">Diploma + Obsequio Especial</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="cta-container">
                    <a href="https://racing-cup.vercel.app/ayuda" className="btn btn-accent" target="_blank" rel="noopener noreferrer">Ver Guía de Inscripción</a>
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
                                <span className="font-semibold text-white/90">RC_CAR_REGLAMENTO OFICIALv1.pdf</span>
                            </div>
                            <a
                                href="/api/docs/RC_CAR_REGLAMENTO%20OFICIALv1.pdf"
                                download="RC_CAR_REGLAMENTO_OFICIAL.pdf"
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

                        <PDFViewer url="/api/docs/RC_CAR_REGLAMENTO%20OFICIALv1.pdf" />

                    </div>
                    <p className="text-center mt-4 text-sm text-gray-500">
                        ¿No puedes ver el documento? <a href="/api/docs/RC_CAR_REGLAMENTO%20OFICIALv1.pdf" target="_blank" className="text-blue-600 hover:underline">Ábrelo en una nueva pestaña</a>
                    </p>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
