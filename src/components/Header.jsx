import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Avatar from './Avatar'
import './Header.css'

const Header = ({ isAdmin = false, public: isPublic = false }) => {
  const { currentUser, userProfile, logout, isAdmin: checkAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate(isPublic ? '/' : '/login')
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const basePath = isPublic ? '/' : isAdmin ? '/admin' : '/member'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path) => {
    if (path === basePath) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const NavLink = ({ to, children }) => {
    const active = isActive(to)
    return (
      <li>
        <Link 
          to={to} 
          onClick={closeMobileMenu}
          className={active ? 'active' : ''}
        >
          {children}
        </Link>
      </li>
    )
  }

  return (
    <header className="header">
      <div className="header-container container">
        <Link to={basePath} className="logo" onClick={closeMobileMenu}>
          <img src="/assets/logo.svg" alt="Hub Portal" className="logo-image" />
          <h2 className="gradient-text">Hub Portal</h2>
        </Link>
        
        <nav className="nav">
          <ul className="nav-list">
            {isPublic ? (
              <>
                <li><Link to="/" onClick={closeMobileMenu} className={location.pathname === '/' && !location.hash ? 'active' : ''}>Home</Link></li>
                <li><a href="#amenities" onClick={closeMobileMenu} className={location.hash === '#amenities' ? 'active' : ''}>Amenities</a></li>
                <li><a href="#events" onClick={closeMobileMenu} className={location.hash === '#events' ? 'active' : ''}>Events</a></li>
              </>
            ) : isAdmin ? (
              <>
                <NavLink to="/admin">Dashboard</NavLink>
                <NavLink to="/admin/members">Members</NavLink>
                <NavLink to="/admin/amenities">Amenities</NavLink>
                <NavLink to="/admin/bookings">Bookings</NavLink>
                <NavLink to="/admin/events">Events</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/member">Dashboard</NavLink>
                <NavLink to="/member/bookings">My Bookings</NavLink>
                <NavLink to="/member/events">Events</NavLink>
                <NavLink to="/member/profile">Profile</NavLink>
              </>
            )}
          </ul>
        </nav>

        <div className="header-user">
          {isPublic ? (
            !currentUser ? (
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
            ) : (
              <>
                {userProfile && (
                  <div className="user-info">
                    <Avatar 
                      src={userProfile.photoURL} 
                      name={userProfile.displayName}
                      size="md"
                    />
                    <span className="user-name">{userProfile.displayName}</span>
                  </div>
                )}
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )
          ) : (
            <>
              {userProfile && (
                <div className="user-info">
                  <Avatar 
                    src={userProfile.photoURL} 
                    name={userProfile.displayName}
                    size="md"
                  />
                  <span className="user-name">{userProfile.displayName}</span>
                </div>
              )}
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          {!isPublic && userProfile && (
            <div className="mobile-user-info">
              <Avatar 
                src={userProfile.photoURL} 
                name={userProfile.displayName}
                size="lg"
              />
              <div className="mobile-user-details">
                <div className="mobile-user-name">{userProfile.displayName}</div>
                <div className="mobile-user-email">{userProfile.email}</div>
              </div>
            </div>
          )}
        </div>
        <ul className="mobile-nav-list">
          {isPublic ? (
            <>
              <li><Link to="/" onClick={closeMobileMenu} className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
              <li><a href="#amenities" onClick={closeMobileMenu} className={location.hash === '#amenities' ? 'active' : ''}>Amenities</a></li>
              <li><a href="#events" onClick={closeMobileMenu} className={location.hash === '#events' ? 'active' : ''}>Events</a></li>
            </>
          ) : (
            navLinks
          )}
        </ul>
        <div className="mobile-nav-footer">
          {isPublic ? (
            !currentUser ? (
              <Link to="/login" className="btn btn-primary btn-full-width" onClick={closeMobileMenu}>
                Log In
              </Link>
            ) : (
              <button className="btn btn-secondary btn-full-width" onClick={handleLogout}>
                Logout
              </button>
            )
          ) : (
            <button className="btn btn-secondary btn-full-width" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
