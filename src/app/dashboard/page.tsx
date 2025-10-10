import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Documents</CardTitle>
        </CardHeader>
        <CardContent>124</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>8 Active Users</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Storage Used</CardTitle>
        </CardHeader>
        <CardContent>1.2 GB</CardContent>
      </Card>
    </div>
  );
}
