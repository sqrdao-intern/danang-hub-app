import './LoadingSkeleton.css'

export const CalendarSkeleton = () => {
  return (
    <div className="calendar-skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-grid">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton-day-column">
            <div className="skeleton-day-header"></div>
            {Array.from({ length: 10 }).map((_, j) => (
              <div key={j} className="skeleton-time-slot"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="card-skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
        </div>
      ))}
    </div>
  )
}

export default CalendarSkeleton
