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
                <p className="mt-4">
                    <strong>Fecha del evento:</strong> 13 de marzo de 2026.<br />
                    <strong>Costo de inscripción:</strong> $100.00 MXN.<br />
                    <strong>Integrantes:</strong> Máximo 5 personas por equipo.<br />
                    <strong>Premios:</strong> 1er Lugar: $1,000 MXN, 2do y 3er Lugar: Reconocimiento y obsequio.
                </p>
            </ContentSection>

            <ContentSection title="Especificaciones Técnicas" variant="light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-lg border border-black/10">
                        <h3 className="text-xl font-bold mb-4 text-[#2E7D32]">Dimensiones y Peso</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li><strong>Máximo:</strong> 15 x 15 x 15 cm.</li>
                            <li><strong>Peso:</strong> Máximo 500g.</li>
                            <li>El área total no debe exceder los 15 cm.</li>
                            <li><strong>Construcción:</strong> Libre (ruedas, orugas, patas).</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg border border-black/10">
                        <h3 className="text-xl font-bold mb-4 text-[#2E7D32]">Electrónica y Control</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li><strong>Voltaje Máximo:</strong> 12V.</li>
                            <li><strong>Control:</strong> 100% Remoto (Bluetooth, RF, Wi-Fi).</li>
                            <li><strong>Prohibido:</strong> Sensores para autonomía (ultrasónicos, proximidad).</li>
                            <li><strong>Baterías:</strong> Arreglos no pueden superar 12V.</li>
                        </ul>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Reglas del Juego" variant="dark">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">⚽</div>
                        <h3 className="rule-card-title">Equipos</h3>
                        <p className="rule-card-text">
                            2 robots por equipo en cancha simultáneamente.
                            Cambios ilimitados permitidos.
                        </p>
                    </div>
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
                </div>
            </ContentSection>

            <ContentSection title="Reglamento Oficial" variant="light" customMaxWidth="100%">
                {/* CAMBIO AQUÍ: w-[80%] define el ancho y mx-auto lo centra */}
                <div className="w-[80%] mx-auto">

                    <div className="bg-[#1a1a1a] p-2 rounded-xl shadow-2xl border border-white/10">
                        {/* ... resto de tu código del header ... */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0D0D1A] rounded-t-lg">
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

            <div className="bg-[#1a1a1a] py-12 text-center">
                <a href="https://racing-cup.vercel.app/eventos" className="btn btn-primary text-xl px-12 py-4">
                    Inscríbete Ahora
                </a>
                <p className="mt-4 text-white/50 text-sm">¿Dudas? Contacto: 55 4706 1280</p>
            </div>

            <Footer />
        </div>
    )
}
