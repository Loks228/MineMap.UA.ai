import { Suspense } from "react"
import { MapPin, Bell, Filter, BarChart3, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertList } from "@/components/alert-list"
import { MapView } from "@/components/map-view"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { StatusLegend } from "@/components/status-legend"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h1 className="text-lg font-semibold">Система інформування про вибухонебезпечні предмети</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Сповіщення</span>
            </Button>
            <Button variant="outline" size="sm">
              Особистий кабінет
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col md:flex-row">
        <div className="w-full md:w-1/3 border-r p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Повідомлення</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фільтр
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Сортувати
              </Button>
            </div>
          </div>
          <StatusLegend />
          <Separator className="my-4" />
          <Suspense fallback={<div>Завантаження повідомлень...</div>}>
            <AlertList />
          </Suspense>
        </div>
        <div className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="map">
            <TabsList className="mb-4">
              <TabsTrigger value="map">
                <MapPin className="h-4 w-4 mr-2" />
                Карта
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Аналітика
              </TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="h-[calc(100vh-12rem)]">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Інтерактивна карта</CardTitle>
                  <CardDescription>Відображення всіх точок та оптимальних маршрутів</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Suspense
                    fallback={
                      <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                        Завантаження карти...
                      </div>
                    }
                  >
                    <MapView />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Suspense fallback={<div>Завантаження аналітики...</div>}>
                <AnalyticsOverview />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
