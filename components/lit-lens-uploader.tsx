"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Upload, FileText, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

export function LitLensUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [researchGoal, setResearchGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !researchGoal) return

    setIsLoading(true)
    setSummary("")

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("goal", researchGoal);
  
      const res = await fetch("https://ashley-perkins--litlens.hf.space/summarize-hf-pdfs", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      setSummary(data.summary || "No summary returned.");
    } catch (err) {
      console.error("Error fetching summary:", err);
      setSummary("Something went wrong while summarizing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors",
            isDragging ? "border-[#1F2B3A] bg-blue-50" : "border-gray-300",
            file ? "bg-blue-50" : "bg-white",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 rounded-full bg-blue-100">
              {file ? <FileText className="h-8 w-8 text-[#1F2B3A]" /> : <Upload className="h-8 w-8 text-[#1F2B3A]" />}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">{file ? file.name : "Upload your PDF"}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {file ? "File selected" : "Drag and drop or click to select a file"}
              </p>
            </div>

            {!file && (
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="mt-2"
              >
                Select PDF
              </Button>
            )}

            {file && (
              <Button type="button" variant="outline" onClick={() => setFile(null)} className="mt-2">
                Remove File
              </Button>
            )}

            <input
              id="file-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="research-goal" className="block text-sm font-medium text-gray-700">
            Research Goal
          </label>
          <Textarea
            id="research-goal"
            placeholder="e.g. Identify biomarkers for appendiceal neoplasms"
            value={researchGoal}
            onChange={(e) => setResearchGoal(e.target.value)}
            className="min-h-[100px] bg-white"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#1F2B3A] hover:bg-[#2d3b4d]"
          disabled={!file || !researchGoal || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Summarize
            </>
          )}
        </Button>
      </form>

      {(isLoading || summary) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
          <Card className="p-6 bg-white border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#1F2B3A] animate-spin mb-4" />
                <p className="text-gray-500">Analyzing your document...</p>
              </div>
            ) : (
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{summary}</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
