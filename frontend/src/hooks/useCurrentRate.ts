"use client"

import { useEffect, useState } from "react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Tipo de cambio vigente (el registro más reciente); null si no hay ninguno configurado
export function useCurrentRate() {
    const [rate, setRate] = useState<number | null>(null)
    useEffect(() => {
        fetch(`${apiUrl}/api/dollar/current`)
            .then((r) => r.json())
            .then((d) => setRate(d ? Number(d.price) : null))
            .catch(() => setRate(null))
    }, [])
    return rate
}
