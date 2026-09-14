"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotifications } from "./useNotifications"
import { useEffect } from "react"

interface Props {
  open: boolean
  onOpenChange: (state: boolean) => void
}

export function NotificationCenter({ open, onOpenChange }: Props) {
  const { notifications, loading, refreshNotifications } = useNotifications()

  useEffect(() => {
    if (open) {
      refreshNotifications()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full max-w-lg sm:max-w-xl h-[90vh] sm:h-auto rounded-xl p-0",
          "backdrop-blur bg-background/80 border border-border"
        )}
      >

        <DialogHeader className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-muted-foreground" />
            <DialogTitle className="text-lg">Notification Center</DialogTitle>
          </div>
          <DialogDescription>View and manage your recent notifications</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] sm:h-[400px] p-4">
          {loading ? (
            <div className="text-sm text-muted-foreground text-center mt-6">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center mt-6">
              You have no notifications at the moment.
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.notification_id}
                  className={cn(
                    "border rounded-lg p-3 text-sm",
                    n.type === "success" && "border-green-500",
                    n.type === "warning" && "border-yellow-500",
                    n.type === "error" && "border-red-500",
                    n.type === "info" && "border-blue-500"
                  )}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <span className="text-[10px] text-right block mt-1 text-muted-foreground">
                    {new Date(n.date).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )

}
