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
                subtitle="Batalla de Robots"
                description="Dos robots, un dojo, un solo objetivo: sacar al oponente del área de combate."
                accentColor="#FFD700"
            />

            <ContentSection title="¿Qué es Sumo RC?" variant="dark">
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
                        <div className="rule-card-icon">🤖</div>
                        <h3 className="rule-card-title">Dimensiones</h3>
                        <p className="rule-card-text">
                            Máximo 10x10 cm de base. Altura libre. Peso máximo: 500 gramos
                            incluyendo baterías.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⚡</div>
                        <h3 className="rule-card-title">Alimentación</h3>
                        <p className="rule-card-text">
                            Baterías de máximo 9V. Se permiten LiPo, NiMH o alcalinas.
                            No se permiten fuentes externas.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎯</div>
                        <h3 className="rule-card-title">Sensores</h3>
                        <p className="rule-card-text">
                            Se permiten sensores de línea, proximidad e infrarrojos.
                            El robot debe ser 100% autónomo durante la batalla.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🔧</div>
                        <h3 className="rule-card-title">Construcción</h3>
                        <p className="rule-card-text">
                            Materiales libres. Prohibidos elementos que dañen al oponente
                            (cuchillas, fuego, líquidos, etc.).
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Formato de Competencia" variant="dark">
                <p>
                    Las batallas se desarrollan en un <strong>dojo</strong> circular de 77 cm de
                    diámetro con borde blanco. El combate inicia cuando ambos robots están
                    posicionados y el árbitro da la señal.
                </p>
                <ul>
                    <li>Cada enfrentamiento consta de <strong>3 rounds</strong></li>
                    <li>Gana el round quien saque primero al oponente del dojo</li>
                    <li>Tiempo máximo por round: <strong>3 minutos</strong></li>
                    <li>En caso de empate, gana el robot con más actividad</li>
                </ul>
                <div className="cta-container">
                    <a href="/" className="btn btn-primary">Inscríbete Ahora</a>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
