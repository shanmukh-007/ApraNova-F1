'use client';

import ToolCard from './tool-card';
import { Database, BarChart3, Workflow, Code, Cloud, Zap, Container } from 'lucide-react';

interface ToolCardsSectionProps {
  track: 'DP' | 'FSD' | null;
  currentProjectNumber?: number; // Current project (1, 2, or 3)
  supersetUrl?: string;
  prefectUrl?: string;
  jupyterUrl?: string;
  workspaceUrl?: string;
  dbCredentials?: {
    host: string;
    port: string;
    database: string;
    schema: string;
    username: string;
    password: string;
    connectionString: string;
  };
}

export default function ToolCardsSection({
  track,
  currentProjectNumber = 1,
  supersetUrl,
  prefectUrl,
  jupyterUrl,
  workspaceUrl,
  dbCredentials
}: ToolCardsSectionProps) {
  if (!track) return null;

  // Get project title and workflow
  const getProjectInfo = () => {
    if (track === 'DP') {
      switch (currentProjectNumber) {
        case 1:
          return {
            title: 'Project 1: Business Analytics Dashboard',
            workflow: 'Clean CSV data (Jupyter) → Load to PostgreSQL → Build dashboard (Superset) → Write insights report',
            deliverables: 'Superset Dashboard URL • SQL queries • PDF Insights Report'
          };
        case 2:
          return {
            title: 'Project 2: Automated ETL Pipeline',
            workflow: 'Pull API data (Requests) → Transform (Pandas) → Load to PostgreSQL → Orchestrate (Prefect) → Email reports',
            deliverables: 'Python ETL script • Prefect workflow DAG • PostgreSQL table • Email report screenshot'
          };
        case 3:
          return {
            title: 'Project 3: End-to-End Analytics Solution (Capstone)',
            workflow: 'Combine sources (API + PostgreSQL) → Load to BigQuery/Redshift → Optimized SQL → Cloud dashboard → Case study',
            deliverables: 'Cloud-hosted dashboard • SQL scripts • PDF Case Study Report'
          };
        default:
          return { title: 'Data Professional Track', workflow: '', deliverables: '' };
      }
    } else {
      switch (currentProjectNumber) {
        case 1:
          return {
            title: 'Project 1: Responsive Portfolio Website',
            workflow: 'Build with React + Tailwind CSS → Deploy via Netlify CLI → Add custom domain',
            deliverables: 'Live Netlify link • GitHub repo with React + Tailwind code'
          };
        case 2:
          return {
            title: 'Project 2: E-Commerce Platform',
            workflow: 'React frontend (catalog + cart) → Django/Spring Boot API → PostgreSQL → Stripe checkout → Auth + tests',
            deliverables: 'Live e-commerce site • GitHub repo • Stripe sandbox integration proof'
          };
        case 3:
          return {
            title: 'Project 3: Social Dashboard + DevOps (Capstone)',
            workflow: 'React frontend → Django/Spring Boot + WebSockets → Redis → Docker → Terraform → CI/CD → AWS/GCP deploy',
            deliverables: 'Cloud-deployed app URL • GitHub repo with Docker + Terraform + CI/CD • Demo video'
          };
        default:
          return { title: 'Full-Stack Developer Track', workflow: '', deliverables: '' };
      }
    }
  };

  const projectInfo = getProjectInfo();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Data Professional Tools - Project-based */}
        {track === 'DP' && (
          <>
            {/* Project 1: Business Analytics Dashboard */}
            {currentProjectNumber === 1 && (
              <>
                {/* Tools shown on project detail page */}
              </>
            )}

            {/* Project 2: Automated ETL Pipeline */}
            {currentProjectNumber === 2 && (
              <>
                {/* Tools shown on project detail page */}
              </>
            )}

            {/* Project 3: End-to-End Analytics Solution */}
            {currentProjectNumber === 3 && (
              <>
                {/* Tools shown on project detail page */}
              </>
            )}
          </>
        )}

        {/* Full-Stack Developer Tools - Project-based */}
        {track === 'FSD' && (
          <>
            {/* Project 1: Responsive Portfolio Website */}
            {currentProjectNumber === 1 && (
              <>
                <ToolCard
                  icon={<Code className="w-6 h-6" />}
                  title="VS Code Server"
                  description="Build responsive portfolio with React & Tailwind"
                  url={workspaceUrl || 'http://localhost:8080'}
                  status={workspaceUrl ? 'active' : 'provisioning'}
                  color="blue"
                />

                <ToolCard
                  icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm4.9 9.9l-1.4 6.3c-.1.4-.4.5-.8.3l-2.2-1.6-1.1 1c-.1.1-.2.2-.4.2l.1-2.3 4.2-3.8c.2-.2 0-.3-.2-.1l-5.2 3.3-2.2-.7c-.5-.1-.5-.5.1-.7l8.6-3.3c.4-.2.8.1.6.7z"/>
                    </svg>
                  }
                  title="Netlify CLI"
                  description="Deploy portfolio website (free hosting)"
                  url="https://app.netlify.com"
                  status="active"
                  color="teal"
                />
              </>
            )}

            {/* Project 2: E-Commerce Platform */}
            {currentProjectNumber === 2 && (
              <>
                <ToolCard
                  icon={<Code className="w-6 h-6" />}
                  title="VS Code Server"
                  description="Build e-commerce platform with React"
                  url={workspaceUrl || 'http://localhost:8080'}
                  status={workspaceUrl ? 'active' : 'provisioning'}
                  color="blue"
                />

                {dbCredentials && (
                  <ToolCard
                    icon={<Database className="w-6 h-6" />}
                    title="PostgreSQL"
                    description="Store products, users & orders"
                    credentials={dbCredentials}
                    status="active"
                    color="blue"
                  />
                )}

                <ToolCard
                  icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                    </svg>
                  }
                  title="Stripe Sandbox"
                  description="Integrate payment checkout (test mode)"
                  url="https://dashboard.stripe.com/test"
                  status="active"
                  color="purple"
                />
              </>
            )}

            {/* Project 3: Social Dashboard + DevOps */}
            {currentProjectNumber === 3 && (
              <>
                <ToolCard
                  icon={<Code className="w-6 h-6" />}
                  title="VS Code Server"
                  description="Build social dashboard with real-time features"
                  url={workspaceUrl || 'http://localhost:8080'}
                  status={workspaceUrl ? 'active' : 'provisioning'}
                  color="blue"
                />

                {dbCredentials && (
                  <ToolCard
                    icon={<Database className="w-6 h-6" />}
                    title="PostgreSQL"
                    description="Store posts, comments & user data"
                    credentials={dbCredentials}
                    status="active"
                    color="blue"
                  />
                )}

                <ToolCard
                  icon={<Zap className="w-6 h-6" />}
                  title="Redis"
                  description="Real-time notifications & caching"
                  url="redis://localhost:6379"
                  status="active"
                  color="red"
                />

                <ToolCard
                  icon={<Container className="w-6 h-6" />}
                  title="Docker"
                  description="Containerize your application"
                  url="https://hub.docker.com"
                  status="active"
                  color="cyan"
                />

                <ToolCard
                  icon={<Cloud className="w-6 h-6" />}
                  title="AWS Console"
                  description="Deploy to EC2/RDS (free tier)"
                  url="https://console.aws.amazon.com"
                  status="active"
                  color="orange"
                />
              </>
            )}
          </>
        )}


      </div>
    </div>
  );
}
