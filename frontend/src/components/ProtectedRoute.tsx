"use client"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles: number[]
}) {
  const { user, loading, setUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role_id))) {
      toast.error("Acceso restringido.")
      localStorage.removeItem("token")
      setUser(null)
      router.replace("/")
      router.push("/")
    }
  }, [user, allowedRoles, loading, setUser, router])

  if (loading) {
    return <div className="text-center mt-20">Cargando...</div>
  }

  return <>{children}</>
}
