"use client"

import { useCallback, useEffect, useState } from "react"
import { toast as sonner } from "sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export type ExchangeRate = {
    dollar_exchange_id: number
    price: number
    observation: string | null
    register_date: string
}

type RawRate = Omit<ExchangeRate, "price"> & { price: string | number }

const normalize = (r: RawRate): ExchangeRate => ({ ...r, price: Number(r.price) })

export function useExchangeRate() {
    const [rates, setRates] = useState<ExchangeRate[]>([])
    const [loading, setLoading] = useState(true)

    // El más reciente es el vigente (el backend ya devuelve la lista ordenada)
    const current = rates[0] ?? null

    const load = useCallback(async (): Promise<ExchangeRate[]> => {
        try {
            const res = await fetch(`${apiUrl}/api/dollar/list`)
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error)
            const list = (data as RawRate[]).map(normalize)
            setRates(list)
            return list
        } catch {
            sonner.error("No se pudo cargar el tipo de cambio.")
            return []
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const save = async (
        values: { price: string; observation: string },
        editingId?: number | null
    ): Promise<boolean> => {
        try {
            const res = await fetch(
                editingId ? `${apiUrl}/api/dollar/update/${editingId}` : `${apiUrl}/api/dollar/register`,
                {
                    method: editingId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            )
            const data = await res.json()
            if (!res.ok) {
                sonner.error(data?.error || "No se pudo guardar el tipo de cambio.")
                return false
            }
            await load()
            return true
        } catch {
            sonner.error("Error del servidor.")
            return false
        }
    }

    const remove = async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${apiUrl}/api/dollar/delete/${id}`, { method: "DELETE" })
            const data = await res.json()
            if (!res.ok) {
                sonner.error(data?.error || "No se pudo eliminar el registro.")
                return false
            }
            await load()
            return true
        } catch {
            sonner.error("Error del servidor.")
            return false
        }
    }

    return { rates, current, loading, load, save, remove }
}
