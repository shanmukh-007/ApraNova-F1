import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "FAQ • ApraNova",
  description: "Frequently asked questions about ApraNova",
}

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I enroll in a course?",
          a: "Click on 'Get Started' button, create your account, choose your track (Data Professional or Full Stack Development), and complete the payment process. You'll get instant access to the course materials."
        },
        {
          q: "Do I need prior programming experience?",
          a: "For Full Stack Development, basic programming knowledge is helpful but not required. For Data Professional track, familiarity with basic statistics and Excel is recommended."
        },
        {
          q: "What are the system requirements?",
          a: "You need a computer with internet connection, modern web browser (Chrome, Firefox, or Safari), and at least 4GB RAM. All development happens in cloud-based environments."
        },
      ]
    },
    {
      category: "Course & Learning",
      questions: [
        {
          q: "How long does it take to complete a track?",
          a: "Most students complete a track in 3-6 months with 10-15 hours of study per week. The course is self-paced, so you can go faster or slower based on your schedule."
        },
        {
          q: "Will I get a certificate?",
          a: "Yes! Upon successful completion of all projects and assessments, you'll receive a verified certificate that you can share on LinkedIn and your resume."
        },
        {
          q: "Can I access course materials after completion?",
          a: "Yes, you get lifetime access to all course materials, including future updates and new content additions."
        },
      ]
    },
    {
      category: "Support & Mentorship",
      questions: [
        {
          q: "How does mentorship work?",
          a: "Each student is assigned a dedicated mentor who provides 1-on-1 guidance, code reviews, and career advice. You can schedule sessions through the platform."
        },
        {
          q: "What if I get stuck on a project?",
          a: "You have multiple support channels: 1-on-1 mentor sessions, community forum, and email support. Most queries are resolved within 24 hours."
        },
        {
          q: "Is there a community I can join?",
          a: "Yes! We have an active Discord community where students collaborate, share resources, and network with peers and alumni."
        },
      ]
    },
    {
      category: "Career & Placement",
      questions: [
        {
          q: "Do you provide job placement assistance?",
          a: "Yes, we offer resume reviews, mock interviews, and connect you with our hiring partners. While we can't guarantee placement, we provide all the tools and support needed."
        },
        {
          q: "What kind of jobs can I get after completion?",
          a: "Data Professional graduates typically get roles like Data Analyst, Business Analyst, or Junior Data Scientist. Full Stack graduates become Frontend, Backend, or Full Stack Developers."
        },
        {
          q: "What is the average salary after completion?",
          a: "Entry-level positions typically range from ₹3-6 LPA, with experienced professionals earning ₹8-15 LPA depending on skills and location."
        },
      ]
    },
    {
      category: "Payment & Refunds",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept credit/debit cards, UPI, net banking, and popular digital wallets. EMI options are also available for eligible customers."
        },
        {
          q: "Is there a refund policy?",
          a: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied within the first week, we'll provide a full refund, no questions asked."
        },
        {
          q: "Are there any hidden fees?",
          a: "No hidden fees! The course price includes everything: materials, mentorship, projects, certificate, and lifetime access."
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our courses, platform, and services.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-12">
          {faqs.map((section, index) => (
            <div key={index}>
              <h2 className="text-2xl font-bold mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((faq, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.q}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
              <p className="mb-4 text-purple-100">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
