"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

type UserPayload = {
  id: number
  email: string
  name: string
  role_id: number
  avatar?: string
}

const AuthContext = createContext<{
  user: UserPayload | null
  loading: boolean
  setUser: (user: UserPayload | null) => void
}>({
  user: null,
  loading: true,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token)
        const withAvatar = {
          ...decoded,
          avatar: decoded.avatar || "/images/profile-icon.jpg"
        }
        setUser(withAvatar)
      } catch {
        localStorage.removeItem("token")
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
