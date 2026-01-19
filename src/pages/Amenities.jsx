import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import AuthPrompt from '../components/AuthPrompt'
import { getAmenities } from '../services/amenities'
import './Amenities.css'

const Amenities = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  })

  const handleBookAmenity = (amenity) => {
    if (!currentUser) {
      setSelectedAmenity(amenity)
      setAuthPromptOpen(true)
    } else {
      navigate(`/member/bookings?amenityId=${amenity.id}`)
    }
  }

  const handleLogin = () => {
    if (selectedAmenity) {
      navigate(`/login?redirect=/member/bookings&amenityId=${selectedAmenity.id}`)
    } else {
      navigate('/login?redirect=/member/bookings')
    }
  }

  const handleSignUp = () => {
    if (selectedAmenity) {
      navigate(`/login?signup=true&redirect=/member/bookings&amenityId=${selectedAmenity.id}`)
    } else {
      navigate('/login?signup=true&redirect=/member/bookings')
    }
  }

  const availableAmenities = amenities.filter(a => a.isAvailable !== false)

  return (
    <Layout public>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Amenities</h1>
          <p className="page-subtitle">Browse available workspace amenities and facilities</p>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <p>Loading amenities...</p>
          </div>
        ) : availableAmenities.length > 0 ? (
          <div className="amenities-grid">
            {availableAmenities.map(amenity => (
              <div key={amenity.id} className="amenity-card glass">
                <div className="amenity-header">
                  <h3 className="amenity-name">{amenity.name}</h3>
                  <span className="amenity-type">{amenity.type}</span>
                </div>
                <div className="amenity-info">
                  {amenity.capacity && (
                    <p className="amenity-capacity">Capacity: {amenity.capacity}</p>
                  )}
                  {amenity.description && (
                    <p className="amenity-description">{amenity.description}</p>
                  )}
                  <div className="amenity-status">
                    <span className="status-badge available">Available</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-full-width"
                  onClick={() => handleBookAmenity(amenity)}
                >
                  📅 Book Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No amenities available at this time</p>
          </div>
        )}

        <AuthPrompt
          isOpen={authPromptOpen}
          onClose={() => {
            setAuthPromptOpen(false)
            setSelectedAmenity(null)
          }}
          action="book"
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      </div>
    </Layout>
  )
}

export default Amenities
