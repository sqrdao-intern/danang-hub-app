// Gemini AI service for smart booking suggestions and chatbot

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
// Using gemini-2.5-flash (stable model) - see https://ai.google.dev/gemini-api/docs/models
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export const getSmartBookingSuggestions = async (preferences = {}) => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured')
    return null
  }

  try {
    const prompt = `Based on the following preferences, suggest the best time slots and amenities for booking:
- Preferred time: ${preferences.preferredTime || 'any'}
- Duration: ${preferences.duration || '2 hours'}
- Amenity type: ${preferences.amenityType || 'any'}
- Day of week: ${preferences.dayOfWeek || 'any'}

Provide exactly 3 suggestions in a JSON array format. Each suggestion must have:
- suggestion_id: (1, 2, or 3)
- time_slot: (format like "12:00 - 14:00")
- recommended_amenity: (name of the amenity like "Meeting Room", "Desk", or "Podcast Room")

Return ONLY valid JSON array, no other text. Example format:
[
  {
    "suggestion_id": 1,
    "time_slot": "12:00 - 14:00",
    "recommended_amenity": "Meeting Room"
  },
  {
    "suggestion_id": 2,
    "time_slot": "14:00 - 16:00",
    "recommended_amenity": "Desk"
  },
  {
    "suggestion_id": 3,
    "time_slot": "16:00 - 18:00",
    "recommended_amenity": "Podcast Room"
  }
]`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    console.error('Error getting smart booking suggestions:', error)
    return null
  }
}

export const chatWithGemini = async (message, conversationHistory = []) => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured')
    return 'AI assistant is not available. Please configure your Gemini API key.'
  }

  try {
    const systemContext = `You are a helpful assistant for Danang Blockchain Hub. 
You help members with:
- Booking amenities (desks, meeting rooms, podcast rooms)
- Finding available time slots
- Event information
- General questions about the hub

Be friendly, concise, and helpful.`

    // Build contents array - Gemini API expects array of content objects
    const contents = [
      {
        parts: [{ text: systemContext }]
      },
      ...conversationHistory.map(msg => ({
        parts: [{ text: msg.content }]
      })),
      {
        parts: [{ text: message }]
      }
    ]

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.'
  } catch (error) {
    console.error('Error chatting with Gemini:', error)
    return 'Sorry, I encountered an error. Please try again later.'
  }
}
