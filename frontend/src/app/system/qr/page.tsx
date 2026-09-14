"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQr } from "./useQr"

function Barcode() {
  const { qrUrl, manualUrl, setManualUrl, refreshQr } = useQr()

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="text-center mt-10 px-4">
        <h2 className="text-lg font-bold mb-4">
          Escanea para acceder a la app
        </h2>

        <img
          src={qrUrl}
          alt="Código QR"
          width={200}
          height={200}
          className="mx-auto"
        />

        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <Input
            placeholder="https://mi-sitio.com"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="sm:w-80"
          />

          <Button onClick={refreshQr}>
            Actualizar QR
          </Button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Si ingresas una URL se generará un QR verde
        </p>
      </div>
    </ProtectedRoute>
  )
}

export default Barcode
