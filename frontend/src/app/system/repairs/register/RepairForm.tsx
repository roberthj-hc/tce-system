"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { useRepairForm } from "./useRepairForm"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { toast as sonner } from "sonner"

function RepairForm() {
  const {
    repairForm,
    setRepairForm,
    handleChange,
    handleSubmit,
    isEditing,
    loading,
    customers,
    mode,
    setMode,
    searchTerm,
    setSearchTerm,
    registerNewCustomer
  } = useRepairForm()

  const router = useRouter()
  const [filteredCustomers, setFilteredCustomers] = useState<typeof customers>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCustomers([])
      setShowSuggestions(false)
      return
    }
    const matches = customers.filter(c =>
      `${c.name} ${c.ci} ${c.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCustomers(matches)
    setShowSuggestions(matches.length > 0)
  }, [searchTerm, customers])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelectCustomer = (customer: typeof customers[0]) => {
    setRepairForm(prev => ({
      ...prev,
      customer: customer.name,
      ci: customer.ci,
      phone: customer.phone,
      email: customer.email,
      customer_id: customer.customer_id
    }))
    setSearchTerm(customer.name)
    setShowSuggestions(false)
  }

  const handleRegisterCustomerClick = async () => {
    if (!repairForm.customer || !repairForm.ci || !repairForm.phone) {
      sonner.error("Se requiere el nombre del cliente, CI y teléfono para registrar un nuevo cliente.")
      return;
    }

    try {
      const newCustomerData = {
        name: repairForm.customer,
        ci: repairForm.ci,
        phone: repairForm.phone,
        email: repairForm.email || null,
      };

      const newCustomerId = await registerNewCustomer(newCustomerData);

      if (newCustomerId) {
        setRepairForm(prev => ({
          ...prev,
          customer_id: newCustomerId,
          customer: newCustomerData.name,
          ci: newCustomerData.ci,
          phone: newCustomerData.phone,
          email: newCustomerData.email,
        }));
        setSearchTerm(newCustomerData.name);
        setMode("search");
        sonner.success("¡Cliente registrado exitosamente! Formulario actualizado con el nuevo cliente.");
      } else {
        sonner.error("No se pudo registrar al cliente: ID no retornado.");
      }
    } catch (error) {
      console.error("Error al registrar nuevo cliente:", error);
      sonner.error("Error al registrar nuevo cliente.");
    }
  };

  const isNewCustomerMode = mode === "register"

  if (loading) {
    return <p className="text-muted-foreground">Cargando datos de reparación...</p>
  }

  return (
    <Card className="w-full space-y-8 shadow-lg sm:p-6">
      <CardHeader className="space-y-2 text-left">
        <CardTitle className="text-4xl text-primary tracking-tight">
          {isEditing ? "Editar Registro de Reparación" : "Registrar Nueva Reparación"}
        </CardTitle>
        <p className="text-base text-muted-foreground">
          {isEditing
            ? "Actualice los detalles de esta reparación de móvil."
            : "Registre fácilmente un nuevo servicio de reparación de móviles."}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo de Cliente</Label>
            <Select value={mode} onValueChange={(value) => {
              setMode(value as "search" | "register")
              setRepairForm(prev => ({
                ...prev,
                customer_id: undefined,
                customer: "",
                ci: "",
                phone: "",
                email: ""
              }))
              setSearchTerm("")
              setShowSuggestions(false)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin datos de cliente</SelectItem>
                <SelectItem value="search">Buscar Cliente Existente</SelectItem>
                <SelectItem value="register">Registrar Nuevo Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "search" && (
            <div className="relative space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-gray-300">Buscar Cliente (Nombre, CI o Teléfono)</Label>
              <Input
                name="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setRepairForm(prev => ({
                    ...prev,
                    customer_id: undefined,
                    customer: "",
                    ci: "",
                    phone: "",
                    email: ""
                  }))
                }}
                placeholder="Ej. Juan Pérez, 1234567, 099123456"
                autoComplete="off"
                className="w-full"
              />
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <div
                        key={c.customer_id}
                        className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors duration-200 ease-in-out"
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.ci} | {c.phone}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-muted-foreground">No se encontraron clientes. Intenta registrar uno nuevo.</div>
                  )}
                </div>
              )}
              {repairForm.customer_id && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  <span className="font-semibold">Seleccionado:</span> {repairForm.customer} (ID: {repairForm.customer_id})
                </p>
              )}
            </div>
          )}

          {isNewCustomerMode && (
            <div className="space-y-4 border p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Información del Nuevo Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="customer">Nombre</Label>
                  <Input name="customer" value={repairForm.customer} onChange={handleChange} placeholder="Nombre del Cliente" />
                </div>
                <div>
                  <Label htmlFor="ci">CI</Label>
                  <Input name="ci" value={repairForm.ci} onChange={handleChange} placeholder="Identificación (CI)" />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input name="phone" value={repairForm.phone} onChange={handleChange} placeholder="Número de Teléfono" />
                </div>
                <div>
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input name="email" type="email" value={repairForm.email || ""} onChange={handleChange} placeholder="Dirección de Correo" />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleRegisterCustomerClick}
                className="w-full md:w-auto px-6 py-2 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors"
                disabled={!repairForm.customer || !repairForm.ci || !repairForm.phone}
              >
                Registrar Cliente
              </Button>
            </div>
          )}

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-lg font-bold text-primary">Información del Dispositivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input name="model" value={repairForm.model} onChange={handleChange} placeholder="Modelo del Dispositivo (ej. iPhone 13, Samsung S22)" />
              </div>
              <div>
                <Label htmlFor="description">Descripción de la Reparación</Label>
                <Textarea name="description" value={repairForm.description} onChange={handleChange} placeholder="Describa el problema y la reparación requerida" rows={3} />
              </div>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-lg font-bold text-primary">Detalles Financieros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price">Precio Total</Label>
                <Input name="price" type="number" value={repairForm.price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="deposit">Depósito</Label>
                <Input name="deposit" type="number" value={repairForm.deposit} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="partCost">Costo de Pieza</Label>
                <Input name="partCost" type="number" value={repairForm.partCost} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-lg font-bold text-primary">Estado y Tiempos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={repairForm.status}
                  onValueChange={(value) => setRepairForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Recibido</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="ready">Listo para Recoger</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(repairForm.receivedAt || isEditing) && (
                <div>
                  <Label htmlFor="receivedAt">Recibido El</Label>
                  <Input name="receivedAt" value={new Date(repairForm.receivedAt).toLocaleString()} disabled className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                </div>
              )}
              {(repairForm.deliveredAt || isEditing) && (
                <div>
                  <Label htmlFor="deliveredAt">Entregado El</Label>
                  <Input
                    name="deliveredAt"
                    type="datetime-local"
                    value={repairForm.deliveredAt ? new Date(repairForm.deliveredAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setRepairForm(prev => ({ ...prev, deliveredAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 border p-4 rounded-lg">
            <Label htmlFor="notes">Observaciones / Notas Internas</Label>
            <Textarea name="notes" value={repairForm.notes} onChange={handleChange} placeholder="Cualquier observación o nota adicional" rows={4} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/system/repairs/list")}
                className="w-full sm:w-auto px-6 py-2"
              >
                Cancelar Edición
              </Button>
            )}
            <Button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
            >
              {isEditing ? "Guardar Cambios" : "Registrar Reparación"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default RepairForm