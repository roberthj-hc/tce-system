import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast as sonner } from "sonner"
import { useRouter } from "next/navigation"

export type Customer = {
  customer_id?: number
  name: string
  ci: string
  email: string
  phone: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useCustomerForm() {

  const router = useRouter()

  const [customerForm, setCustomerForm] = useState<Customer>({
    name: "",
    ci: "",
    email: "",
    phone: ""
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setisEditing] = useState(false)
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const fetchCustomer = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setCustomerForm(data)
      } else {
        sonner.error(data?.error || "Error al cargar el cliente")
      }
    } catch {
      sonner.error("Error del servidor al cargar el cliente")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      setisEditing(true)
      fetchCustomer(id)
    } else {
      setLoading(false)
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const endpoint = isEditing
      ? `${apiUrl}/api/customers/update/${id}`
      : `${apiUrl}/api/customers/register`

    const method = isEditing ? "PUT" : "POST"

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(customerForm)
      })

      const data = await res.json()

      if (res.ok) {
        sonner.success(isEditing ? "Cliente actualizado exitosamente" : "Cliente registrado exitosamente")
        if (isEditing) {
          router.push('/system/customers/list')
        } else {
          setCustomerForm({ name: "", ci: "", email: "", phone: "" })
        }
      } else {
        sonner.error(data?.error || "Error al guardar cliente")
      }
    } catch {
      sonner.error("Error del servidor al guardar")
    }
  }

  return {
    customerForm,
    handleChange,
    handleSubmit,
    isEditing,
    loading
  }
}
