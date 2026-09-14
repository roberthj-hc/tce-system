"use client"

import { useState } from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast as sonner } from "sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

function CategoryForm() {
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch(`${apiUrl}/api/categories/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoryForm)
            })

            const data = await res.json()
            if (res.ok) {
                sonner.success("Categoría guardada exitosamente")
                setCategoryForm({ name: "", description: "" })
            } else {
                sonner.error(data?.error || "Error al guardar la categoría")
            }
        } catch {
            sonner.error("Error del servidor")
        }
    }

    return (
        <Card className="p-2 space-y-6 shadow-sm">
            <CardHeader className="space-y-2">
                <CardTitle className="mt-4 text-3xl font-bold text-primary tracking-tight">
                    Crear categoría
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Registra una nueva categoría para organizar tus productos
                </p>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="categoryName" className="text-sm font-medium">
                            Nombre *
                        </Label>
                        <Input
                            name="name"
                            value={categoryForm.name}
                            onChange={handleChange}
                            required
                            className="rounded-md shadow-sm"
                        />
                    </div>

                    <div>
                        <Label htmlFor="categoryDescription" className="text-sm font-medium">
                            Descripción
                        </Label>
                        <Textarea
                            name="description"
                            value={categoryForm.description}
                            onChange={handleChange}
                            className="rounded-md shadow-sm"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="px-6">
                            Guardar categoría
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default CategoryForm