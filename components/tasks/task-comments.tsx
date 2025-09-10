// components/tasks/task-comments.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare,
  Send,
  Clock,
  User,
  Trash2,
  Edit
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

type TaskComment = Database['public']['Tables']['task_comments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TaskCommentWithProfile extends TaskComment {
  profile?: Profile
}

interface TaskCommentsProps {
  taskId: string
  onClose: () => void
}

export function TaskComments({ taskId, onClose }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskCommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const { user } = useAuthStore()
  const supabase = createClient()

  // Load comments for the task
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('task_comments')
          .select(`
            *,
            profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('task_id', taskId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profile: comment.profiles
        }))

        setComments(commentsWithProfiles)
      } catch (error) {
        console.error('Error loading comments:', error)
        toast.error('Failed to load comments')
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [taskId, supabase])

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      const commentWithProfile = {
        ...data,
        profile: data.profiles
      }

      setComments(prev => [...prev, commentWithProfile])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from('task_comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim() }
          : comment
      ))

      setEditingCommentId(null)
      setEditContent('')
      toast.success('Comment updated successfully')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.filter(comment => comment.id !== commentId))
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const startEditComment = (comment: TaskCommentWithProfile) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Comments List */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 py-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-500">Be the first to start the discussion!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={comment.profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {comment.profile?.full_name 
                          ? getInitials(comment.profile.full_name)
                          : 'U'
                        }
                      </AvatarFallback>
                    </Avatar>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {comment.profile?.full_name || 'Unknown User'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {comment.created_at !== comment.updated_at && (
                          <Badge variant="outline" className="text-xs">
                            Edited
                          </Badge>
                        )}
                      </div>

                      {/* Comment Text */}
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit your comment..."
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      )}
                    </div>

                    {/* Actions (only for comment owner) */}
                    {user?.id === comment.user_id && editingCommentId !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditComment(comment)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* New Comment Form */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px] resize-none"
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newComment.length}/1000 characters
              </span>
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}