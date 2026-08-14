
import { Link } from "react-router-dom";
import "../styles/components/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/">
            <span className="footer-brand-mark">P</span>
            <strong>ParkNGo</strong>
          </Link>
          <p>Easy parking, made neighborly.</p>
        </div>

        <div className="footer-column">
          <h2>Explore</h2>
          <Link to="/">Find parking</Link>
        </div>

        <div className="footer-column">
          <h2>Hosting</h2>
          <Link to="/host">List your spot</Link>
        </div>

        {/* These labels can become links when the support pages are added. */}
        <div className="footer-column footer-future-links">
          <h2>Support</h2>
          <span>Help center</span>
          <span>Safety information</span>
          <span>Terms and privacy</span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import "../styles/components/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/">
            <span className="footer-brand-mark">P</span>
            <strong>ParkNGo</strong>
          </Link>
          <p>Easy parking, made neighborly.</p>
        </div>

        <div className="footer-column">
          <h2>Explore</h2>
          <Link to="/">Find parking</Link>
        </div>

        <div className="footer-column">
          <h2>Hosting</h2>
          <Link to="/host">List your spot</Link>
        </div>

        {/* These labels can become links when the support pages are added. */}
        <div className="footer-column footer-future-links">
          <h2>Support</h2>
          <span>Help center</span>
          <span>Safety information</span>
          <span>Terms and privacy</span>
        </div>
      </div>
    </footer>
  );
}

