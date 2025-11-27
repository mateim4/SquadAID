"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Agent } from "@/types/agent"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Agent>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Agent["status"]
      const variant = {
        online: "default",
        offline: "destructive",
        "in-use": "secondary",
      }[status] as "default" | "destructive" | "secondary"

      return <Badge variant={variant}>{status}</Badge>
    },
  },
]
