import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/assets/logo.svg" alt="Hub Portal" className="footer-logo-image" />
              <h3 className="gradient-text">Hub Portal</h3>
            </div>
            <p className="footer-description">
              Accelerating the Decentralized Future in Central Vietnam.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/member">Dashboard</a></li>
              <li><a href="/member/bookings">My Bookings</a></li>
              <li><a href="/member/events">Events</a></li>
              <li><a href="/member/profile">Profile</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Community</h4>
            <ul className="footer-links">
              <li><a href="https://www.facebook.com/profile.php?id=61576570201707" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://t.me/+7ycB8RxiZQY5MDNl" target="_blank" rel="noopener noreferrer">Telegram</a></li>
              <li><a href="mailto:gm@sqrdao.com">Email: gm@sqrdao.com</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} sqrDAO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
