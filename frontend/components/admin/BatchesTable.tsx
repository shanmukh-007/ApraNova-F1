"use client";

import type React from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BatchData } from "@/types";

interface BatchesTableProps {
  batches: BatchData[];
  onEdit?: (batch: BatchData) => void;
  onDelete?: (batchId: string) => void;
  onCreate?: () => void;
  onAssignStudents?: (batch: BatchData) => void;
}

export function BatchesTable({ batches, onEdit, onDelete, onCreate, onAssignStudents }: BatchesTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Batches Management</CardTitle>
            <CardDescription>Manage training batches and assignments</CardDescription>
          </div>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{batch.trainer || "Not assigned"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {batch.students}
                    </div>
                  </TableCell>
                  <TableCell>{batch.startDate}</TableCell>
                  <TableCell>{batch.endDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        batch.status === "active"
                          ? "default"
                          : batch.status === "completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onAssignStudents && (
                        <Button variant="ghost" size="icon" onClick={() => onAssignStudents(batch)}>
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(batch)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(batch.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
