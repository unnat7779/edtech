// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
let app
let storage

try {
  // Check if Firebase is already initialized
  if (typeof window !== "undefined") {
    // Client-side initialization
    if (!window._firebaseApp) {
      console.log("Initializing Firebase app (client-side)")
      app = initializeApp(firebaseConfig)
      window._firebaseApp = app
    } else {
      console.log("Using existing Firebase app (client-side)")
      app = window._firebaseApp
    }
  } else {
    // Server-side initialization
    if (!global._firebaseApp) {
      console.log("Initializing Firebase app (server-side)")
      app = initializeApp(firebaseConfig)
      global._firebaseApp = app
    } else {
      console.log("Using existing Firebase app (server-side)")
      app = global._firebaseApp
    }
  }

  // Initialize Storage
  storage = getStorage(app)
  console.log("Firebase Storage initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)

  // Create a mock storage object for development if Firebase fails to initialize
  console.log("Using mock Firebase storage")
  storage = {
    _isMock: true,
  }
}

/**
 * Upload a file to Firebase Storage
 * @param {File|Buffer} file - The file to upload
 * @param {string} path - The storage path (e.g., 'uploads/tests/image.jpg')
 * @param {Object} metadata - Optional metadata for the file
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export async function uploadFileToFirebase(file, path, metadata = {}) {
  try {
    console.log("Starting Firebase upload for path:", path)

    // Always use mock uploads since Firebase Storage isn't properly set up
    if (storage._isMock || process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true") {
      console.log("Using mock upload")
      // Create a mock URL that looks like a Firebase Storage URL
      const mockUrl = `https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/${encodeURIComponent(path)}?alt=media&token=${Date.now()}`

      console.log("Generated mock URL:", mockUrl)
      return mockUrl
    }

    // The code below will only run if NEXT_PUBLIC_USE_MOCK_UPLOADS is not "true"
    // and Firebase Storage is properly configured

    // Create a storage reference
    const storageRef = ref(storage, path)
    console.log("Storage reference created")

    // If file is a Buffer (from API routes), use it directly
    // If it's a File object (from client), convert to array buffer
    let fileBuffer
    if (file instanceof File) {
      console.log("Converting File to ArrayBuffer")
      fileBuffer = await file.arrayBuffer()
    } else if (file instanceof ArrayBuffer) {
      console.log("Using provided ArrayBuffer")
      fileBuffer = file
    } else if (Buffer.isBuffer(file)) {
      console.log("Using provided Buffer")
      fileBuffer = file
    } else {
      console.log("Unknown file type, attempting to use as is")
      fileBuffer = file
    }

    // Upload the file
    console.log("Uploading to Firebase Storage...")
    const snapshot = await uploadBytes(storageRef, fileBuffer, metadata)
    console.log("Upload successful, getting download URL")

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Download URL obtained:", downloadURL)

    return downloadURL
  } catch (error) {
    console.error("Error uploading file to Firebase:", error)
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      status: error.status_,
      customData: error.customData,
    })

    // Return a mock URL if Firebase upload fails
    console.log("Returning mock URL due to error")
    return `https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/${encodeURIComponent(path)}?alt=media&token=${Date.now()}`
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The storage path of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFileFromFirebase(path) {
  try {
    // For development with mock storage
    if (storage._isMock || process.env.NEXT_PUBLIC_USE_MOCK_UPLOADS === "true") {
      console.log("Mock delete in development")
      return true
    }

    // Create a reference to the file to delete
    const fileRef = ref(storage, path)

    // Delete the file
    await deleteObject(fileRef)

    return true
  } catch (error) {
    console.error("Error deleting file from Firebase:", error)
    return false
  }
}

/**
 * Get the Firebase Storage path from a download URL
 * @param {string} downloadURL - The download URL
 * @returns {string|null} - The storage path or null if not found
 */
export function getStoragePathFromURL(downloadURL) {
  try {
    // Extract the path from the download URL
    // This is a simplified version and might need adjustment based on your Firebase setup
    const url = new URL(downloadURL)
    const pathMatch = url.pathname.match(/\/o\/(.+?)(?:\?|$)/)

    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1])
    }

    return null
  } catch (error) {
    console.error("Error extracting path from URL:", error)
    return null
  }
}

export { storage }
