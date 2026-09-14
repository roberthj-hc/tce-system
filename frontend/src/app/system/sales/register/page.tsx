"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import RegisterSale from "./RegisterSale"

function RegisterSalePage() {
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="px-2 py-2 w-full md:px-12">
        <RegisterSale />
      </div>
    </ProtectedRoute>
  )
}

export default RegisterSalePage
