'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'

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

            <ContentSection title="Especificaciones Técnicas" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">📏</div>
                        <h3 className="rule-card-title">Dimensiones</h3>
                        <p className="rule-card-text">
                            Máximo 30 cm de largo. El área de ancho/alto no debe exceder
                            20 cm x 20 cm. No hay dimensiones mínimas.
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
                            Se permiten sistemas asistidos (FPV, sensores de proximidad).
                            Prohibidos sistemas 100% autónomos. Comunicación libre (BT, WiFi, RF).
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">👥</div>
                        <h3 className="rule-card-title">Equipo</h3>
                        <p className="rule-card-text">
                            Máximo 5 integrantes por equipo (se permite incluir un docente).
                            Costo de inscripción: $100.00 MXN.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Dinámica de Competencia" variant="dark">
                <p>
                    La competencia se divide en dos fases: <strong>Clasificación</strong> y <strong>Eliminatoria Directa</strong>.
                    El circuito tiene una longitud de 15 metros e incluye terreno irregular y rampas.
                </p>
                <ul>
                    <li><strong>Fase de Clasificación:</strong> Matches de 2 equipos. Victoria (3 pts), Empate (1 pt).</li>
                    <li><strong>Criterio de Avance:</strong> Los equipos con mayor puntuación avanzan al Top 16.</li>
                    <li><strong>Fase Final:</strong> Eliminatoria directa (Top 16). El primero en cruzar la meta gana.</li>
                    <li><strong>Tiempo Límite:</strong> 3 minutos por match. Si nadie termina, es empate.</li>
                </ul>
                <div className="cta-container">
                    <a href="https://racing-cup.vercel.app/" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Inscríbete Ahora</a>
                </div>
            </ContentSection>

            <ContentSection title="Premios" variant="primary">
                <p>
                    Se premiará a los ganadores de los niveles Media Superior y Superior.
                </p>

                <h3 className="text-xl font-bold mb-4 mt-6 text-white text-center">🏆 Nivel Media Superior</h3>
                <ul>
                    <li><strong>1er Lugar:</strong> $1,500 MXN + Diploma</li>
                    <li><strong>2do Lugar:</strong> $1,000 MXN + Diploma</li>
                    <li><strong>3er Lugar:</strong> Obsequio Especial + Diploma</li>
                </ul>

                <h3 className="text-xl font-bold mb-4 mt-6 text-white text-center">🏆 Nivel Superior</h3>
                <ul>
                    <li><strong>1er Lugar:</strong> $1,000 MXN + Diploma</li>
                    <li><strong>2do Lugar:</strong> $500 MXN + Diploma</li>
                    <li><strong>3er Lugar:</strong> Obsequio Especial + Diploma</li>
                </ul>

                <div className="cta-container">
                    <a href="https://racing-cup.vercel.app/ayuda" className="btn btn-accent" target="_blank" rel="noopener noreferrer">Ver Guía de Inscripción</a>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
