import { useEffect, useState } from "react"
import { toast as sonner } from "sonner"

export type Notification = {
  notification_id: number
  type: string
  title: string
  message: string
  date: string
  expiration_date: string
  role_id: number
  read_: boolean
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role_id = decoded.role_id
      const res = await fetch(`${apiUrl}/api/notifications/list/${role_id}`)
      const data = await res.json()

      if (!Array.isArray(data)) {
        sonner.error("No se pudieron cargar las notificaciones.")
        setNotifications([])
      } else {
        setNotifications(data)
      }
    } catch {
      sonner.error("Ocurrió un error al obtener las notificaciones.")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return { notifications, loading, refreshNotifications: fetchNotifications }
}
