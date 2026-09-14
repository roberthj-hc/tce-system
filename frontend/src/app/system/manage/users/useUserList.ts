import { useState, useEffect } from "react"
import { toast } from "sonner"

type User = {
    id: number
    name: string
    last_name: string
    email: string
    phone: string
    address: string
    role_id: 1 | 2
    is_active: boolean
}

type UserUpdateData = Partial<Omit<User, 'id'>>

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export const useUserList = () => {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<unknown>(null)
    const [transactions, setTransactions] = useState<Record<number, boolean>>({})

    const fetchUsers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${apiUrl}/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!res.ok) {
                throw new Error("Failed to fetch users")
            }
            const data: User[] = await res.json()
            setUsers(data)
            await fetchTransactions(data)
        } catch (err) {
            setError(err)
            toast.error((err as Error).message || "Error al cargar la lista de usuarios.")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTransactions = async (users: User[]) => {
        const transactionStatus: Record<number, boolean> = {}
        const token = localStorage.getItem("token")

        for (const user of users) {
            try {
                const res = await fetch(`${apiUrl}/api/users/${user.id}/has-transactions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!res.ok) {
                    transactionStatus[user.id] = false
                    continue
                }
                const data = await res.json()
                transactionStatus[user.id] = data.hasTransactions
            } catch (err) {
                transactionStatus[user.id] = false
            }
        }
        setTransactions(transactionStatus)
    }

    const hasTransactions = (userId: number): boolean => {
        return transactions[userId]
    }

    const updateUser = async (id: number, updatedData: UserUpdateData) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${apiUrl}/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to update user")
            }
            await fetchUsers()
            return true
        } catch (err) {
            toast.error((err as Error).message || "Error al actualizar usuario.")
            throw err
        }
    }

    const deleteUser = async (id: number) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${apiUrl}/api/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to delete user")
            }
            await fetchUsers()
            return true
        } catch (err) {
            toast.error((err as Error).message || "Error al eliminar usuario.")
            throw err
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return { users, isLoading, error, updateUser, deleteUser, hasTransactions }
}
