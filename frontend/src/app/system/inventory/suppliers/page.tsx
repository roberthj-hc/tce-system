"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import SupplierList from "./SupplierList"
import SupplierForm from "./SupplierForm"

type Supplier = {
  supplier_id: number
  name: string
  contact_name: string
  phone: string
  email: string
  address: string
}

function SuppliersPage() {
  const [search, setSearch] = useState("")
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [refreshFlag, setRefreshFlag] = useState(false)

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
  }

  const handleClearEditing = () => {
    setEditingSupplier(null)
  }

  const triggerRefresh = () => {
    setRefreshFlag(prev => !prev)
  }

  return (
    <ProtectedRoute allowedRoles={[1]}>
      <div className="px-4 py-6 md:px-8 lg:px-12 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:flex-1">
            <h1 className="text-3xl font-bold text-primary">Proveedores</h1>
            <p className="text-muted-foreground text-sm">
              Registra y gestiona los proveedores vinculados al inventario
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SupplierList
              search={search}
              onEdit={handleEditSupplier}
              refresh={refreshFlag}
            />
          </div>
          <div className="lg:col-span-1">
            <SupplierForm
              supplier={editingSupplier}
              clearSupplier={handleClearEditing}
              triggerRefresh={triggerRefresh}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default SuppliersPage