"use client"

import { UserPlus, BookOpen, Rocket, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up & Choose Track",
    description: "Create your account and select from Data Professional or Full Stack Development tracks.",
    color: "purple"
  },
  {
    icon: BookOpen,
    step: "02",
    title: "Learn & Practice",
    description: "Access cloud IDE, follow structured curriculum, and build real-world projects.",
    color: "blue"
  },
  {
    icon: Rocket,
    step: "03",
    title: "Build & Get Certified",
    description: "Complete projects, earn certificates, and launch your tech career with confidence.",
    color: "indigo"
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start your learning journey in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const colorClasses = {
              purple: "from-purple-500 to-purple-600",
              blue: "from-blue-500 to-blue-600",
              indigo: "from-indigo-500 to-indigo-600"
            }
            
            return (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8 border-2 border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 hover:shadow-xl">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} flex items-center justify-center mb-6 mx-auto`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-center">{step.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
