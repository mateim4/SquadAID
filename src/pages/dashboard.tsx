import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Manage your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for managing agents.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Workflows</CardTitle>
          <CardDescription>Automate your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for managing workflows.</p>
        </CardContent>
      </Card>
    </div>
  )
}
