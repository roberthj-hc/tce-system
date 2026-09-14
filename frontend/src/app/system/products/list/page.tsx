"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ProductList } from "./ProductList"

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="px-4 py-6 xl:px-12 xl:py-10 w-full space-y-6">
        <ProductList />
      </div>
    </ProtectedRoute>
  )
}
