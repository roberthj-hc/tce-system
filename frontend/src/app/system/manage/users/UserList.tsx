"use client"

import { useState } from "react"
import { useUserList } from "./useUserList"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Ban, Trash2, CheckCheck, UserCheck } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

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

export function UserList() {
    const { users, isLoading, error, updateUser, deleteUser, hasTransactions } = useUserList()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
    const [deleteUserName, setDeleteUserName] = useState<string>("")
    const [isUserActive, setIsUserActive] = useState<boolean>(false)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedUser) return

        const formData = new FormData(e.currentTarget);
        const roleId = parseInt(formData.get("role_id") as string);

        const updatedData = {
            name: formData.get("name") as string,
            last_name: formData.get("last_name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            role_id: (roleId === 1 || roleId === 2) ? roleId as 1 | 2 : selectedUser.role_id,
            is_active: isUserActive,
        };

        try {
            await updateUser(selectedUser.id, updatedData)
            toast.success("Usuario actualizado correctamente.")
            setIsEditDialogOpen(false)
        } catch (err) {
            const errorMessage = (err as Error).message || "Error al actualizar usuario."
            toast.error(errorMessage)
        }
    }

    const handleDelete = async () => {
        if (!deleteUserId) return

        try {
            await deleteUser(deleteUserId)
            toast.success("Usuario eliminado correctamente.")
        } catch (err) {
            const errorMessage = (err as Error).message || "Error al eliminar usuario."
            toast.error(errorMessage)
        } finally {
            setIsDeleteDialogOpen(false)
            setDeleteUserId(null)
        }
    }

    const openDeleteDialog = (user: User) => {
        setOpenMenuId(null)
        setDeleteUserId(user.id)
        setDeleteUserName(`${user.name} ${user.last_name}`)
        setIsDeleteDialogOpen(true)
    }

    const openEditDialog = (user: User) => {
        setOpenMenuId(null)
        setSelectedUser(user)
        setIsUserActive(user.is_active)
        setIsEditDialogOpen(true)
    }

    if (isLoading) {
        return <div className="text-center py-10">Cargando usuarios...</div>
    }

    if (error) {
        return <div className="text-center py-10 text-destructive">Error: {(error as Error).message}</div>
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden md:table-cell">Email</TableHead>
                            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                            <TableHead className="hidden lg:table-cell">Rol</TableHead>
                            <TableHead className="hidden sm:table-cell text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name} {user.last_name}</TableCell>
                                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                                <TableCell className="hidden lg:table-cell">{user.role_id === 1 ? "Administrador" : "Usuario"}</TableCell>
                                <TableCell className="hidden sm:table-cell text-center">
                                    <div className={`px-2 py-1 inline-block rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.is_active ? "Activo" : "Inactivo"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu open={openMenuId === user.id} onOpenChange={(isOpen) => {
                                        setOpenMenuId(isOpen ? user.id : null)
                                    }}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                <UserCheck className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            {user.is_active ? (
                                                <DropdownMenuItem onClick={() => updateUser(user.id, { ...user, is_active: false })}>
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Desactivar Cuenta
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => updateUser(user.id, { ...user, is_active: true })}>
                                                    <CheckCheck className="mr-2 h-4 w-4" />
                                                    Activar Cuenta
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => openDeleteDialog(user)}
                                                disabled={hasTransactions(user.id)}
                                                className={hasTransactions(user.id) ? "opacity-50 cursor-not-allowed" : ""}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente al usuario <span className="font-bold">{deleteUserName}</span> de la base de datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>
                            Realiza cambios en el perfil del usuario.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                <Input id="name" name="name" defaultValue={selectedUser.name} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="last_name" className="text-right">Apellido</Label>
                                <Input id="last_name" name="last_name" defaultValue={selectedUser.last_name} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={selectedUser.email} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Teléfono</Label>
                                <Input id="phone" name="phone" defaultValue={selectedUser.phone} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">Dirección</Label>
                                <Textarea id="address" name="address" defaultValue={selectedUser.address} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role_id" className="text-right">Rol</Label>
                                <Select name="role_id" defaultValue={String(selectedUser.role_id)}>
                                    <SelectTrigger id="role_id" className="col-span-3">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Administrador</SelectItem>
                                        <SelectItem value="2">Usuario</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="is_active" className="text-right">Estado</Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={isUserActive}
                                        onCheckedChange={setIsUserActive}
                                    />
                                    <span>{isUserActive ? "Activo" : "Inactivo"}</span>
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-4">Guardar cambios</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}