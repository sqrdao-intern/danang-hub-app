import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

const AMENITIES_COLLECTION = 'amenities'

export const getAmenities = async () => {
  const amenitiesRef = collection(db, AMENITIES_COLLECTION)
  const q = query(amenitiesRef, orderBy('name'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getAmenity = async (id) => {
  const amenityRef = doc(db, AMENITIES_COLLECTION, id)
  const snapshot = await getDoc(amenityRef)
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() }
  }
  return null
}

// Default availability settings
export const DEFAULT_AVAILABILITY = {
  isAvailable: true,
  startHour: 8,  // 8 AM VN time
  endHour: 18,   // 6 PM VN time
  availableDays: [1, 2, 3, 4, 5], // Monday to Friday (0=Sunday, 1=Monday, etc.)
  slotDuration: 30, // minutes
  timezone: 'Asia/Ho_Chi_Minh'
}

export const createAmenity = async (data) => {
  const amenitiesRef = collection(db, AMENITIES_COLLECTION)
  const docRef = await addDoc(amenitiesRef, {
    ...data,
    // Apply default availability settings if not provided
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : DEFAULT_AVAILABILITY.isAvailable,
    startHour: data.startHour || DEFAULT_AVAILABILITY.startHour,
    endHour: data.endHour || DEFAULT_AVAILABILITY.endHour,
    availableDays: data.availableDays || DEFAULT_AVAILABILITY.availableDays,
    slotDuration: data.slotDuration || DEFAULT_AVAILABILITY.slotDuration,
    createdAt: new Date().toISOString()
  })
  return docRef.id
}

export const updateAmenity = async (id, data) => {
  const amenityRef = doc(db, AMENITIES_COLLECTION, id)
  await updateDoc(amenityRef, {
    ...data,
    updatedAt: new Date().toISOString()
  })
}

export const deleteAmenity = async (id) => {
  const amenityRef = doc(db, AMENITIES_COLLECTION, id)
  await deleteDoc(amenityRef)
}
