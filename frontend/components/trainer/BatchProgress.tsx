"use client";

import type React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, CheckCircle, Clock } from "lucide-react";
import type { BatchProgress as BatchProgressType } from "@/types";

interface BatchProgressProps {
  batches: BatchProgressType[];
}

export function BatchProgress({ batches }: BatchProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Progress</CardTitle>
        <CardDescription>Overview of all batch performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {batches.map((batch) => (
            <div key={batch.batchId} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{batch.batchName}</h4>
                <span className="text-sm text-muted-foreground">{batch.averageProgress}% Complete</span>
              </div>
              <Progress value={batch.averageProgress} className="h-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{batch.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{batch.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{batch.pendingSubmissions}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{batch.averageProgress}%</p>
                    <p className="text-xs text-muted-foreground">Avg Progress</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
