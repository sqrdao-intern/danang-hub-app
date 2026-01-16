import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getBookings } from '../services/bookings'
import { getApprovedEvents } from '../services/events'
import { getAmenities } from '../services/amenities'
import './UnifiedCalendar.css'

const UnifiedCalendar = ({ viewMode = 'month' }) => {
  const { currentUser } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all', 'bookings', 'events'
  const [selectedAmenityType, setSelectedAmenityType] = useState('')

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  })

  const { data: events = [] } = useQuery({
    queryKey: ['approvedEvents'],
    queryFn: getApprovedEvents
  })

  const { data: amenities = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities
  })

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(b => 
      ['pending', 'approved', 'checked-in'].includes(b.status)
    )

    if (selectedAmenityType) {
      filtered = filtered.filter(b => {
        const amenity = amenities.find(a => a.id === b.amenityId)
        return amenity?.type === selectedAmenityType
      })
    }

    return filtered
  }, [bookings, selectedAmenityType, amenities])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => new Date(e.date) >= new Date())
  }, [events])

  // Get items for current month
  const calendarItems = useMemo(() => {
    const items = []
    
    if (selectedFilter === 'all' || selectedFilter === 'bookings') {
      filteredBookings.forEach(booking => {
        items.push({
          type: 'booking',
          id: booking.id,
          title: amenities.find(a => a.id === booking.amenityId)?.name || 'Unknown Amenity',
          start: new Date(booking.startTime),
          end: new Date(booking.endTime),
          isMine: booking.memberId === currentUser?.uid,
          data: booking
        })
      })
    }

    if (selectedFilter === 'all' || selectedFilter === 'events') {
      filteredEvents.forEach(event => {
        items.push({
          type: 'event',
          id: event.id,
          title: event.title,
          start: new Date(event.date),
          end: new Date(event.date),
          isMine: event.attendees?.includes(currentUser?.uid) || false,
          data: event
        })
      })
    }

    return items
  }, [filteredBookings, filteredEvents, selectedFilter, amenities, currentUser])

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped = {}
    calendarItems.forEach(item => {
      const dateKey = item.start.toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })
    return grouped
  }, [calendarItems])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)
    }

    return days
  }, [currentDate])

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getDayItems = (date) => {
    if (!date) return []
    return itemsByDate[date.toDateString()] || []
  }

  const uniqueAmenityTypes = useMemo(() => {
    const types = new Set()
    amenities.forEach(a => {
      if (a.type) types.add(a.type)
    })
    return Array.from(types)
  }, [amenities])

  return (
    <div className="unified-calendar">
      <div className="calendar-controls">
        <div className="calendar-nav">
          <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
            ← Prev
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleToday}>
            Today
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
            Next →
          </button>
        </div>
        <h2 className="calendar-title">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="calendar-filters">
          <select
            className="form-field filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="bookings">Bookings Only</option>
            <option value="events">Events Only</option>
          </select>
          {selectedFilter === 'all' || selectedFilter === 'bookings' ? (
            <select
              className="form-field filter-select"
              value={selectedAmenityType}
              onChange={(e) => setSelectedAmenityType(e.target.value)}
            >
              <option value="">All Amenity Types</option>
              {uniqueAmenityTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="calendar-grid-month">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {calendarDays.map((date, index) => {
            const isToday = date && date.toDateString() === new Date().toDateString()
            const dayItems = getDayItems(date)
            
            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {date && (
                  <>
                    <div className="day-number">{date.getDate()}</div>
                    <div className="day-items">
                      {dayItems.slice(0, 3).map(item => (
                        <div
                          key={item.id}
                          className={`day-item day-item-${item.type} ${item.isMine ? 'mine' : ''}`}
                          title={`${item.type === 'booking' ? 'Booking' : 'Event'}: ${item.title}`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <div className="day-item-more">
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color day-item-booking"></div>
          <span>Booking</span>
        </div>
        <div className="legend-item">
          <div className="legend-color day-item-event"></div>
          <span>Event</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mine"></div>
          <span>Yours</span>
        </div>
      </div>
    </div>
  )
}

export default UnifiedCalendar
