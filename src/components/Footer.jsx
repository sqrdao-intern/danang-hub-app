import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container container">
        <p className="footer-copyright">
          © {currentYear} sqrDAO. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
