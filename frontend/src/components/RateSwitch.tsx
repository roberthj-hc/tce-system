"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Props = {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    rate: number | null
}

// Switch "usar el tipo de cambio más reciente" (activado por defecto en cada pantalla)
export function RateSwitch({ checked, onCheckedChange, rate }: Props) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/30 px-4 py-3">
            <Switch id="use-current-rate" checked={checked} onCheckedChange={onCheckedChange} />
            <div className="text-sm">
                <Label htmlFor="use-current-rate" className="font-medium">
                    Usar tipo de cambio más reciente
                    {rate ? ` (1 USD = Bs. ${rate})` : ""}
                </Label>
                <p className="text-xs text-muted-foreground">
                    {!rate
                        ? "No hay tipo de cambio configurado: se usan el costo y precio registrados."
                        : checked
                            ? "Los productos con costo en USD calculan costo y precio con el dólar actual (el precio sigue siendo editable)."
                            : "Se usan el costo y precio con los que se registró cada producto."}
                </p>
            </div>
        </div>
    )
}
