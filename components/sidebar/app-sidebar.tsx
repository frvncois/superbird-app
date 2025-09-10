// components/sidebar/app-sidebar.tsx
"use client"
import * as React from "react"
import {
  IconDashboard,
  IconFolder,
  IconUsers,
  IconFileText,
  IconCheckbox,
  IconSettings,
  IconHelp,
  IconSearch,
  IconBrandWebflow,
} from "@tabler/icons-react"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useProjectStore } from "@/lib/stores/project-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useAuthStore()
  const { projects } = useProjectStore()

  const navMain = [
    {
      title: "Workspace",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconCheckbox,
    },
    {
      title: "Content",
      url: "/content",
      icon: IconFileText,
    },
    {
      title: "Files",
      url: "/files",
      icon: IconFileText,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: IconFileText,
    },
  ]

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/search",
      icon: IconSearch,
    },
  ]

  const userData = {
    name: profile?.full_name || "User",
    email: profile?.email || "",
    avatar: profile?.avatar_url || "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-12"
            >
              <a href="/dashboard">
                <IconBrandWebflow className="!size-5" />
                <span className="text-base font-semibold">Droplog</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

