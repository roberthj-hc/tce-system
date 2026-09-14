"use client"

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCustomerForm } from "./useCustomerForm"
import { useRouter } from "next/navigation"
import Link from "next/link"

function CustomerForm() {
    const {
        customerForm,
        handleChange,
        handleSubmit,
        isEditing,
        loading
    } = useCustomerForm()

    const router = useRouter()

    if (loading) {
        return <p className="text-muted-foreground">Cargando datos del cliente...</p>
    }

    return (
        <div className="w-full">
            <Card className="flex flex-col md:flex-row gap-6 p-6 w-full">
                <CardHeader className="space-y-1 md:w-1/2">
                    <CardTitle className="mt-0 text-3xl font-bold text-primary">
                        {isEditing ? "Editar Cliente" : "Añadir Cliente"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? "Actualizar la información del cliente"
                            : "Registrar un nuevo cliente para incluir en tus ventas"}
                    </p>
                </CardHeader>

                <CardContent className="md:w-1/2 p-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-[70%]">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    name="name"
                                    value={customerForm.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="w-full md:w-[30%]">
                                <Label htmlFor="ci">CI</Label>
                                <Input
                                    name="ci"
                                    value={customerForm.ci}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-[30%]">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    name="phone"
                                    value={customerForm.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="w-full md:w-[70%]">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={customerForm.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push("/system/customers/list")}
                                    className="px-6"
                                >
                                    Cancelar edición
                                </Button>
                            )}
                            <Button type="submit" className="px-6">
                                {isEditing ? "Guardar cambios" : "Guardar cliente"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default CustomerForm
