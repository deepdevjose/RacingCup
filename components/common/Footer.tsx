'use client'

import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer-section">
            <div className="footer-container">

                {/* Contact Info */}
                <div className="footer-contact">
                    <p className="footer-label">Para más información, partnership y prensa:</p>
                    <a href="mailto:tics@itsoeh.com.mx" className="footer-email">
                        tics@itsoeh.com.mx
                    </a>
                </div>

                {/* Credits */}
                <div className="footer-credits">
                    <p>Racing Cup </p>
                    <p>Website design & code by <a href="https://github.com/deepdevjose">Deep Dev Jose</a> and <a href="https://github.com/EDUARDOVAZQUE">Measly543</a>.</p>
                </div>

                <div className="footer-divider"></div>

                {/* Bottom Row */}
                <div className="footer-bottom">
                    <div className="footer-logo">
                        <h2 className="vroom-logo-text">RACING CUP</h2>
                    </div>
                    <div className="footer-copyright">
                        <p>Copyright © 2026 Racing Cup. All rights reserved.</p>
                    </div>
                </div>

            </div>
        </footer>
    )
}
