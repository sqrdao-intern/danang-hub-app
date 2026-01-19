import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import './AuthPrompt.css'

const AuthPrompt = ({ isOpen, onClose, action = 'book', onLogin, onSignUp }) => {
  const navigate = useNavigate()

  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      navigate('/login')
    }
    onClose()
  }

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp()
    } else {
      navigate('/login?signup=true')
    }
    onClose()
  }

  const actionText = {
    book: 'book an amenity',
    register: 'register for this event',
    create: 'create an event',
    default: 'perform this action'
  }[action] || actionText.default

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In Required"
    >
      <div className="auth-prompt-content">
        <p className="auth-prompt-message">
          You need to sign in to {actionText}.
        </p>
        <p className="auth-prompt-submessage">
          Don't have an account? Sign up now to get started!
        </p>
        <div className="auth-prompt-actions">
          <button
            className="btn btn-primary"
            onClick={handleLogin}
          >
            Sign In
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AuthPrompt
