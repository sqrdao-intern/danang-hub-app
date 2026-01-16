import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import { getAmenities, createAmenity, updateAmenity, deleteAmenity, DEFAULT_AVAILABILITY } from '../../services/amenities'
import { showToast } from '../../components/Toast'
import './Amenities.css'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

const AdminAmenities = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(true)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [availableDays, setAvailableDays] = useState(DEFAULT_AVAILABILITY.availableDays)
  const queryClient = useQueryClient()

  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  })

  const createMutation = useMutation({
    mutationFn: createAmenity,
    onSuccess: () => {
      queryClient.invalidateQueries(['amenities'])
      setIsModalOpen(false)
      resetForm()
      showToast('Amenity created successfully!', 'success')
    },
    onError: () => {
      showToast('Failed to create amenity. Please try again.', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAmenity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['amenities'])
      setIsModalOpen(false)
      resetForm()
      showToast('Amenity updated successfully!', 'success')
    },
    onError: () => {
      showToast('Failed to update amenity. Please try again.', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => {
      queryClient.invalidateQueries(['amenities'])
      showToast('Amenity deleted successfully!', 'success')
    }
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateAmenity(id, { isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries(['amenities'])
      showToast('Availability updated!', 'success')
    }
  })

  const resetForm = () => {
    setSelectedAmenity(null)
    setIsCreateMode(true)
    setAvailableDays(DEFAULT_AVAILABILITY.availableDays)
  }

  const handleCreate = () => {
    setIsCreateMode(true)
    setSelectedAmenity(null)
    setAvailableDays(DEFAULT_AVAILABILITY.availableDays)
    setIsModalOpen(true)
  }

  const handleEdit = (amenity) => {
    setIsCreateMode(false)
    setSelectedAmenity(amenity)
    setAvailableDays(amenity.availableDays || DEFAULT_AVAILABILITY.availableDays)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleAvailability = (id, currentStatus) => {
    toggleAvailabilityMutation.mutate({ id, isAvailable: !currentStatus })
  }

  const handleDayToggle = (dayValue) => {
    if (availableDays.includes(dayValue)) {
      setAvailableDays(availableDays.filter(d => d !== dayValue))
    } else {
      setAvailableDays([...availableDays, dayValue].sort())
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      type: formData.get('type'),
      capacity: parseInt(formData.get('capacity')) || 1,
      description: formData.get('description'),
      isAvailable: formData.get('isAvailable') === 'true',
      startHour: parseInt(formData.get('startHour')) || DEFAULT_AVAILABILITY.startHour,
      endHour: parseInt(formData.get('endHour')) || DEFAULT_AVAILABILITY.endHour,
      slotDuration: parseInt(formData.get('slotDuration')) || DEFAULT_AVAILABILITY.slotDuration,
      availableDays: availableDays
    }

    if (isCreateMode) {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate({ id: selectedAmenity.id, data })
    }
  }

  const formatAvailableDays = (days) => {
    if (!days || days.length === 0) return 'None'
    if (days.length === 7) return 'Every day'
    if (JSON.stringify(days.sort()) === JSON.stringify([1, 2, 3, 4, 5])) return 'Mon-Fri'
    return days.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label.slice(0, 3)).join(', ')
  }

  if (isLoading) {
    return (
      <Layout isAdmin>
        <div className="container">
          <div className="spinner"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout isAdmin>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Amenities</h1>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Amenity
          </button>
        </div>

        <div className="amenities-grid">
          {amenities.map(amenity => (
            <div key={amenity.id} className="amenity-card glass">
              <div className="amenity-header">
                <h3 className="amenity-name">{amenity.name}</h3>
                <span className={`availability-badge ${amenity.isAvailable !== false ? 'available' : 'unavailable'}`}>
                  {amenity.isAvailable !== false ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="amenity-info">
                <p className="amenity-type">Type: {amenity.type || 'N/A'}</p>
                <p className="amenity-capacity">Capacity: {amenity.capacity || 'N/A'}</p>
                <p className="amenity-hours">
                  Hours: {amenity.startHour || DEFAULT_AVAILABILITY.startHour}:00 - {amenity.endHour || DEFAULT_AVAILABILITY.endHour}:00
                </p>
                <p className="amenity-days">
                  Days: {formatAvailableDays(amenity.availableDays || DEFAULT_AVAILABILITY.availableDays)}
                </p>
                <p className="amenity-slot">
                  Slot: {amenity.slotDuration || DEFAULT_AVAILABILITY.slotDuration} min
                </p>
                {amenity.description && (
                  <p className="amenity-description">{amenity.description}</p>
                )}
              </div>
              <div className="amenity-actions">
                <button
                  className={`btn ${amenity.isAvailable !== false ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => handleToggleAvailability(amenity.id, amenity.isAvailable !== false)}
                >
                  {amenity.isAvailable !== false ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(amenity)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(amenity.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            resetForm()
          }}
          title={isCreateMode ? 'Create Amenity' : 'Edit Amenity'}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-field"
                defaultValue={selectedAmenity?.name || ''}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" className="form-field" defaultValue={selectedAmenity?.type || ''} required>
                <option value="">Select type</option>
                <option value="desk">Desk</option>
                <option value="meeting-room">Meeting Room</option>
                <option value="podcast-room">Podcast Room</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input
                type="number"
                name="capacity"
                className="form-field"
                defaultValue={selectedAmenity?.capacity || 1}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-field"
                defaultValue={selectedAmenity?.description || ''}
                rows="3"
              />
            </div>

            <div className="form-section">
              <h4 className="form-section-title">Availability Settings</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Open From</label>
                  <select 
                    name="startHour" 
                    className="form-field"
                    defaultValue={selectedAmenity?.startHour || DEFAULT_AVAILABILITY.startHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Close At</label>
                  <select 
                    name="endHour" 
                    className="form-field"
                    defaultValue={selectedAmenity?.endHour || DEFAULT_AVAILABILITY.endHour}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Booking Slot Duration</label>
                <select 
                  name="slotDuration" 
                  className="form-field"
                  defaultValue={selectedAmenity?.slotDuration || DEFAULT_AVAILABILITY.slotDuration}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Available Days</label>
                <div className="days-selector">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day.value} className={`day-checkbox ${availableDays.includes(day.value) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={availableDays.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                      />
                      <span>{day.label.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="isAvailable" className="form-field" defaultValue={selectedAmenity?.isAvailable !== false ? 'true' : 'false'}>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isCreateMode ? 'Create' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
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

export default AdminAmenities
