"use client"

import { Code2, BookOpen, TrendingUp, Users, Award, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Code2,
    title: "Cloud Workspace",
    description: "Access your VS Code IDE from anywhere. No setup required, start coding in seconds.",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Project-based curriculum designed by industry experts. Learn by building real applications.",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Real-time analytics and feedback. Track your growth with detailed insights.",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    icon: Users,
    title: "Expert Mentors",
    description: "24/7 support from experienced developers. Get help when you need it most.",
    gradient: "from-violet-500 to-violet-600"
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Industry-recognized certificates upon completion. Boost your resume and career.",
    gradient: "from-fuchsia-500 to-fuchsia-600"
  },
  {
    icon: Rocket,
    title: "Career Support",
    description: "Job placement assistance and interview prep. Launch your tech career with confidence.",
    gradient: "from-pink-500 to-pink-600"
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to accelerate your learning journey and career growth
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-200 dark:hover:border-purple-800"
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
