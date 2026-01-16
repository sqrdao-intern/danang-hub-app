import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { 
  getApprovedEvents, 
  getMyEvents,
  createEvent,
  deleteEvent,
  registerForEvent, 
  unregisterFromEvent, 
  addToWaitlist, 
  removeFromWaitlist 
} from '../../services/events'
import { getMembers } from '../../services/members'
import { getAmenities } from '../../services/amenities'
import { showToast } from '../../components/Toast'
import './Events.css'

const MemberEvents = () => {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [linkAmenity, setLinkAmenity] = useState(false)

  // Fetch approved events (for registration)
  const { data: approvedEvents = [] } = useQuery({
    queryKey: ['approvedEvents'],
    queryFn: getApprovedEvents
  })

  // Fetch my created events (all statuses)
  const { data: myEvents = [] } = useQuery({
    queryKey: ['myEvents', currentUser?.uid],
    queryFn: () => getMyEvents(currentUser?.uid),
    enabled: !!currentUser?.uid
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  })

  const { data: amenities = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  })

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['myEvents'])
      queryClient.invalidateQueries(['approvedEvents'])
      setIsModalOpen(false)
      showToast('Event submitted for approval! You will be notified when approved.', 'success')
    },
    onError: () => {
      showToast('Failed to create event. Please try again.', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries(['myEvents'])
      showToast('Event request deleted.', 'success')
    },
    onError: () => {
      showToast('Failed to delete event. Please try again.', 'error')
    }
  })

  const registerMutation = useMutation({
    mutationFn: ({ eventId, memberId }) => registerForEvent(eventId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvedEvents'])
      showToast('Successfully registered for event!', 'success')
    },
    onError: () => {
      showToast('Failed to register. Please try again.', 'error')
    }
  })

  const unregisterMutation = useMutation({
    mutationFn: ({ eventId, memberId }) => unregisterFromEvent(eventId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvedEvents'])
      showToast('Successfully unregistered from event.', 'success')
    },
    onError: () => {
      showToast('Failed to unregister. Please try again.', 'error')
    }
  })

  const waitlistMutation = useMutation({
    mutationFn: ({ eventId, memberId }) => addToWaitlist(eventId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvedEvents'])
      showToast('Added to waitlist! You will be notified if a spot becomes available.', 'info')
    },
    onError: () => {
      showToast('Failed to join waitlist. Please try again.', 'error')
    }
  })

  const removeWaitlistMutation = useMutation({
    mutationFn: ({ eventId, memberId }) => removeFromWaitlist(eventId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['approvedEvents'])
      showToast('Removed from waitlist.', 'info')
    },
    onError: () => {
      showToast('Failed to remove from waitlist. Please try again.', 'error')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      capacity: parseInt(formData.get('capacity')) || 0,
      location: formData.get('location'),
      organizerId: currentUser.uid,
      status: 'pending',
      waitlist: []
    }

    // Handle optional amenity linking request
    if (linkAmenity) {
      const linkedAmenityId = formData.get('linkedAmenityId')
      if (linkedAmenityId) {
        data.requestedAmenityId = linkedAmenityId
        data.amenityNote = formData.get('amenityNote') || ''
      }
    }

    createMutation.mutate(data)
  }

  const handleDeleteMyEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event request?')) {
      await deleteMutation.mutateAsync(eventId)
    }
  }

  const getOrganizerName = (organizerId) => {
    const organizer = members.find(m => m.id === organizerId)
    return organizer?.displayName || organizerId
  }

  const isRegistered = (event) => {
    return event.attendees?.includes(currentUser?.uid) || false
  }

  const isFull = (event) => {
    return event.capacity && event.attendees?.length >= event.capacity
  }

  const isOnWaitlist = (event) => {
    return event.waitlist?.includes(currentUser?.uid) || false
  }

  const getWaitlistPosition = (event) => {
    if (!event.waitlist || !isOnWaitlist(event)) return null
    return event.waitlist.indexOf(currentUser?.uid) + 1
  }

  const handleRegister = async (eventId) => {
    await registerMutation.mutateAsync({ eventId, memberId: currentUser.uid })
  }

  const handleUnregister = async (eventId) => {
    if (window.confirm('Are you sure you want to unregister from this event?')) {
      await unregisterMutation.mutateAsync({ eventId, memberId: currentUser.uid })
    }
  }

  const handleJoinWaitlist = async (eventId) => {
    await waitlistMutation.mutateAsync({ eventId, memberId: currentUser.uid })
  }

  const handleLeaveWaitlist = async (eventId) => {
    await removeWaitlistMutation.mutateAsync({ eventId, memberId: currentUser.uid })
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected'
    }
    return statusClasses[status] || 'status-badge'
  }

  const upcomingEvents = approvedEvents.filter(e => new Date(e.date) > new Date())
  const pastEvents = approvedEvents.filter(e => new Date(e.date) <= new Date())

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Events</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Create Event
          </button>
        </div>
        <p className="page-subtitle">Browse, register, or create your own events</p>

        {/* My Created Events */}
        {myEvents.length > 0 && (
          <div className="events-section glass">
            <div className="section-header">
              <h2 className="section-title">My Event Requests</h2>
              <p className="section-description">Events you've created. Pending events await admin approval.</p>
            </div>
            <div className="events-grid">
              {myEvents.map(event => (
                <div key={event.id} className={`event-card my-event ${event.status}`}>
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={getStatusBadge(event.status)}>
                      {event.status}
                    </span>
                  </div>
                  <div className="event-info">
                    <p className="event-date">
                      📅 {event.date?.toLocaleDateString()} at {event.date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.location && (
                      <p className="event-location">📍 {event.location}</p>
                    )}
                    <p className="event-capacity">
                      👥 Capacity: {event.capacity || 'Unlimited'}
                    </p>
                    {event.status === 'rejected' && event.rejectionReason && (
                      <p className="event-rejection-reason">
                        ❌ Reason: {event.rejectionReason}
                      </p>
                    )}
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                  </div>
                  <div className="event-actions">
                    {event.status === 'pending' && (
                      <button
                        className="btn btn-danger btn-full-width"
                        onClick={() => handleDeleteMyEvent(event.id)}
                      >
                        Cancel Request
                      </button>
                    )}
                    {event.status === 'approved' && (
                      <p className="event-approved-note">✅ Your event is live!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events (Approved) */}
        <div className="events-section glass">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-description">Click "Register" to join an event. If full, join the waitlist!</p>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map(event => {
                const registered = isRegistered(event)
                const full = isFull(event)
                const onWaitlist = isOnWaitlist(event)
                const waitlistPosition = getWaitlistPosition(event)
                const isMyEvent = event.organizerId === currentUser?.uid
                return (
                  <div key={event.id} className={`event-card ${isMyEvent ? 'my-event-approved' : ''}`}>
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <span className="event-date-badge">
                        {event.date?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    <div className="event-info">
                      <p className="event-organizer">
                        Organizer: {getOrganizerName(event.organizerId)}
                        {isMyEvent && <span className="my-event-tag"> (You)</span>}
                      </p>
                      {event.location && (
                        <p className="event-location">📍 {event.location}</p>
                      )}
                      <p className="event-capacity">
                        👥 {event.attendees?.length || 0} / {event.capacity || '∞'} attendees
                      </p>
                      {event.waitlist && event.waitlist.length > 0 && (
                        <p className="event-waitlist">
                          {event.waitlist.length} on waitlist
                        </p>
                      )}
                      {waitlistPosition && (
                        <p className="event-waitlist-position">
                          Your position: #{waitlistPosition}
                        </p>
                      )}
                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}
                    </div>
                    <div className="event-actions">
                      {registered ? (
                        <button
                          className="btn btn-secondary btn-full-width"
                          onClick={() => handleUnregister(event.id)}
                        >
                          ✓ Registered - Click to Unregister
                        </button>
                      ) : onWaitlist ? (
                        <button
                          className="btn btn-secondary btn-full-width"
                          onClick={() => handleLeaveWaitlist(event.id)}
                        >
                          On Waitlist - Click to Leave
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary btn-full-width btn-large"
                            onClick={() => handleRegister(event.id)}
                            disabled={full}
                          >
                            {full ? 'Event Full' : '✓ Register for Event'}
                          </button>
                          {full && (
                            <button
                              className="btn btn-secondary btn-full-width"
                              onClick={() => handleJoinWaitlist(event.id)}
                              style={{ marginTop: '0.5rem' }}
                            >
                              Join Waitlist
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">No upcoming events. Why not create one?</p>
          )}
        </div>

        {/* Past Events */}
        <div className="events-section glass">
          <h2 className="section-title">Past Events</h2>
          {pastEvents.length > 0 ? (
            <div className="events-grid">
              {pastEvents.map(event => {
                const registered = isRegistered(event)
                return (
                  <div key={event.id} className="event-card past-event">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <span className="event-date-badge">
                        {event.date?.toLocaleDateString() || 'N/A'}
                      </span>
                    </div>
                    <div className="event-info">
                      <p className="event-organizer">
                        Organizer: {getOrganizerName(event.organizerId)}
                      </p>
                      {event.location && (
                        <p className="event-location">📍 {event.location}</p>
                      )}
                      {registered && (
                        <p className="event-attended">✅ You attended this event</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">No past events</p>
          )}
        </div>

        {/* Create Event Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setLinkAmenity(false)
          }}
          title="Create Event Request"
        >
          <p className="modal-description">
            Submit your event for approval. Once approved by an admin, it will appear on the calendar.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                name="title"
                className="form-field"
                placeholder="e.g., Web3 Workshop"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-field"
                placeholder="What's your event about?"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                className="form-field"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-field"
                placeholder="e.g., Main Hall, Room 101"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (leave 0 for unlimited)</label>
              <input
                type="number"
                name="capacity"
                className="form-field"
                defaultValue="0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={linkAmenity}
                  onChange={(e) => setLinkAmenity(e.target.checked)}
                />
                <span>Request amenity booking (e.g., meeting room)</span>
              </label>
            </div>
            {linkAmenity && (
              <>
                <div className="form-group">
                  <label className="form-label">Preferred Amenity</label>
                  <select name="linkedAmenityId" className="form-field">
                    <option value="">Select amenity</option>
                    {amenities.filter(a => a.isAvailable !== false).map(amenity => (
                      <option key={amenity.id} value={amenity.id}>
                        {amenity.name} ({amenity.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes for Admin</label>
                  <input
                    type="text"
                    name="amenityNote"
                    className="form-field"
                    placeholder="e.g., Need projector, extra chairs"
                  />
                </div>
              </>
            )}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setLinkAmenity(false)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default MemberEvents
