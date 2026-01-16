import { useState } from 'react'
import { getSmartBookingSuggestions } from '../services/gemini'
import './SmartBookingSuggestions.css'

const SmartBookingSuggestions = ({ onSelectSuggestion, amenities = [] }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [preferences, setPreferences] = useState({
    preferredTime: '',
    duration: '2',
    amenityType: '',
    dayOfWeek: ''
  })

  const parseSuggestions = (text) => {
    if (!text) return null

    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      // If no JSON array found, try to parse the entire text
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      // Fallback: return null and show raw text
      return null;
    }

    return null;
  }

  const findMatchingAmenity = (amenityName) => {
    if (!amenityName) return null;
    
    const lowerName = amenityName.toLowerCase();
    
    // Try exact match first
    let match = amenities.find(a => 
      a.name.toLowerCase() === lowerName ||
      a.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(a.name.toLowerCase())
    );

    // Try type matching
    if (!match) {
      if (lowerName.includes('meeting') || lowerName.includes('room')) {
        match = amenities.find(a => a.type === 'meeting-room');
      } else if (lowerName.includes('desk') || lowerName.includes('workspace')) {
        match = amenities.find(a => a.type === 'desk');
      } else if (lowerName.includes('podcast')) {
        match = amenities.find(a => a.type === 'podcast-room');
      }
    }

    return match;
  }

  const handleGetSuggestions = async () => {
    setIsLoading(true)
    try {
      const result = await getSmartBookingSuggestions(preferences)
      const parsed = parseSuggestions(result)
      setSuggestions(parsed ? { parsed, raw: result } : { parsed: null, raw: result })
    } catch (error) {
      console.error('Error getting suggestions:', error)
      setSuggestions({ parsed: null, raw: 'Failed to get suggestions. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSuggestion = (suggestion) => {
    if (onSelectSuggestion) {
      const amenity = findMatchingAmenity(suggestion.recommended_amenity);
      if (amenity) {
        onSelectSuggestion({
          amenity,
          timeSlot: suggestion.time_slot || suggestion.timeSlot,
          suggestion
        });
      } else {
        // Show alert with instructions
        alert(`Could not find "${suggestion.recommended_amenity}" in available amenities.\n\nPlease scroll up to "Available Amenities" and click "Book Now" on your preferred amenity.`);
      }
    }
  }

  const handleSelectManually = () => {
    // Scroll to amenities section
    const amenitiesSection = document.querySelector('.amenities-grid');
    if (amenitiesSection) {
      amenitiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="smart-booking-suggestions glass">
      <h3 className="suggestions-title">AI Booking Suggestions</h3>
      <p className="suggestions-description">
        Get smart recommendations for the best time slots and amenities
      </p>

      <div className="suggestions-form">
        <div className="form-group">
          <label className="form-label">Preferred Time</label>
          <input
            type="time"
            className="form-field"
            value={preferences.preferredTime}
            onChange={(e) => setPreferences({ ...preferences, preferredTime: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Duration (hours)</label>
          <input
            type="number"
            className="form-field"
            min="1"
            max="8"
            value={preferences.duration}
            onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amenity Type</label>
          <select
            className="form-field"
            value={preferences.amenityType}
            onChange={(e) => setPreferences({ ...preferences, amenityType: e.target.value })}
          >
            <option value="">Any</option>
            <option value="desk">Desk</option>
            <option value="meeting-room">Meeting Room</option>
            <option value="podcast-room">Podcast Room</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Day of Week</label>
          <select
            className="form-field"
            value={preferences.dayOfWeek}
            onChange={(e) => setPreferences({ ...preferences, dayOfWeek: e.target.value })}
          >
            <option value="">Any</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleGetSuggestions}
          disabled={isLoading}
        >
          {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
        </button>
      </div>

      {suggestions && (
        <div className="suggestions-results">
          <h4>Suggestions:</h4>
          {suggestions.parsed ? (
            <div className="suggestions-grid">
              {suggestions.parsed.map((suggestion, index) => {
                const amenity = findMatchingAmenity(suggestion.recommended_amenity);
                return (
                  <div key={suggestion.suggestion_id || index} className="suggestion-card">
                    <div className="suggestion-header">
                      <span className="suggestion-number">#{suggestion.suggestion_id || index + 1}</span>
                      <span className="suggestion-time">{suggestion.time_slot || suggestion.timeSlot}</span>
                    </div>
                    <div className="suggestion-content">
                      <h5 className="suggestion-amenity">
                        {suggestion.recommended_amenity || suggestion.recommendedAmenity}
                      </h5>
                      {amenity && (
                        <p className="suggestion-amenity-info">
                          {amenity.description || `Capacity: ${amenity.capacity || 'N/A'}`}
                        </p>
                      )}
                    </div>
                    {amenity ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBookSuggestion(suggestion)}
                      >
                        📅 Book This Slot
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleSelectManually}
                      >
                        ↑ Select Amenity Above
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="suggestions-raw">
              <p className="suggestions-error">Could not parse suggestions. Raw response:</p>
              <pre className="suggestions-raw-text">{suggestions.raw}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartBookingSuggestions
