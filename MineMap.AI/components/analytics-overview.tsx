import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "@/components/charts"

export function AnalyticsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Статистика за типами</CardTitle>
          <CardDescription>Розподіл виявлених об'єктів за типами</CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart />
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Динаміка виявлень</CardTitle>
          <CardDescription>Кількість виявлених об'єктів за останні 30 днів</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart />
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>Розподіл за регіонами</CardTitle>
          <CardDescription>Кількість виявлених об'єктів за областями</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart />
        </CardContent>
      </Card>
    </div>
  )
}
