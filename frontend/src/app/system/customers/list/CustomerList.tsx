"use client"

import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import { useCustomerList } from "./useCustomerList"
import { Plus } from "lucide-react"

function CustomerList() {
  const {
    search,
    setSearch,
    page,
    setPage,
    perPage,
    setPerPage,
    customers,
    totalPages,
    deleteCustomer,
    handleEdit
  } = useCustomerList()

  return (
    <>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Lista de Clientes</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona a tus clientes registrados
          </p>
        </div>
        <Link href="/system/customers/register">
          <Button className="gap-2 px-4 py-2">
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <Input
          placeholder="Buscar por nombre, CI o email..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-[200px]"
        />
      </div>

      <Card className="p-6 space-y-6 shadow-sm mt-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 [&>th]:py-6">
              <TableHead>Nombre</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.ci}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button variant="outline" onClick={() => handleEdit(customer)}>Editar</Button>
                  <Button variant="destructive" onClick={() => deleteCustomer(customer.customer_id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Select onValueChange={(value: string) => {
              setPerPage(parseInt(value))
              setPage(1)
            }}>
              <SelectTrigger className="w-[80px]">{perPage.toString()}</SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              ←
            </Button>
            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              →
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

export default CustomerList
