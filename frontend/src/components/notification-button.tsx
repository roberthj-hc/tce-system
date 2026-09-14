"use client"

import { useState } from "react"
import { Bell, BellRing } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationCenter } from "@/components/notification-center"

export function NotificationButton() {
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Bell
          className={`h-[1.2rem] w-[1.2rem] transition-all ${
            hasUnread ? "scale-100 rotate-0 opacity-0" : "opacity-100"
          }`}
        />
        <BellRing
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            hasUnread ? "opacity-100 scale-100 rotate-0" : "scale-0 opacity-0"
          }`}
        />
        <span className="sr-only">Notificaciones</span>
      </Button>

      <NotificationCenter
        open={open}
        onOpenChange={(state) => {
          setOpen(state)
          setHasUnread(false)
        }}
      />
    </>
  )
}
