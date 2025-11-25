"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  FileText,
  Database,
  Code,
  BarChart3,
  Workflow,
  Cloud
} from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/apiClient"
import { curriculumApi } from "@/lib/curriculum-api"

export default function ProjectGuidePage() {
  const [userTrack, setUserTrack] = useState<'DP' | 'FSD' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await apiClient.get("/users/profile")
        setUserTrack(response.data.track)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-950/30 dark:via-blue-950/30 dark:to-purple-950/30 border-2 border-cyan-200 dark:border-cyan-800 p-8 shadow-xl">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Project Guide
          </h1>
          <p className="text-slate-700 dark:text-slate-300 text-lg">
            {userTrack === 'DP' ? 'Data Professional Track' : 'Full-Stack Developer Track'}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Complete step-by-step workflows, deliverables, and resources for each project
          </p>
        </div>
      </div>

      {/* Track-specific content */}
      {userTrack === 'DP' ? <DataProfessionalGuide /> : <FullStackGuide />}
    </div>
  )
}

function DataProfessionalGuide() {
  return (
    <Tabs defaultValue="project1" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="project1">Project 1</TabsTrigger>
        <TabsTrigger value="project2">Project 2</TabsTrigger>
        <TabsTrigger value="project3">Project 3</TabsTrigger>
      </TabsList>

      {/* Project 1 */}
      <TabsContent value="project1" className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Project 1: Business Analytics Dashboard</CardTitle>
            <CardDescription>Build an interactive dashboard using Python, PostgreSQL, and Apache Superset</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow Flowchart */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Workflow className="h-5 w-5 text-cyan-600" />
                Workflow
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <FlowStep icon={<Download className="h-4 w-4" />} text="Download CSV" />
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                  <FlowStep icon={<Code className="h-4 w-4" />} text="Clean Data (Jupyter)" />
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                  <FlowStep icon={<Database className="h-4 w-4" />} text="Load to PostgreSQL" />
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                  <FlowStep icon={<BarChart3 className="h-4 w-4" />} text="Build Dashboard (Superset)" />
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                  <FlowStep icon={<FileText className="h-4 w-4" />} text="Write Report" />
                  <ArrowRight className="h-5 w-5 text-cyan-600" />
                  <FlowStep icon={<CheckCircle2 className="h-4 w-4" />} text="Submit" color="emerald" />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Detailed Steps</h3>
              <div className="space-y-3">
                <StepCard 
                  number={1}
                  title="Clean raw CSV dataset in Python/Pandas"
                  description="Use Jupyter Lab to load, explore, and clean the provided dataset. Handle missing values, fix data types, and remove duplicates."
                  tools={["Jupyter Lab", "Python", "Pandas"]}
                />
                <StepCard 
                  number={2}
                  title="Load transformed data into PostgreSQL"
                  description="Connect to your PostgreSQL schema and load the cleaned data using SQLAlchemy or psycopg2."
                  tools={["PostgreSQL", "Python"]}
                />
                <StepCard 
                  number={3}
                  title="Write complex SQL queries for KPIs & insights"
                  description="Create SQL queries to calculate key metrics, aggregations, and business insights."
                  tools={["PostgreSQL", "SQL"]}
                />
                <StepCard 
                  number={4}
                  title="Connect Superset to PostgreSQL schema"
                  description="Configure Apache Superset to connect to your database schema."
                  tools={["Apache Superset", "PostgreSQL"]}
                />
                <StepCard 
                  number={5}
                  title="Build interactive dashboard with filters/charts"
                  description="Create visualizations, add filters, and design an interactive dashboard."
                  tools={["Apache Superset"]}
                />
                <StepCard 
                  number={6}
                  title="Summarize findings in a 1-page insights report"
                  description="Write a PDF report highlighting key insights, trends, and recommendations."
                  tools={["PDF Editor"]}
                />
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Deliverables</h3>
              <div className="grid gap-3">
                <DeliverableItem text="Superset Dashboard URL" required />
                <DeliverableItem text="SQL queries (GitHub repo or file)" required />
                <DeliverableItem text="PDF Insights Report (1 page)" required />
                <DeliverableItem text="Python cleaning script (optional)" />
              </div>
            </div>

            {/* Action Button */}
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
              <Link href="/student/projects/1">
                Start Project 1
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Project 2 */}
      <TabsContent value="project2" className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Project 2: Automated ETL Pipeline</CardTitle>
            <CardDescription>Build an automated data pipeline with Prefect orchestration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Workflow className="h-5 w-5 text-purple-600" />
                Workflow
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <FlowStep icon={<Download className="h-4 w-4" />} text="Pull API Data" color="purple" />
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                  <FlowStep icon={<Code className="h-4 w-4" />} text="Transform (Pandas)" color="purple" />
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                  <FlowStep icon={<Database className="h-4 w-4" />} text="Load to PostgreSQL" color="purple" />
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                  <FlowStep icon={<Workflow className="h-4 w-4" />} text="Orchestrate (Prefect)" color="purple" />
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                  <FlowStep icon={<CheckCircle2 className="h-4 w-4" />} text="Submit" color="emerald" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Detailed Steps</h3>
              <div className="space-y-3">
                <StepCard 
                  number={1}
                  title="Extract data from REST API"
                  description="Use Python requests library to pull data from a public API."
                  tools={["Python", "Requests"]}
                />
                <StepCard 
                  number={2}
                  title="Transform data with Pandas"
                  description="Clean, normalize, and transform the API data."
                  tools={["Python", "Pandas"]}
                />
                <StepCard 
                  number={3}
                  title="Load data into PostgreSQL"
                  description="Insert transformed data into your database schema."
                  tools={["PostgreSQL", "Python"]}
                />
                <StepCard 
                  number={4}
                  title="Create Prefect workflow"
                  description="Build a Prefect flow to orchestrate the ETL pipeline."
                  tools={["Prefect", "Python"]}
                />
                <StepCard 
                  number={5}
                  title="Schedule and monitor pipeline"
                  description="Set up scheduling and monitoring in Prefect."
                  tools={["Prefect"]}
                />
                <StepCard 
                  number={6}
                  title="Document and submit"
                  description="Create documentation and submit your pipeline code."
                  tools={["GitHub", "Markdown"]}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Deliverables</h3>
              <div className="grid gap-3">
                <DeliverableItem text="Python ETL script (GitHub repo)" required />
                <DeliverableItem text="Prefect workflow DAG" required />
                <DeliverableItem text="PostgreSQL table with loaded data" required />
                <DeliverableItem text="Email report screenshot" required />
              </div>
            </div>

            <Button asChild size="lg" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Link href="/student/projects/2">
                Start Project 2
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Project 3 */}
      <TabsContent value="project3" className="space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Project 3: End-to-End Analytics Solution (Capstone)</CardTitle>
            <CardDescription>Build a cloud-hosted analytics solution with BigQuery/Redshift</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Workflow className="h-5 w-5 text-teal-600" />
                Workflow
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border-2 border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <FlowStep icon={<Database className="h-4 w-4" />} text="Combine Sources" color="teal" />
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                  <FlowStep icon={<Cloud className="h-4 w-4" />} text="Load to BigQuery" color="teal" />
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                  <FlowStep icon={<Code className="h-4 w-4" />} text="Optimized SQL" color="teal" />
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                  <FlowStep icon={<BarChart3 className="h-4 w-4" />} text="Cloud Dashboard" color="teal" />
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                  <FlowStep icon={<FileText className="h-4 w-4" />} text="Case Study" color="teal" />
                  <ArrowRight className="h-5 w-5 text-teal-600" />
                  <FlowStep icon={<CheckCircle2 className="h-4 w-4" />} text="Submit" color="emerald" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Deliverables</h3>
              <div className="grid gap-3">
                <DeliverableItem text="Cloud-hosted dashboard URL" required />
                <DeliverableItem text="SQL scripts (GitHub repo)" required />
                <DeliverableItem text="PDF Case Study Report" required />
              </div>
            </div>

            <Button asChild size="lg" className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
              <Link href="/student/projects/3">
                Start Project 3
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function FullStackGuide() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Full-Stack Developer guide coming soon...</p>
    </div>
  )
}

// Helper Components
function FlowStep({ icon, text, color = "cyan" }: { icon: React.ReactNode; text: string; color?: string }) {
  const colors = {
    cyan: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
    purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    teal: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
  }
  
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${colors[color as keyof typeof colors]}`}>
      {icon}
      <span className="font-medium text-sm whitespace-nowrap">{text}</span>
    </div>
  )
}

function StepCard({ number, title, description, tools }: { number: number; title: string; description: string; tools: string[] }) {
  return (
    <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center font-bold text-cyan-700 dark:text-cyan-300">
          {number}
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool, i) => (
              <Badge key={i} variant="outline" className="text-xs">{tool}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeliverableItem({ text, required = false }: { text: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700">
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      <span className="flex-1">{text}</span>
      {required && <Badge className="bg-red-100 text-red-700 border-red-300">Required</Badge>}
    </div>
  )
}
