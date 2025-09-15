"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import GeneratePost from "@/components/generate-post"
import BrowsePosts from "@/components/browse-posts"
import { Video, FileText } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("generate")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Video to Blog Generator</h1>
          <p className="text-slate-600 text-lg">Transform your videos into engaging blog posts with AI</p>
        </div>

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto shadow-lg">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Generate Post
                </TabsTrigger>
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Browse Posts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="generate" className="mt-0">
                <GeneratePost />
              </TabsContent>
              <TabsContent value="browse" className="mt-0">
                <BrowsePosts />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
