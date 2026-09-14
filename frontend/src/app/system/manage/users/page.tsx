"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { UserList } from "./UserList"

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
      <div className="px-4 py-6 xl:px-12 xl:py-10 w-full space-y-6">
        <UserList />
      </div>
    </ProtectedRoute>
  )
}