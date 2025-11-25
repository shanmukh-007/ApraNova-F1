'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  PlayCircle, 
  FileText,
  Upload,
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

interface ProjectStep {
  id: number;
  title: string;
  order: number;
  is_completed: boolean;
}

interface ProjectCardProps {
  project: {
    id: number;
    number: number;
    title: string;
    description: string;
    progress_percentage: number;
    is_unlocked: boolean;
    steps: ProjectStep[];
    estimated_hours?: number;
  };
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  onStartProject?: () => void;
}

export default function ProjectCardEnhanced({ project, status, onStartProject }: ProjectCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Not Started',
          color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
          icon: <Circle className="w-4 h-4" />,
          action: 'Start Project'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
          icon: <Clock className="w-4 h-4 animate-pulse" />,
          action: 'Continue'
        };
      case 'submitted':
        return {
          label: 'Submitted',
          color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300',
          icon: <Upload className="w-4 h-4" />,
          action: 'View Submission'
        };
      case 'graded':
        return {
          label: 'Completed',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4" />,
          action: 'View Results'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const completedSteps = project.steps.filter(s => s.is_completed).length;
  const totalSteps = project.steps.length;

  return (
    <Card className="border-2 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-sm">
                {project.number}
              </div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
          
          <Badge className={`${statusConfig.color} flex items-center gap-1.5 px-3 py-1`}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {status !== 'not_started' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{project.progress_percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.estimated_hours && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{project.estimated_hours}h estimated</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{totalSteps} steps</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {project.is_unlocked ? (
            <>
              <Button
                onClick={onStartProject}
                className="flex-1"
                variant={status === 'not_started' ? 'default' : 'outline'}
              >
                {status === 'not_started' ? (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {statusConfig.action}
                  </>
                ) : (
                  statusConfig.action
                )}
              </Button>
              
              <Button variant="outline" size="icon" asChild>
                <Link href={`/student/projects/${project.id}`}>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </>
          ) : (
            <Button disabled className="flex-1">
              <Circle className="w-4 h-4 mr-2" />
              Locked - Complete previous project
            </Button>
          )}
        </div>

        {/* Steps Preview (for in-progress projects) */}
        {status === 'in_progress' && project.steps.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-semibold">Current Steps:</div>
            <div className="space-y-1.5">
              {project.steps.slice(0, 3).map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  {step.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={step.is_completed ? 'text-muted-foreground line-through' : ''}>
                    {step.title}
                  </span>
                </div>
              ))}
              {project.steps.length > 3 && (
                <div className="text-xs text-muted-foreground pl-6">
                  +{project.steps.length - 3} more steps
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
