"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Code, ArrowRight, BarChart3, Laptop } from "lucide-react"

export default function SelectTrackPage() {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)

  const tracks = [
    {
      id: "DP",
      name: "Data Professional",
      description: "Master data analytics, SQL, ETL pipelines, and cloud data warehousing",
      icon: Database,
      color: "purple",
      features: [
        "Apache Superset Analytics",
        "SQL Lab & Query Editor",
        "Interactive Dashboards",
        "Database Connections",
        "Data Visualization",
        "Business Intelligence"
      ],
      gradient: "from-purple-500 to-purple-700"
    },
    {
      id: "FSD",
      name: "Full Stack Development",
      description: "Build modern web applications with React, Node.js, and cloud technologies",
      icon: Code,
      color: "blue",
      features: [
        "VS Code IDE in Browser",
        "React & Next.js",
        "Node.js & Express",
        "Database Design",
        "API Development",
        "Cloud Deployment"
      ],
      gradient: "from-blue-500 to-blue-700"
    }
  ]

  const handleContinue = () => {
    if (selectedTrack) {
      // Store selected track in sessionStorage
      sessionStorage.setItem("selectedTrack", selectedTrack)
      // Redirect to payment page with track parameter
      router.push(`/payment?track=${selectedTrack}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Learning Track
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the track that aligns with your career goals. You can always switch later.
          </p>
        </div>

        {/* Track Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {tracks.map((track) => {
            const Icon = track.icon
            const isSelected = selectedTrack === track.id
            
            return (
              <Card
                key={track.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isSelected
                    ? `ring-4 ring-${track.color}-500 shadow-2xl scale-105`
                    : "hover:scale-102"
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <CardContent className="p-8">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${track.gradient}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{track.name}</h3>
                      <p className="text-muted-foreground">{track.description}</p>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      What You'll Learn
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {track.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${track.color}-500`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workspace Preview */}
                  <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                    <div className="flex items-center gap-2 mb-2">
                      {track.id === "DP" ? (
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Laptop className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm font-semibold">Your Workspace</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {track.id === "DP"
                        ? "Apache Superset - Professional data analytics platform"
                        : "VS Code IDE - Complete development environment"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedTrack}
            className={`w-full max-w-md h-14 text-lg font-semibold ${
              selectedTrack === "DP"
                ? "bg-purple-600 hover:bg-purple-700"
                : selectedTrack === "FSD"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400"
            }`}
          >
            Continue to Payment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Your track is already saved in your account
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
