"use client"

import { useState } from "react"
import { HelpCircle, Search, Book, MessageCircle, Mail, Phone, FileText, Video, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"

export default function StudentHelpPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")

  const handleSubmitTicket = () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "Ticket Submitted",
      description: "Our support team will get back to you soon",
    })
    setSubject("")
    setMessage("")
  }

  const faqs = [
    {
      question: "How do I access my workspace?",
      answer: "Go to the Workspace page from the sidebar. Click 'Create Workspace' if you don't have one yet. Your workspace will be ready in a few seconds with all the necessary development tools."
    },
    {
      question: "How do I submit my assignments?",
      answer: "Navigate to the Submit page from the sidebar. Select your batch and assignment, upload your files or provide a GitHub link, and click Submit. You'll receive a confirmation once submitted."
    },
    {
      question: "Can I change my password?",
      answer: "Yes! Go to Profile > Change Password section. Enter your current password, then your new password twice, and click 'Change Password'."
    },
    {
      question: "How do I enable notifications?",
      answer: "Visit Settings > Notifications to customize your notification preferences. You can enable/disable email notifications, push notifications, course updates, and assignment reminders."
    },
    {
      question: "What if I forget my password?",
      answer: "Click 'Forgot Password?' on the login page. Enter your email address and we'll send you a reset link."
    },
    {
      question: "How do I track my progress?",
      answer: "Your dashboard shows your overall progress, completed assignments, and upcoming deadlines. You can also view detailed analytics in the Progress section."
    },
    {
      question: "Can I download course materials?",
      answer: "Yes, all course materials including videos, PDFs, and code samples are available for download from the Project Guide page."
    },
    {
      question: "How do I contact my instructor?",
      answer: "You can reach your instructor through the Messages section or by submitting a support ticket below with 'Instructor Query' as the subject."
    }
  ]

  const resources = [
    {
      icon: Book,
      title: "Documentation",
      description: "Complete guides and tutorials",
      link: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      link: "#"
    },
    {
      icon: FileText,
      title: "Knowledge Base",
      description: "Articles and best practices",
      link: "#"
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description: "Connect with other students",
      link: "#"
    }
  ]

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground">Dashboard / Help & Support</div>

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Help & Support</h2>
        <p className="text-muted-foreground">Find answers and get assistance</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access helpful resources</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {resources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  asChild
                >
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{resource.title}</div>
                      <div className="text-sm text-muted-foreground">{resource.description}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get in touch with our team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">support@apranova.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Phone</div>
                <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Live Chat</div>
                <div className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Submit Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
          <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
          <Button onClick={handleSubmitTicket} className="w-full">
            Submit Ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
