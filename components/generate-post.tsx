"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, Link, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { generateBlogPost } from "@/lib/actions"
import type { BlogPost } from "@/lib/types"

export default function GeneratePost() {
  const [inputType, setInputType] = useState<"upload" | "youtube">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type (video files)
      const validTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"]
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("Please select a valid video file (MP4, AVI, MOV, WMV, WebM)")
      }
    }
  }

  const simulateProgress = (steps: string[]) => {
    let currentStepIndex = 0
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStep(steps[currentStepIndex])
        setProgress(((currentStepIndex + 1) / steps.length) * 100)
        currentStepIndex++
      } else {
        clearInterval(interval)
      }
    }, 2000)
    return interval
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setGeneratedPost(null)

    // Validate input
    if (inputType === "upload" && !file) {
      setError("Please select a video file")
      return
    }
    if (inputType === "youtube" && !youtubeUrl) {
      setError("Please enter a YouTube URL")
      return
    }

    setIsProcessing(true)
    setProgress(0)

    const steps = [
      "Extracting audio from video...",
      "Transcribing audio to text...",
      "Generating blog post with AI...",
      "Finalizing and saving post...",
    ]

    const progressInterval = simulateProgress(steps)

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 8000))

      const result = await generateBlogPost({
        type: inputType,
        fileName: file?.name || "YouTube Video",
        url: inputType === "youtube" ? youtubeUrl : undefined,
      })

      if (result.success && result.post) {
        setGeneratedPost(result.post)
        setCurrentStep("Blog post generated successfully!")
      } else {
        setError(result.error || "Failed to generate blog post")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      clearInterval(progressInterval)
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const handleSavePost = () => {
    if (generatedPost) {
      // Post is already saved in the generateBlogPost action
      alert("Post saved successfully!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Video or Provide YouTube Link</CardTitle>
          <CardDescription>Choose your video source to generate a blog post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={inputType} onValueChange={(value) => setInputType(value as "upload" | "youtube")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  YouTube Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="video-file">Select Video File</Label>
                  <Input id="video-file" type="file" accept="video/*" onChange={handleFileChange} className="mt-1" />
                  {file && (
                    <p className="text-sm text-slate-600 mt-1">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Blog Post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{currentStep}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Blog Post */}
      {generatedPost && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Blog Post Generated
              </CardTitle>
              <CardDescription>Your video has been successfully converted to a blog post</CardDescription>
            </div>
            <Button onClick={handleSavePost} variant="outline">
              Save Post
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold mb-4">{generatedPost.title}</h1>
              <div className="text-sm text-slate-500 mb-6">
                Generated on {new Date(generatedPost.createdAt).toLocaleDateString()} • Source:{" "}
                {generatedPost.sourceType === "upload" ? "Uploaded File" : "YouTube"} •{generatedPost.fileName}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{generatedPost.content}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
