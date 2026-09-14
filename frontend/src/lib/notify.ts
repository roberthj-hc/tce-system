import { toast } from "sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type NotificationType = "success" | "error" | "info" | "warning"

interface NotifyOptions {
    type: NotificationType
    title: string
    description?: string
    roleId?: number
    persist?: boolean
    duration?: number
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
    icon?: React.ReactNode
}

export async function notify({
    type,
    title,
    description,
    roleId,
    persist = true,
    duration = 4000,
    position = "bottom-right",
    icon
}: NotifyOptions) {
    toast[type](title, {
        description,
        duration,
        position,
        icon
    })

    if (persist && roleId != null) {
        try {
            const formatDate = (date: Date) => {
                return date.toISOString().slice(0, 19).replace("T", " ");
            };

            const payload = {
                role_id: roleId,
                type,
                title,
                message: description ?? "",
                expiration_offset_days: 30
            };


            const res = await fetch(`${apiUrl}/api/notifications/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data?.error || "No se pudo guardar la notificación")
            }
        } catch (error) {
            toast.error("Error guardando notificación en la base de datos")
            console.error(error)
        }
    }
}
