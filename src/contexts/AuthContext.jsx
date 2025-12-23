// src/contexts/AuthContext.jsx
// Provides authentication state throughout the app
// Uses React Context to avoid prop drilling

import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '../firebase/config'

// Create the context
const AuthContext = createContext()

// Custom hook to use auth context - makes it easy to access auth state anywhere
export const useAuth = () => {
  return useContext(AuthContext)
}

// Provider component that wraps the app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true) // Important: prevent flash of login page

  // Sign up new user with email and password
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  // Log in existing user
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Log out current user
  const logout = () => {
    return signOut(auth)
  }

  // Listen for auth state changes (login/logout)
  // This runs once on mount and sets up a listener
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false) // Auth state determined, stop loading
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  // Values available to consuming components
  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  }

  // Don't render children until we know auth state
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}