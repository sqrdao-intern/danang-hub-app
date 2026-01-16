import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/assets/logo.svg" alt="Danang Hub" className="footer-logo-image" />
              <h3 className="gradient-text">Danang Blockchain Hub</h3>
            </div>
            <p className="footer-description">
              Empowering the blockchain community in Da Nang with a collaborative space for innovation, networking, and growth.
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
            <h4 className="footer-title">Admin</h4>
            <ul className="footer-links">
              <li><a href="/admin">Dashboard</a></li>
              <li><a href="/admin/members">Members</a></li>
              <li><a href="/admin/amenities">Amenities</a></li>
              <li><a href="/admin/bookings">Bookings</a></li>
              <li><a href="/admin/events">Events</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contact</h4>
            <ul className="footer-links">
              <li>Da Nang, Vietnam</li>
              <li>Email: info@dananghub.com</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Danang Blockchain Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
