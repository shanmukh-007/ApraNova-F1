"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Data Analyst at Google",
    content: "ApraNova transformed my career. The cloud workspace made learning so convenient, and the mentors were always there to help.",
    rating: 5,
    initials: "PS"
  },
  {
    name: "Rahul Kumar",
    role: "Full Stack Developer at Amazon",
    content: "Best investment I made in my career. The project-based learning approach helped me build a strong portfolio.",
    rating: 5,
    initials: "RK"
  },
  {
    name: "Sneha Patel",
    role: "ML Engineer at Microsoft",
    content: "The structured curriculum and real-world projects gave me the confidence to land my dream job. Highly recommended!",
    rating: 5,
    initials: "SP"
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Student{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Success Stories
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of students who transformed their careers with ApraNova
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3 pt-4">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
