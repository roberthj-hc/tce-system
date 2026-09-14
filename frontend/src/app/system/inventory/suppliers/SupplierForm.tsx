"use client"

import { useState, useEffect } from "react"
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast as sonner } from "sonner"
import { notify } from "@/lib/notify"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type Supplier = {
  supplier_id: number
  name: string
  contact_name: string
  phone: string
  email: string
  address: string
}

type Props = {
  supplier: Supplier | null
  clearSupplier: () => void
  triggerRefresh: () => void
}

function SupplierForm({ supplier, clearSupplier, triggerRefresh }: Props) {
  const [form, setForm] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: ""
  })

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        contact_name: supplier.contact_name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address
      })
    } else {
      setForm({
        name: "",
        contact_name: "",
        phone: "",
        email: "",
        address: ""
      })
    }
  }, [supplier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
      address: form.address
    }

    try {
      const res = await fetch(
        supplier
          ? `${apiUrl}/api/suppliers/edit/${supplier.supplier_id}`
          : `${apiUrl}/api/suppliers/register`,
        {
          method: supplier ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      )

      const data = await res.json()
      if (res.ok) {
        notify({
          type: supplier ? "info" : "success",
          title: supplier ? "Proveedor actualizado" : "Proveedor registrado",
          description: `Se ${supplier ? "actualizó" : "registró"} el proveedor: ${form.name}`,
          roleId: 2,
          persist: true
        })
        triggerRefresh()
        clearSupplier()
        setForm({
          name: "",
          contact_name: "",
          phone: "",
          email: "",
          address: ""
        })
      } else {
        sonner.error(data?.error || "Error al enviar")
      }
    } catch {
      sonner.error("Error del servidor")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  return (
    <Card className="p-4 sm:p-6 shadow-none">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-2xl font-bold text-primary">
          {supplier ? "Editar Proveedor" : "Registrar Proveedor"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Empresa *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de Contacto *</Label>
              <Input id="contact_name" name="contact_name" value={form.contact_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea id="address" name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 pt-4">
            {supplier && (
              <Button variant="ghost" type="button" onClick={clearSupplier} className="px-6">
                Cancelar edición
              </Button>
            )}
            <Button type="submit" className="px-6">
              {supplier ? "Guardar cambios" : "Registrar proveedor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

}

export default SupplierForm