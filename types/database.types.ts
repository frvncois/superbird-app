// types/database.types.ts - Updated to include task_comments
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'member'
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          url: string | null
          status: 'active' | 'inactive' | 'completed'
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          url?: string | null
          status?: 'active' | 'inactive' | 'completed'
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          url?: string | null
          status?: 'active' | 'inactive' | 'completed'
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          project_id: string
          assigned_to: string | null
          created_by: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          project_id: string
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          due_date?: string | null
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          content_details: string | null
          assigned_task_id: string | null
          assigned_user_id: string | null
          attached_files: string[] | null
          status: 'draft' | 'review' | 'approved' | 'published'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content: string
          content_details?: string | null
          assigned_task_id?: string | null
          assigned_user_id?: string | null
          attached_files?: string[] | null
          status?: 'draft' | 'review' | 'approved' | 'published'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          content_details?: string | null
          assigned_task_id?: string | null
          assigned_user_id?: string | null
          attached_files?: string[] | null
          status?: 'draft' | 'review' | 'approved' | 'published'
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          role?: 'admin' | 'member'
        }
      }
    }
  }
}