// lib/supabase/queries.ts

import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type Project = Tables['projects']['Row']
type Task = Tables['tasks']['Row']
type Profile = Tables['profiles']['Row']

export class ProjectQueries {
  private supabase = createClient()

  async getProjects(userId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .or(`owner_id.eq.${userId},id.in.(${await this.getUserProjectIds(userId)})`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getProject(id: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createProject(project: Tables['projects']['Insert']) {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProject(id: string, updates: Tables['projects']['Update']) {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProject(id: string) {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  private async getUserProjectIds(userId: string): Promise<string> {
    const { data } = await this.supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
    
    return data?.map(p => p.project_id).join(',') || ''
  }
}

export class TaskQueries {
  private supabase = createClient()

  async getTasks(projectId?: string) {
    let query = this.supabase
      .from('tasks')
      .select('*')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createTask(task: Tables['tasks']['Insert']) {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateTask(id: string, updates: Tables['tasks']['Update']) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteTask(id: string) {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export class ContentQueries {
  private supabase = createClient()

  async getContentByProject(projectId: string) {
    const { data, error } = await this.supabase
      .from('project_content')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async createContent(content: Tables['content']['Insert']) {
    const { data, error } = await this.supabase
      .from('project_content')
      .insert(content)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateContent(id: string, updates: Tables['content']['Update']) {
    const { data, error } = await this.supabase
      .from('project_content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteContent(id: string) {
    const { error } = await this.supabase
      .from('project_content')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}