import Header from './Header'
import Footer from './Footer'
import './Layout.css'

const Layout = ({ children, isAdmin = false, public: isPublic = false }) => {
  return (
    <div className="layout">
      <Header isAdmin={isAdmin} public={isPublic} />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
