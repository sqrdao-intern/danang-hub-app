import { useState, useEffect } from 'react'
import './Toast.css'

let toastIdCounter = 0
const toastListeners = new Set()

export const showToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastIdCounter
  const toast = { id, message, type, duration }
  
  toastListeners.forEach(listener => listener(toast))
  return id
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast])
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.duration)
    }

    toastListeners.add(listener)
    return () => {
      toastListeners.delete(listener)
    }
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
