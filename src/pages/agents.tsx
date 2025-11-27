import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { agents } from "@/data/agents"
import { columns } from "./agents/columns"

export function AgentsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Manage your agents</CardDescription>
        </div>
        <Button>Create Agent</Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={agents} />
      </CardContent>
    </Card>
  )
}
