"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  PackageSearch,
  ShoppingCart,
  FileBarChart2,
  ScanBarcode,
  Users,
  User,
  Smartphone,
  ChevronRight,
  GalleryHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { useSidebar } from "@/components/ui/sidebar"

const getRoleLabel = (role_id: number): string => {
  switch (role_id) {
    case 1:
      return "Administrador"
    case 2:
      return "Usuario"
    default:
      return "Usuario"
  }
}

const navMain = [
  {
    title: "Dashboard",
    url: "/system/dashboard",
    icon: LayoutDashboard,
    roles: [1, 2],
    items: [],
  },
  {
    title: "Soporte",
    url: "#",
    icon: Smartphone,
    roles: [1, 2],
    items: [
      { title: "Nuevo", url: "/system/repairs/register", roles: [1, 2] },
      { title: "Listado", url: "/system/repairs/list", roles: [1, 2] },
    ],
  },
  {
    title: "Ventas",
    url: "#",
    icon: ShoppingCart,
    roles: [1, 2],
    items: [
      { title: "Nueva Venta", url: "/system/sales/register", roles: [1, 2] },
      { title: "Historial", url: "/system/sales/history", roles: [1, 2] },
    ],
  },
  {
    title: "Productos",
    url: "#",
    icon: Boxes,
    roles: [1, 2],
    items: [
      { title: "Agregar", url: "/system/products/register", roles: [1] },
      { title: "Listado", url: "/system/products/list", roles: [1, 2] },
    ],
  },
  {
    title: "Clientes",
    url: "#",
    icon: Users,
    roles: [1, 2],
    items: [
      { title: "Agregar", url: "/system/customers/register", roles: [1] },
      { title: "Listado", url: "/system/customers/list", roles: [1, 2] },
    ],
  },
  {
    title: "QR",
    url: "/system/qr",
    icon: ScanBarcode,
    roles: [1, 2],
    items: [],
  }, {
    title: "Secciones",
    url: "#",
    icon: GalleryHorizontal,
    roles: [1],
    items: [
      { title: "Administrar", url: "/system/sections", roles: [1] }
    ],
  },
  {
    title: "Inventario",
    url: "#",
    icon: PackageSearch,
    roles: [1],
    items: [
      { title: "Movimientos", url: "/system/inventory/movements", roles: [1] },
      { title: "Ajustar", url: "/system/inventory/adjust", roles: [1] },
      { title: "Proveedores", url: "/system/inventory/suppliers", roles: [1] },
    ],
  },
  {
    title: "Reportes",
    url: "#",
    icon: FileBarChart2,
    roles: [1],
    items: [
      { title: "Ventas", url: "/system/reports/sales", roles: [1] },
      { title: "Soporte", url: "/system/reports/repairs", roles: [1] },
    ],
  },
  {
    title: "Usuarios",
    url: "#",
    icon: User,
    roles: [1],
    items: [
      { title: "Gestionar", url: "/system/manage/users", roles: [1] },
    ]
  },
]

function NavMain({
  items,
  userRole,
}: {
  items: typeof navMain
  userRole: number
}) {
  const [openStates, setOpenStates] = React.useState<Record<string, boolean>>({})
  const { setOpenMobile, isMobile } = useSidebar()
  const router = useRouter()

  const toggleOpen = (key: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleNavigation = (url: string) => {
    if (isMobile) {
      setOpenMobile(false)
    }
    router.push(url)
  }

  const commonItems = items.filter((item) => item.roles.includes(2))
  const adminItems = items.filter((item) => item.roles.includes(1) && !item.roles.includes(2))

  const renderItems = (list: typeof navMain) =>
    list.map((item) => {
      const visibleSubitems = item.items?.filter((sub) => sub.roles?.includes(userRole)) || []

      if (visibleSubitems.length > 0) {
        return (
          <Collapsible
            key={item.title}
            open={openStates[item.title] || false}
            onOpenChange={() => toggleOpen(item.title)}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between gap-2">
                <div className="flex gap-2 items-center">
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openStates[item.title] ? "rotate-90" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 space-y-1">
              {visibleSubitems.map((subitem) => (
                <Button
                  key={subitem.title}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => handleNavigation(subitem.url)}
                >
                  {subitem.title}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )
      }

      if (item.items.length === 0) {
        return (
          <Button
            key={item.title}
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => handleNavigation(item.url)}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Button>
        )
      }

      return null
    })

  return (
    <div className="space-y-1 px-2 py-2">
      {renderItems(commonItems)}

      {userRole === 1 && adminItems.length > 0 && (
        <>
          <div className="border-t border-muted my-3" />
          {renderItems(adminItems)}
        </>
      )}
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || loading || !user) {
    return null
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                  <Image
                    src="/TCE-02.png"
                    alt="Logo claro"
                    width={40}
                    height={40}
                    className="block dark:hidden object-cover"
                  />
                  <Image
                    src="/TCE-01.png"
                    alt="Logo oscuro"
                    width={40}
                    height={40}
                    className="hidden dark:block object-cover"
                  />
                </div>
                <span className="text-sidebar-primary-foreground">
                  {getRoleLabel(user.role_id)}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} userRole={user.role_id} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
