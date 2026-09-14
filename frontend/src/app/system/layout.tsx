
import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar"

import React from "react"

import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"


import { NotificationButton } from "@/components/notification-button"

export default function Page({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarContent>
        {/* sticky top-0 z-40 bg-background rounded-md  */}
        <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex items-center gap-2">
            <NotificationButton />
            <ModeToggle />
          </div>

        </header>

        {children}
      </SidebarContent>
    </SidebarProvider>
  )
}
