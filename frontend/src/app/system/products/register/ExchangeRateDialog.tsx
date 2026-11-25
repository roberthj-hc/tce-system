"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast as sonner } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExchangeRate, useExchangeRate } from "./useExchangeRate"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    // Se llama con el tipo de cambio vigente cada vez que algo cambia
    onChanged: (current: number | null) => void
}

const emptyForm = { price: "", observation: "" }

export default function ExchangeRateDialog({ open, onOpenChange, onChanged }: Props) {
    const { rates, current, save, remove } = useExchangeRate()
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)

    const isEditingCurrent = editingId !== null && editingId === current?.dollar_exchange_id

    const reset = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const startEdit = (r: ExchangeRate) => {
        setEditingId(r.dollar_exchange_id)
        setForm({ price: String(r.price), observation: r.observation ?? "" })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const value = parseFloat(form.price)
        if (!value || value <= 0) {
            sonner.error("Ingresa un tipo de cambio válido.")
            return
        }
        const ok = await save(form, editingId)
        if (!ok) return
        sonner.success("Tipo de cambio guardado.")
        reset()
        // el más reciente es el vigente: si se editó uno antiguo, el vigente no cambia
        const latestPrice = editingId !== null && !isEditingCurrent ? current?.price ?? null : value
        onChanged(latestPrice)
    }

    const handleDelete = async (r: ExchangeRate) => {
        if (!window.confirm(`¿Eliminar el registro de Bs. ${r.price}?`)) return
        const wasCurrent = r.dollar_exchange_id === current?.dollar_exchange_id
        if (await remove(r.dollar_exchange_id)) {
            if (editingId === r.dollar_exchange_id) reset()
            if (wasCurrent) {
                // el nuevo vigente es el siguiente de la lista
                onChanged(rates[1]?.price ?? null)
            }
            sonner.success("Registro eliminado.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tipo de cambio (Bs por 1 USD)</DialogTitle>
                    <DialogDescription>
                        El registro más reciente es el vigente y se usa para calcular los costos de los productos nuevos.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 border rounded-md p-4">
                    <p className="text-sm font-semibold">
                        {editingId ? "Editar registro" : "Registrar nuevo tipo de cambio"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate_price">Bs por 1 USD *</Label>
                            <Input
                                id="rate_price"
                                type="number"
                                step="0.0001"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="rate_obs">Observación</Label>
                            <Input
                                id="rate_obs"
                                value={form.observation}
                                maxLength={250}
                                onChange={(e) => setForm({ ...form, observation: e.target.value })}
                                placeholder="Ej: tipo de cambio paralelo"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Los productos ya registrados conservan el tipo de cambio con el que se calcularon;
                        el nuevo valor se usa en los productos que registres o recalcules desde ahora.
                    </p>

                    <div className="flex justify-end gap-2">
                        {editingId && (
                            <Button type="button" variant="secondary" onClick={reset}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit">{editingId ? "Guardar cambios" : "Registrar"}</Button>
                    </div>
                </form>

                <div className="space-y-2">
                    <p className="text-sm font-semibold">Historial</p>
                    {rates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aún no hay tipos de cambio registrados.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Bs / USD</TableHead>
                                    <TableHead>Observación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rates.map((r, i) => (
                                    <TableRow key={r.dollar_exchange_id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(r.register_date).toLocaleString("es-BO")}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {r.price}
                                            {i === 0 && (
                                                <span className="ml-2 text-xs rounded bg-green-100 text-green-700 px-1.5 py-0.5">
                                                    Vigente
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[160px] truncate">{r.observation}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button type="button" size="icon" variant="ghost" onClick={() => startEdit(r)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                disabled={rates.length <= 1}
                                                onClick={() => handleDelete(r)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
