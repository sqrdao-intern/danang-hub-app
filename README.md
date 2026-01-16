# Danang Blockchain Hub Management App

A full-stack Firebase-powered React application for managing members, amenities, bookings, and events at Danang Blockchain Hub.

## Features

- **Authentication**: Google and social login via Firebase Auth
- **Member Management**: Profile management and member directory
- **Amenity Booking**: Calendar-based booking system with 30-min slots, conflict detection, and recurring bookings
- **Event Management**: Create events with approval workflow, waitlist system, and capacity management
- **Admin Dashboard**: Comprehensive admin interface for managing all aspects of the hub
- **Member Portal**: Self-service portal for members to book amenities and register for events
- **AI Integration**: Gemini AI for smart booking suggestions and chatbot support
- **Cloud Functions**: Automated tasks for conflict checking, notifications, and cleanup

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Styling**: Custom CSS matching landing page design
- **State Management**: React Query for data fetching
- **Routing**: React Router v6

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Start Development

```bash
npm run dev
```

Open http://localhost:3000

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Enter project name: `danang-hub-app`
3. Disable Google Analytics (optional) → Click **"Create project"**

### Step 2: Register Web App

1. In Firebase dashboard, click the **Web icon** (`</>`)
2. App nickname: `Danang Hub Web App`
3. **Do NOT** check "Firebase Hosting"
4. Click **"Register app"**
5. Copy the Firebase configuration object

### Step 3: Environment Setup

```bash
cp .env.example .env
```

Add your Firebase config to `.env`:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_GEMINI_API_KEY=your-gemini-api-key  # Optional, for AI features
```

### Step 4: Enable Firebase Services

#### Authentication
1. Go to **Build** → **Authentication** → Click **"Get started"**
2. Go to **Sign-in method** tab → Enable **Google** provider
3. Set project support email → Click **"Save"**

#### Firestore Database
1. Go to **Build** → **Firestore Database** → Click **"Create database"**
2. Choose **"Start in test mode"**
3. Select location (asia-southeast1 recommended)
4. Click **"Enable"**

#### Cloud Functions
1. Go to **Build** → **Functions** → Click **"Get started"**
2. **Enable billing** (Blaze plan required)

### Step 5: Deploy Firebase Resources

```bash
# Initialize Firebase (if first time)
firebase init
# Select: Firestore, Functions
# Use existing project

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

### Step 6: Grant Admin Access

1. Go to **Firestore Database** → **Data** tab
2. Find `members` collection → Find user document
3. Set `membershipType` field to `"admin"`

---

## Cloud Functions

### Deployed Functions

| Function | Type | Description |
|----------|------|-------------|
| `checkBookingConflicts` | Callable | Prevents double-booking |
| `autoCheckoutExpiredBookings` | Scheduled (hourly) | Auto checks out expired bookings |
| `sendBookingConfirmation` | Trigger | Notification on booking created |
| `sendEventReminders` | Scheduled (hourly) | Reminders for upcoming events |
| `promoteWaitlistedToAttendee` | Trigger | Auto-promotes from waitlist |
| `cleanupOldBookings` | Scheduled (daily) | Cleans up old booking data |

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:checkBookingConflicts

# Deploy without linting (if lint errors)
firebase deploy --only functions --force
```

### View Logs

```bash
# View all logs
firebase functions:log

# View specific function logs
firebase functions:log --only checkBookingConflicts

# Follow logs in real-time
firebase functions:log --follow
```

### Test Locally with Emulators

```bash
# Install emulators
firebase init emulators
# Select: Functions, Firestore

# Start emulators
firebase emulators:start
```

### Call Functions from Frontend

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const checkConflicts = httpsCallable(functions, 'checkBookingConflicts');

const result = await checkConflicts({
  amenityId: 'amenity-id',
  startTime: '2024-01-20T10:00:00Z',
  endTime: '2024-01-20T12:00:00Z'
});

console.log(result.data); // { hasConflicts: boolean, conflicts: [] }
```

### Delete Functions

```bash
# Delete specific function
firebase functions:delete checkBookingConflicts

# Delete all functions
firebase functions:delete --all
```

---

## Project Structure

```
src/
├── components/      # Shared UI components
│   ├── BookingCalendar.jsx   # Visual calendar for bookings
│   ├── UnifiedCalendar.jsx   # Combined events/bookings view
│   ├── Toast.jsx             # Notification system
│   └── ...
├── pages/
│   ├── admin/       # Admin dashboard pages
│   ├── member/      # Member portal pages
│   └── auth/        # Authentication pages
├── services/        # Firebase service layers
├── contexts/        # React contexts (Auth, etc.)
└── styles/          # Global styles

functions/
└── index.js         # Cloud Functions
```

## Firebase Collections

| Collection | Description |
|------------|-------------|
| `members` | User profiles and membership info |
| `amenities` | Available resources with availability settings |
| `bookings` | Check-in/out records and reservations |
| `events` | Events with approval status, attendees, and waitlist |

## Amenity Availability

Default settings for all amenities:
- **Hours**: 8:00 AM - 6:00 PM (Vietnam time)
- **Days**: Monday to Friday
- **Slot Duration**: 30 minutes

Admins can customize per amenity in `/admin/amenities`.

---

## Troubleshooting

### Authentication Issues

**"Firebase: Error (auth/unauthorized-domain)"**
- Go to **Authentication** → **Settings** → **Authorized domains**
- Add your domain (e.g., `localhost`)

### Firestore Issues

**"Missing or insufficient permissions"**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Verify user has correct `membershipType`

### Functions Issues

**"Functions require billing"**
- Enable billing in Firebase Console (Blaze plan required)

**"Permission denied"**
```bash
firebase login
firebase use your-project-id
```

**"Function not found"**
- Deploy functions: `firebase deploy --only functions`
- Verify function name: `firebase functions:list`

**Functions not triggering**
- Check function logs: `firebase functions:log`
- Verify Node.js version is 18
- Ensure Firestore triggers are correct

### Environment Issues

**Variables not loading**
- Ensure `.env` is in root directory
- Restart dev server after changes
- Variables must start with `VITE_`

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `firebase deploy` | Deploy all Firebase resources |
| `firebase deploy --only functions` | Deploy Cloud Functions |
| `firebase deploy --only firestore:rules` | Deploy Firestore rules |
| `firebase functions:log` | View function logs |
| `firebase emulators:start` | Start local emulators |

---

## Optional: Gemini AI Setup

For AI features (chatbot and smart booking suggestions):

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`:
```env
VITE_GEMINI_API_KEY=your-api-key-here
```

The app works without Gemini, but AI features will be disabled.

---

## License

Private - Danang Blockchain Hub
