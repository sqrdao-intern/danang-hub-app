import Header from './Header'
import './Layout.css'

const Layout = ({ children, isAdmin = false }) => {
  return (
    <div className="layout">
      <Header isAdmin={isAdmin} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
