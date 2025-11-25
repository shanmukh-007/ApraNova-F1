import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import { Calendar, User, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Blog • ApraNova",
  description: "Latest insights, tips, and updates from ApraNova",
}

export default function BlogPage() {
  const posts = [
    {
      title: "5 Essential Skills Every Data Professional Needs in 2024",
      excerpt: "Discover the must-have skills that will set you apart in the competitive data science job market.",
      author: "Priya Kapoor",
      date: "Nov 5, 2024",
      category: "Data Science",
      readTime: "5 min read",
    },
    {
      title: "Full Stack Development: Frontend vs Backend - Which to Learn First?",
      excerpt: "A comprehensive guide to help you decide whether to start with frontend or backend development.",
      author: "Rahul Sharma",
      date: "Nov 3, 2024",
      category: "Web Development",
      readTime: "7 min read",
    },
    {
      title: "How to Build Your First Portfolio Project",
      excerpt: "Step-by-step guide to creating a portfolio project that impresses recruiters and hiring managers.",
      author: "Anjali Verma",
      date: "Oct 28, 2024",
      category: "Career",
      readTime: "6 min read",
    },
    {
      title: "The Future of Cloud Computing: Trends to Watch",
      excerpt: "Explore the emerging trends in cloud computing and how they'll shape the tech industry.",
      author: "Amit Patel",
      date: "Oct 25, 2024",
      category: "Technology",
      readTime: "8 min read",
    },
    {
      title: "Mastering Git: Essential Commands for Developers",
      excerpt: "A practical guide to Git commands that every developer should know for effective version control.",
      author: "Neha Singh",
      date: "Oct 20, 2024",
      category: "Development",
      readTime: "4 min read",
    },
    {
      title: "From Bootcamp to Job: Success Stories from Our Alumni",
      excerpt: "Read inspiring stories of students who successfully transitioned into tech careers after completing our programs.",
      author: "ApraNova Team",
      date: "Oct 15, 2024",
      category: "Success Stories",
      readTime: "10 min read",
    },
  ]

  const categories = ["All", "Data Science", "Web Development", "Career", "Technology", "Success Stories"]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Blog & Resources
          </h1>
          <p className="text-xl text-muted-foreground">
            Insights, tutorials, and career advice to help you succeed in tech.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {posts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <Button variant="ghost" className="w-full">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="pt-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="mb-6 text-purple-100">
                Get the latest articles, tutorials, and career tips delivered to your inbox weekly.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                />
                <Button variant="secondary">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
