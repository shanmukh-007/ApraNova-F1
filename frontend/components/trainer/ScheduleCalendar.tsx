"use client";

import type React from "react";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Schedule } from "@/types";

interface ScheduleCalendarProps {
  schedules: Schedule[];
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (scheduleId: string) => void;
  onCreate?: () => void;
}

export function ScheduleCalendar({ schedules, onEdit, onDelete, onCreate }: ScheduleCalendarProps) {
  const getTypeColor = (type: Schedule["type"]) => {
    switch (type) {
      case "lecture":
        return "default";
      case "lab":
        return "secondary";
      case "assessment":
        return "destructive";
      case "meeting":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Manage your training schedule</CardDescription>
          </div>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{schedule.title}</h4>
                  <Badge variant={getTypeColor(schedule.type)}>{schedule.type}</Badge>
                  <Badge
                    variant={
                      schedule.status === "scheduled"
                        ? "outline"
                        : schedule.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {schedule.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {schedule.date} at {schedule.time}
                  </div>
                  <span>Duration: {schedule.duration} min</span>
                  <span>Batch: {schedule.batch}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(schedule)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(schedule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
