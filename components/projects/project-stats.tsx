interface ProjectStatsProps {
  projects: any[]
  tasks: any[]
}

export function ProjectStats({ projects, tasks }: ProjectStatsProps) {
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
        <div className="text-sm text-gray-600">Active Projects</div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
        <div className="text-sm text-gray-600">Completed Projects</div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
        <div className="text-sm text-gray-600">Total Tasks</div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-2xl font-bold text-orange-600">{completionRate}%</div>
        <div className="text-sm text-gray-600">Completion Rate</div>
      </div>
    </div>
  )
}