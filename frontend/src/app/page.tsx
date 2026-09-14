"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a <span className="text-primary">TCE</span></h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Sistema de gestión para soporte técnico, ventas e inventario.
      </p>
      <Button size="lg" onClick={() => router.push("/auth/login")}>
        Iniciar sesión
      </Button>
    </main>
  )
}
