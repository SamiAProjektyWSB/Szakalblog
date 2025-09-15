"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Eye, Edit, Trash2, Calendar, Video, Link } from "lucide-react"
import type { BlogPost } from "@/lib/types"
import { getBlogPosts, updateBlogPost, deleteBlogPost } from "@/lib/actions"

export default function BrowsePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setIsLoading(true)
    const result = await getBlogPosts()
    if (result.success && result.posts) {
      setPosts(result.posts)
    }
    setIsLoading(false)
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return

    const result = await updateBlogPost(editingPost.id, {
      title: editTitle,
      content: editContent,
    })

    if (result.success) {
      await loadPosts()
      setEditingPost(null)
      setEditTitle("")
      setEditContent("")
    }
  }

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const result = await deleteBlogPost(postId)
      if (result.success) {
        await loadPosts()
        if (selectedPost?.id === postId) {
          setSelectedPost(null)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No blog posts yet</h3>
        <p className="text-slate-500">Generate your first blog post from a video to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="mb-2">
                  {post.sourceType === "upload" ? (
                    <>
                      <Video className="w-3 h-3 mr-1" /> Upload
                    </>
                  ) : (
                    <>
                      <Link className="w-3 h-3 mr-1" /> YouTube
                    </>
                  )}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{post.content.substring(0, 150)}...</p>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPost(post)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedPost?.title}</DialogTitle>
                      <DialogDescription>
                        Generated from {selectedPost?.sourceType === "upload" ? "uploaded file" : "YouTube"}:{" "}
                        {selectedPost?.fileName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed">{selectedPost?.content}</div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Make changes to your blog post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingPost(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
