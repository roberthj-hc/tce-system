"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import RepairForm from "./RepairForm"

function RegisterRepairPage() {
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="px-2 py-2 w-full md:px-12">
        <RepairForm />
      </div>
    </ProtectedRoute>
  )
}

export default RegisterRepairPage
