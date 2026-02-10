'use client'

import Navbar from '@/components/common/Navbar'
import Footer from '@/components/common/Footer'
import CategoryHero from '@/components/pages/CategoryHero'
import ContentSection from '@/components/pages/ContentSection'

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
