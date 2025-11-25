"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Code, Clock, FolderKanban, CheckCircle2, ArrowRight } from "lucide-react"

const tracks = [
  {
    title: "Data Professional",
    description: "Master data analysis, visualization, and machine learning",
    duration: "6 Months",
    projects: "8 Projects",
    icon: Database,
    gradient: "from-purple-500 to-purple-600",
    skills: ["Python", "SQL", "Pandas", "Machine Learning", "Data Visualization", "Statistics"],
    popular: true
  },
  {
    title: "Full Stack Development",
    description: "Build modern web applications from frontend to backend",
    duration: "8 Months",
    projects: "10 Projects",
    icon: Code,
    gradient: "from-blue-500 to-blue-600",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    popular: false
  }
]

export default function Tracks() {
  return (
    <section id="tracks" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Learning Track
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Structured paths designed to take you from beginner to job-ready professional
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tracks.map((track, index) => {
            const Icon = track.icon
            return (
              <Card 
                key={index}
                className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2"
              >
                {/* Popular Badge */}
                {track.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${track.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{track.title}</CardTitle>
                  <CardDescription className="text-base">
                    {track.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stats */}
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{track.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span>{track.projects}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      What You'll Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    asChild 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Link href="/signup">
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
