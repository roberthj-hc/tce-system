"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"
import { useAuth } from "@/context/AuthContext"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type UserPayload = {
  id: number
  name: string
  email: string
  role_id: number
  avatar?: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error("Error de inicio de sesión", {
          description: data?.error || "Verifica tu correo y contraseña.",
        })
        return
      }

      localStorage.setItem("token", data.token)

      const decoded = jwtDecode<UserPayload>(data.token)
      setUser(decoded)

      const redirectPath = "/system/dashboard"

      toast.success("Inicio de sesión exitoso", {
        description: "Redirigiendo...",
        duration: 1500,
      })

      setTimeout(() => {
        router.push(redirectPath)
      }, 1200)
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      toast.error("Fallo de inicio de sesión", {
        description: "No se pudo conectar con el servidor.",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <GalleryVerticalEnd className="mx-auto size-6" />
            <h1 className="text-xl font-bold mt-2">Iniciar Sesión</h1>
            <p className="text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" className="underline">
                Regístrate
              </Link>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">
              Ingresar
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}