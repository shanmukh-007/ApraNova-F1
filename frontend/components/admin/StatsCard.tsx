import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  description?: string;
  status?: "healthy" | "warning" | "error";
}

export function StatsCard({ title, value, delta, icon: Icon, description, status }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta && <p className="text-xs text-muted-foreground">{delta}</p>}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {status && (
          <Badge
            variant={status === "healthy" ? "default" : status === "warning" ? "secondary" : "destructive"}
            className="mt-2"
          >
            {status}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
