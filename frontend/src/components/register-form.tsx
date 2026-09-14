"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select"
import { toast as sonner } from "sonner"
import Link from "next/link"
import { useFormValidation } from "@/hooks/form-validation"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type Role = {
  id: number
  name: string
  code?: string
}

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [code, setCode] = useState("")
  const [roles, setRoles] = useState<Role[]>([])

  const router = useRouter()

  const { passwordsMatch, allFieldsFilled, matchFeedbackColor } = useFormValidation({
    name,
    lastName,
    email,
    phone,
    address,
    password,
    confirmPassword,
    role,
    code
  })

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(`${apiUrl}/api/roles`)
        const data = await res.json()
        
        if (Array.isArray(data)) {
          setRoles(data)
        } else {
          throw new Error("Invalid role data")
        }
      } catch {
        sonner.error("Error al cargar roles")
        setRoles([])
      }
    }
    fetchRoles()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFieldsFilled) return

    const newUser = {
      name,
      last_name: lastName,
      email,
      phone,
      password,
      address,
      role_id: parseInt(role),
      code
    }

    try {
      const res = await fetch(`${apiUrl}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
      const data = await res.json()

      if (res.ok) {
        sonner.success("Usuario creado con éxito")
        router.push("/auth/login")
      } else {
        sonner.error(data?.error || "Fallo al crear usuario")
      }
    } catch {
      sonner.error("Error del servidor")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <GalleryVerticalEnd className="mx-auto size-6" />
            <h1 className="text-xl font-bold mt-2">Crear una cuenta</h1>
            <p className="text-sm">
              ¿Ya tienes una cuenta? <Link href="/auth/login" className="underline">Iniciar sesión</Link>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-3 grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              </div>
              <div className="col-span-2 grid gap-3">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="role">Rol</Label>
                <Select onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Elige un rol" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role === "1" && (
                <div className="grid gap-3">
                  <Label htmlFor="code">Código de Verificación</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
              )}
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <span className={`text-sm mt-1 ${matchFeedbackColor}`}>
                {confirmPassword === ""
                  ? ""
                  : passwordsMatch
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={!allFieldsFilled}>Registrarse</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
