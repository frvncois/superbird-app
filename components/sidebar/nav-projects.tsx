// components/sidebar/nav-projects.tsx
"use client"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  IconEdit,
  IconExternalLink,
} from "@tabler/icons-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useProjectStore } from "@/lib/stores/project-store"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"

type Project = Database['public']['Tables']['projects']['Row']

export function NavProjects({
  projects,
}: {
  projects: Project[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { removeProject, setCurrentProject } = useProjectStore()
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handleProjectAction = async (action: string, project: Project) => {
    switch (action) {
      case "open":
        setCurrentProject(project)
        router.push(`/projects/${project.id}`)
        break
      case "edit":
        // TODO: Open edit modal
        break
      case "share":
        // TODO: Open share modal
        break
      case "delete":
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
          setLoading(project.id)
          try {
            const { error } = await supabase
              .from('projects')
              .delete()
              .eq('id', project.id)

            if (error) throw error
            removeProject(project.id)
          } catch (error) {
            console.error('Error deleting project:', error)
          } finally {
            setLoading(null)
          }
        }
        break
      case "visit":
        if (project.url) {
          window.open(project.url, '_blank')
        }
        break
    }
  }

  // Show only recent/active projects in sidebar
  const recentProjects = projects
    .filter(p => p.status === 'active')
    .slice(0, 5)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {recentProjects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton asChild>
              <a 
                href={`/projects/${project.id}`}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <IconFolder className="flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </div>
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs flex-shrink-0 ml-2"
                >
                  {project.status}
                </Badge>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                  disabled={loading === project.id}
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleProjectAction("open", project)}>
                  <IconFolder />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProjectAction("edit", project)}>
                  <IconEdit />
                  <span>Edit</span>
                </DropdownMenuItem>
                {project.url && (
                  <DropdownMenuItem onClick={() => handleProjectAction("visit", project)}>
                    <IconExternalLink />
                    <span>Visit Site</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleProjectAction("share", project)}>
                  <IconShare3 />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  variant="destructive"
                  onClick={() => handleProjectAction("delete", project)}
                  disabled={loading === project.id}
                >
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton 
            className="text-sidebar-foreground/70"
            asChild
          >
            <a href="/projects">
              <IconDots className="text-sidebar-foreground/70" />
              <span>View All Projects</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}