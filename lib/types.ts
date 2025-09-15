export interface BlogPost {
  id: string
  title: string
  content: string
  sourceType: "upload" | "youtube"
  fileName: string
  url?: string
  createdAt: string
  updatedAt: string
}

export interface GenerateBlogPostRequest {
  type: "upload" | "youtube"
  fileName: string
  url?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  post?: BlogPost
  posts?: BlogPost[]
}
