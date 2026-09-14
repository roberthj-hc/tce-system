"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import SalesReport from "./SalesReport"

function SalesReportPage() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <div className="px-4 py-6 xl:px-12 xl:py-10 w-full space-y-6">
        <SalesReport />
      </div>
    </ProtectedRoute>
  )
}

export default SalesReportPage
