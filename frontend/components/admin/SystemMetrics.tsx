"use client";

import type React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Database, Cloud, Activity } from "lucide-react";
import type { SystemMetric } from "@/types";

interface SystemMetricsProps {
  metrics: SystemMetric[];
  lastChecked?: string;
}

export function SystemMetrics({ metrics, lastChecked }: SystemMetricsProps) {
  const getStatusColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "healthy":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getIcon = (name: string) => {
    if (name.toLowerCase().includes("database")) return Database;
    if (name.toLowerCase().includes("cloud") || name.toLowerCase().includes("server")) return Cloud;
    return Activity;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Metrics</CardTitle>
        <CardDescription>
          Monitor system health and performance
          {lastChecked && <span className="ml-2">• Last checked: {lastChecked}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = getIcon(metric.name);
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {metric.value}
                      {metric.unit}
                    </span>
                    <Badge variant={getStatusColor(metric.status)}>{metric.status}</Badge>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
