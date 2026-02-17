'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/common/PDFViewer'), { ssr: false })

/**
 * Sumo RC Category Page
 * Robot sumo wrestling competition details
 */
export default function SumoRCPage() {
    return (
        <div className="category-page">
            <Navbar />

            <CategoryHero
                title="Sumo RC"
                titleImage="/logotypes/sumorc.png"
                subtitle="Batalla de Robots"
                description="Dos robots, un dojo, un solo objetivo: sacar al oponente del área de combate."
                accentColor="#FFFFFF"
                backgroundColor="#6A0DAD"
            />

            <ContentSection title="¿Qué es Sumo RC?" variant="dark" backgroundColor="#6A0DAD" accentColor="#76FF03">
                <p>
                    <strong>Sumo RC</strong> es una competencia de robótica donde dos robots autónomos
                    se enfrentan en un ring circular. El objetivo es empujar al oponente fuera del
                    área de combate sin salir tú mismo.
                </p>
                <p>
                    La estrategia es la clave. Programación, sensores y diseño mecánico se enfrentan
                    en batallas cortas pero intensas donde cada movimiento puede definir la victoria.
                </p>
            </ContentSection>

            <ContentSection title="Generalidades de Inscripción" variant="dark" backgroundColor="#6A0DAD" accentColor="#76FF03">
                <p>
                    <strong>Fecha Límite:</strong> 13 de marzo de 2026.<br />
                    <strong>Costo:</strong> $100.00 MXN.<br />
                    <strong>Integrantes:</strong> Máximo 5 personas por equipo, incluyendo opcionalmente a un docente.<br />
                    <strong>Registro:</strong> En línea a través de <a href="/signup" className="text-[#76FF03] hover:underline">racing-cup.vercel.app</a>.<br />
                    <strong>Asistencia:</strong> Teléfono 55 4706 1280.
                </p>
            </ContentSection>

            <ContentSection title="Especificaciones Técnicas" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">📏</div>
                        <h3 className="rule-card-title">Dimensiones</h3>
                        <p className="rule-card-text">
                            Máximo 10x10 cm de base. Altura máxima 15 cm. Peso máximo: 500 gramos.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚡</div>
                        <h3 className="rule-card-title">Energía</h3>
                        <p className="rule-card-text">
                            Voltaje máximo permitido: 12V. Prohibidos arreglos de baterías
                            que superen este límite por seguridad.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎮</div>
                        <h3 className="rule-card-title">Control</h3>
                        <p className="rule-card-text">
                            Se permiten sistemas asistidos (sensores ultra/línea).
                            Prohibidos sistemas 100% autónomos. Comunicación libre (BT, WiFi, RF).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚔️</div>
                        <h3 className="rule-card-title">Armas</h3>
                        <p className="rule-card-text">
                            Se permiten navajas u objetos de empuje pasivos.
                            Prohibido dañar intencionalmente el dojo o al rival con fuego/líquidos.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Dinámica de Competencia" variant="dark">
                <p>
                    Las batallas se desarrollan en un <strong>dojo</strong> circular de 77 cm de diámetro.
                    La competencia consta de Fase de Clasificación y Eliminatoria Directa.
                </p>
                <ul>
                    <li><strong>Matches:</strong> Al mejor de 3 rounds. Cada round dura máximo 1 minuto.</li>
                    <li><strong>Puntuación:</strong> 1 punto por Match ganado (2 de 3 rounds).</li>
                    <li><strong>Desempate:</strong> Se prioriza el Knock Out (sacar al rival del dojo).</li>
                    <li><strong>Inicio:</strong> Round 1 espalda con espalda. Round 2 y 3 estilo europeo.</li>
                </ul>
            </ContentSection>

            <ContentSection title="Área de Competencia e Incidentes" variant="light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#6A0DAD]">Dojo</h3>
                        <p className="text-gray-800 mb-4">
                            Área circular de 77 cm de diámetro con borde blanco delimitador. Superficie lisa y plana.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#6A0DAD]">Tiempo de Combate</h3>
                        <p className="text-gray-800">
                            Cada round dura máximo 1 minuto. Si no hay Knock Out, el juez determina al ganador por agresividad y control.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-[#6A0DAD]">Tiempo Técnico</h3>
                        <p className="text-gray-800 mb-4">
                            30 segundos entre rounds para ajustes y reparaciones menores.
                        </p>

                        <h3 className="text-xl font-bold mb-2 text-[#6A0DAD]">Intervención</h3>
                        <p className="text-gray-800">
                            Prohibido tocar los robots durante el combate. Solo el Staff puede intervenir en caso de emergencia.
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
                                <span className="font-semibold text-white/90">MINISUMO_REGLAMENTO OFICIALv1.pdf</span>
                            </div>
                            <a
                                href="/api/docs/MINISUMO_REGLAMENTO%20OFICIALv1.pdf"
                                download="MINISUMO_REGLAMENTO_OFICIAL.pdf"
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

                        <PDFViewer url="/api/docs/MINISUMO_REGLAMENTO%20OFICIALv1.pdf" />

                    </div>
                    <p className="text-center mt-4 text-sm text-gray-500">
                        ¿No puedes ver el documento? <a href="/api/docs/MINISUMO_REGLAMENTO%20OFICIALv1.pdf" target="_blank" className="text-blue-600 hover:underline">Ábrelo en una nueva pestaña</a>
                    </p>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
