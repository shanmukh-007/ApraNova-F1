import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Careers • ApraNova",
  description: "Join our team and help shape the future of tech education",
}

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Remote / Bangalore",
      type: "Full-time",
      description: "Build and scale our learning platform using React, Node.js, and cloud technologies.",
    },
    {
      title: "Technical Trainer - Data Science",
      department: "Education",
      location: "Remote",
      type: "Full-time",
      description: "Mentor students in Data Science, ML, and AI with hands-on project guidance.",
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Bangalore",
      type: "Full-time",
      description: "Drive product strategy and roadmap for our ed-tech platform.",
    },
    {
      title: "UI/UX Designer",
      department: "Design",
      location: "Remote / Bangalore",
      type: "Full-time",
      description: "Create intuitive and engaging learning experiences for students and trainers.",
    },
  ]

  const benefits = [
    "Competitive salary and equity",
    "Health insurance for you and family",
    "Flexible work hours",
    "Remote-first culture",
    "Learning & development budget",
    "Quarterly team offsites",
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-xl text-muted-foreground">
            Help us empower the next generation of tech professionals. We're building something special.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why ApraNova?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <p className="font-medium">{benefit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base">{job.description}</CardDescription>
                    </div>
                    <Button>
                      Apply <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Don't see a role that fits? We're always looking for talented people.
          </p>
          <Button variant="outline" size="lg">
            Send us your resume
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
