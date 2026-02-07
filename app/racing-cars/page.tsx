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
                subtitle="Carreras de Obstáculos RC"
                description="Velocidad, precisión y estrategia en cada curva. ¿Tienes lo necesario para dominar la pista?"
                accentColor="#E32636"
            />

            <ContentSection title="¿Qué es Racing Cars?" variant="dark">
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

            <ContentSection title="Reglas de Competencia" variant="light">
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-card-icon">🏎️</div>
                        <h3 className="rule-card-title">Vehículos</h3>
                        <p className="rule-card-text">
                            Se permiten vehículos RC escala 1:10 o 1:16. Deben ser todoterreno
                            con tracción 4x4 o 2WD.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">⏱️</div>
                        <h3 className="rule-card-title">Tiempo</h3>
                        <p className="rule-card-text">
                            Cada corredor tiene 3 intentos. Se registra el mejor tiempo.
                            Penalizaciones de +5 segundos por obstáculo derribado.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🏁</div>
                        <h3 className="rule-card-title">Pista</h3>
                        <p className="rule-card-text">
                            Circuito mixto con rampas, curvas cerradas, zonas de arena y
                            obstáculos móviles. Longitud aproximada: 50 metros.
                        </p>
                    </div>
                    <div className="rule-card">
                        <div className="rule-card-icon">🎮</div>
                        <h3 className="rule-card-title">Control</h3>
                        <p className="rule-card-text">
                            Control remoto de 2.4GHz obligatorio. No se permiten sistemas
                            de piloto automático ni asistencias electrónicas.
                        </p>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="Premios" variant="primary">
                <p>
                    Los tres primeros lugares recibirán reconocimiento oficial, trofeos
                    personalizados y premios sorpresa de nuestros patrocinadores.
                </p>
                <ul>
                    <li><strong>1er Lugar:</strong> Trofeo + Premio + Certificado</li>
                    <li><strong>2do Lugar:</strong> Medalla + Premio + Certificado</li>
                    <li><strong>3er Lugar:</strong> Medalla + Certificado</li>
                </ul>
                <div className="cta-container">
                    <a href="/" className="btn btn-accent">Inscríbete Ahora</a>
                </div>
            </ContentSection>

            <Footer />
        </div>
    )
}
