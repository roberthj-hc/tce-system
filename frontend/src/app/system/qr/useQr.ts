"use client"

import { useCallback, useState } from "react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useQr() {
  const [qrUrl, setQrUrl] = useState<string>(() =>
    `${apiUrl}/api/qr?ts=${Date.now()}`
  )

  const [manualUrl, setManualUrl] = useState("")

  const refreshQr = useCallback(async () => {
    await fetch(`${apiUrl}/api/qr/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: manualUrl || null,
      }),
    })

    setQrUrl(`${apiUrl}/api/qr?ts=${Date.now()}`)
  }, [manualUrl])

  return {
    qrUrl,
    manualUrl,
    setManualUrl,
    refreshQr,
  }
}
