"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { BlogPost, GenerateBlogPostRequest, ApiResponse } from "./types"

// Simple in-memory storage (in production, use a real database)
const blogPosts: BlogPost[] = []

/**
 * Simulates audio extraction from video
 * In a real implementation, you would use ffmpeg or similar
 */
async function extractAudio(source: GenerateBlogPostRequest): Promise<string> {
  // Simulate audio extraction process
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (source.type === "youtube") {
    return `Simulated audio extraction from YouTube: ${source.url}`
  } else {
    return `Simulated audio extraction from uploaded file: ${source.fileName}`
  }
}

/**
 * Simulates transcription using OpenAI Whisper
 * In a real implementation, you would send audio to OpenAI's transcription API
 */
async function transcribeAudio(audioInfo: string): Promise<string> {
  // Simulate transcription process
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return a realistic sample transcription
  return `
Hello everyone, and welcome to today's presentation. In this video, I'll be discussing the importance of sustainable technology and how it's shaping our future. 

First, let's talk about renewable energy sources. Solar and wind power have become increasingly efficient and cost-effective over the past decade. The technology has advanced to the point where these renewable sources are now competitive with traditional fossil fuels in many markets.

Next, I want to address the role of artificial intelligence in optimizing energy consumption. Smart grids and AI-powered systems can predict energy demand and automatically adjust supply accordingly, reducing waste and improving efficiency.

Another crucial aspect is the development of sustainable materials. Companies are now investing heavily in biodegradable plastics, recycled materials, and innovative alternatives that have minimal environmental impact.

The transportation sector is also undergoing a major transformation. Electric vehicles are becoming mainstream, and we're seeing significant improvements in battery technology that extend range while reducing charging times.

Finally, I believe that education and awareness are key to driving adoption of sustainable technologies. When people understand the benefits and have access to these solutions, they're more likely to make environmentally conscious choices.

Thank you for watching, and I hope this information has been helpful in understanding the current state and future potential of sustainable technology.
  `.trim()
}

/**
 * Generates a blog post from transcription using OpenAI GPT
 */
async function generateBlogPostFromTranscription(
  transcription: string,
  source: GenerateBlogPostRequest,
): Promise<{ title: string; content: string }> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert content writer who specializes in transforming video transcriptions into engaging, well-structured blog posts. 

Your task is to:
1. Create an engaging title that captures the main theme
2. Transform the transcription into a coherent, well-formatted blog post
3. Add proper structure with headings, paragraphs, and flow
4. Enhance readability while maintaining the original message
5. Add a compelling introduction and conclusion
6. Use markdown formatting for better presentation

The blog post should be informative, engaging, and easy to read. Maintain the speaker's key points but improve the structure and flow for written content.`,
      prompt: `Please transform this video transcription into an engaging blog post:

Source: ${source.type === "youtube" ? "YouTube video" : "Uploaded video file"} - ${source.fileName}

Transcription:
${transcription}

Please provide the response in the following format:
TITLE: [Your engaging title here]

CONTENT: [Your blog post content here with proper formatting]`,
    })

    // Parse the response to extract title and content
    const lines = text.split("\n")
    let title = "Untitled Blog Post"
    let content = text

    const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|$)/i)
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/i)

    if (titleMatch) {
      title = titleMatch[1].trim()
    }

    if (contentMatch) {
      content = contentMatch[1].trim()
    }

    return { title, content }
  } catch (error) {
    console.error("Error generating blog post:", error)
    throw new Error("Failed to generate blog post with AI")
  }
}

/**
 * Main function to generate a blog post from video source
 */
export async function generateBlogPost(request: GenerateBlogPostRequest): Promise<ApiResponse> {
  try {
    // Step 1: Extract audio (simulated)
    const audioInfo = await extractAudio(request)

    // Step 2: Transcribe audio (simulated)
    const transcription = await transcribeAudio(audioInfo)

    // Step 3: Generate blog post using AI
    const { title, content } = await generateBlogPostFromTranscription(transcription, request)

    // Step 4: Create and save blog post
    const blogPost: BlogPost = {
      id: Date.now().toString(),
      title,
      content,
      sourceType: request.type,
      fileName: request.fileName,
      url: request.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    blogPosts.unshift(blogPost) // Add to beginning of array

    return {
      success: true,
      post: blogPost,
    }
  } catch (error) {
    console.error("Error in generateBlogPost:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Retrieves all blog posts
 */
export async function getBlogPosts(): Promise<ApiResponse> {
  try {
    return {
      success: true,
      posts: [...blogPosts], // Return a copy
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to retrieve blog posts",
    }
  }
}

/**
 * Updates an existing blog post
 */
export async function updateBlogPost(
  id: string,
  updates: Partial<Pick<BlogPost, "title" | "content">>,
): Promise<ApiResponse> {
  try {
    const postIndex = blogPosts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
      return {
        success: false,
        error: "Blog post not found",
      }
    }

    blogPosts[postIndex] = {
      ...blogPosts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      post: blogPosts[postIndex],
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to update blog post",
    }
  }
}

/**
 * Deletes a blog post
 */
export async function deleteBlogPost(id: string): Promise<ApiResponse> {
  try {
    const postIndex = blogPosts.findIndex((post) => post.id === id)

    if (postIndex === -1) {
      return {
        success: false,
        error: "Blog post not found",
      }
    }

    blogPosts.splice(postIndex, 1)

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete blog post",
    }
  }
}
