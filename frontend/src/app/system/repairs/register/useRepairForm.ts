import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast as sonner } from "sonner"
import { useRouter } from "next/navigation"

export type Repair = {
  repair_id?: number
  customer: string
  ci: string
  phone: string
  email?: string | null
  model: string
  price: number
  deposit: number
  partCost: number
  status: string
  description: string
  notes: string
  receivedAt: string
  deliveredAt: string | null
  customer_id?: number
  user_id?: number
}

export type Customer = {
  customer_id?: number
  name: string
  ci: string
  phone: string
  email: string | null
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export function useRepairForm() {
  const router = useRouter()
  const [repairForm, setRepairForm] = useState<Repair>({
    customer: "",
    ci: "",
    phone: "",
    email: null,
    model: "",
    price: 0,
    deposit: 0,
    partCost: 0,
    status: "received",
    description: "",
    notes: "",
    receivedAt: new Date().toISOString(),
    deliveredAt: null
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [mode, setMode] = useState<"none" | "search" | "register">("none")
  const [searchTerm, setSearchTerm] = useState("")

  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const fetchRepair = async (repairId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/repairs/${repairId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setRepairForm({
          ...data,
          customer: data.customer_name,
          ci: data.customer_ci,
          phone: data.customer_phone,
          email: data.customer_email,
          price: parseFloat(data.total_price),
          deposit: parseFloat(data.deposit),
          balance: parseFloat(data.balance),
          partCost: parseFloat(data.spare_part_cost),
          status: data.status,
          receivedAt: data.received_at,
          deliveredAt: data.delivered_at,
          customer_id: data.customer_id
        })
        if (data.customer_id) {
          const selectedCustomer = customers.find(c => c.customer_id === data.customer_id);
          if (selectedCustomer) {
            setSearchTerm(selectedCustomer.name);
            setMode("none");
          }
        }
      } else {
        sonner.error(data?.error || "Error al cargar el registro de reparación")
      }
    } catch (error) {
      console.error("Error al obtener reparación:", error)
      sonner.error(`Error del servidor al cargar el registro de reparación:`)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/customers/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setCustomers(data)
      } else {
        sonner.error("Error al cargar clientes")
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      sonner.error(`Error del servidor al cargar clientes:`)
    }
  }

  const registerNewCustomer = async (customerData: Omit<Customer, 'customer_id'>): Promise<number | undefined> => {
    try {
      const res = await fetch(`${apiUrl}/api/customers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(customerData)
      });
      const data = await res.json();
      if (res.ok) {
        await fetchCustomers();
        return data.customer_id;
      } else {
        sonner.error(data?.error || "Error al registrar cliente.");
        return undefined;
      }
    } catch (error) {
      console.error("Error del servidor durante el registro de cliente:", error);
      sonner.error("Error del servidor durante el registro de cliente.");
      return undefined;
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]))
        const id = decoded.id
        setUserId(id)
      } catch (error) {
        console.error("Error al decodificar token:", error)
        sonner.error(`Formato de token inválido:`)
      }
    } else {
      sonner.warning("Usuario no autenticado")
      router.push("/auth/login");
    }
  }, [])

  const isEditMode = searchParams.get("edit") === "1"

  useEffect(() => {
    fetchCustomers().then(() => {
      if (id && isEditMode) {
        setIsEditing(true)
        fetchRepair(id)
      } else {
        setLoading(false)
      }
    });
  }, [id, isEditMode])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setRepairForm(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      sonner.error("ID de usuario no encontrado. Por favor, inicie sesión de nuevo.")
      router.push("/auth/login");
      return
    }

    const baseRepairPayload = {
      description: repairForm.description,
      model: repairForm.model,
      total_price: parseFloat(repairForm.price.toString()),
      deposit: parseFloat(repairForm.deposit.toString()),
      spare_part_cost: parseFloat(repairForm.partCost.toString()),
      status: repairForm.status,
      received_at: repairForm.receivedAt,
      delivered_at: repairForm.deliveredAt,
      observations: repairForm.notes,
      user_id: userId,
      customer_id: repairForm.customer_id
    }

    try {
      if (isEditing) {
        if (!repairForm.repair_id) {
          sonner.error("Falta el ID de reparación para la actualización.");
          return;
        }

        const updatePayload = {
          ...baseRepairPayload,
        };

        const res = await fetch(`${apiUrl}/api/repairs/update/${repairForm.repair_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(updatePayload)
        });

        const data = await res.json();
        if (res.ok) {
          sonner.success("Reparación actualizada exitosamente");
          router.push("/system/repairs/list");
        } else {
          sonner.error(data?.error || "Error al actualizar reparación");
        }

      } else {
        const res = await fetch(`${apiUrl}/api/repairs/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(baseRepairPayload)
        });

        const data = await res.json();
        if (res.ok) {
          sonner.success("¡Reparación registrada exitosamente!");
          setRepairForm({
            customer: "", ci: "", phone: "", email: null,
            model: "", price: 0, deposit: 0, partCost: 0,
            status: "received",
            description: "", notes: "",
            receivedAt: new Date().toISOString(),
            deliveredAt: null,
            customer_id: undefined
          });
          setSearchTerm("");
          setMode("none");
          router.push("/system/repairs/list");
        } else {
          sonner.error(data?.error || "Error al registrar reparación");
        }
      }
    } catch (error) {
      console.error("Error del servidor durante la operación de reparación:", error);
      sonner.error(`Error del servidor durante la operación de reparación: `);
    }
  }

  return {
    repairForm,
    setRepairForm,
    handleChange,
    handleSubmit,
    isEditing,
    loading,
    customers,
    mode,
    setMode,
    searchTerm,
    setSearchTerm,
    registerNewCustomer
  }
}