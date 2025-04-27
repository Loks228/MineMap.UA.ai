import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react"

// Імітація даних для прикладу
const alerts = [
  {
    id: 1,
    title: "Виявлено міну-пастку",
    location: "Харківська область, с. Мала Данилівка",
    date: "2023-05-15",
    priority: "high",
    status: "red",
    description: "Місцеві жителі повідомили про підозрілий предмет біля лісосмуги",
  },
  {
    id: 2,
    title: "Підозрілий предмет на узбіччі",
    location: "Київська область, траса E40",
    date: "2023-05-14",
    priority: "medium",
    status: "yellow",
    description: "Водій вантажівки помітив підозрілий предмет на узбіччі дороги",
  },
  {
    id: 3,
    title: "Залишки снаряду",
    location: "Чернігівська область, с. Нові Яриловичі",
    date: "2023-05-13",
    priority: "low",
    status: "green",
    description: "Виявлено залишки снаряду на сільськогосподарському полі",
  },
  {
    id: 4,
    title: "Міна протипіхотна",
    location: "Донецька область, м. Краматорськ",
    date: "2023-05-12",
    priority: "high",
    status: "red",
    description: "На території колишнього заводу виявлено протипіхотну міну",
  },
  {
    id: 5,
    title: "Нерозпізнаний вибуховий пристрій",
    location: "Запорізька область, с. Велика Білозерка",
    date: "2023-05-11",
    priority: "medium",
    status: "yellow",
    description: "Місцеві жителі повідомили про підозрілий предмет у лісі",
  },
  {
    id: 6,
    title: "Архівний запис: Розміновано",
    location: "Сумська область, м. Конотоп",
    date: "2023-04-20",
    priority: "low",
    status: "gray",
    description: "Територію повністю розміновано та перевірено",
  },
  {
    id: 7,
    title: "Секретна інформація",
    location: "Локація засекречена",
    date: "2023-05-10",
    priority: "high",
    status: "purple",
    description: "Інформація доступна тільки для авторизованих користувачів",
  },
]

// Функція для визначення кольору статусу
function getStatusColor(status: string) {
  switch (status) {
    case "red":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "yellow":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "green":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "gray":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    case "purple":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
  }
}

// Функція для визначення тексту статусу
function getStatusText(status: string) {
  switch (status) {
    case "red":
      return "Замінована"
    case "yellow":
      return "Непідтверджена"
    case "green":
      return "Розмінована"
    case "gray":
      return "Архів"
    case "purple":
      return "Секретна"
    default:
      return "Невідомо"
  }
}

// Функція для визначення іконки пріоритету
function getPriorityIcon(priority: string) {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "medium":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "low":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    default:
      return null
  }
}

export function AlertList() {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-4 pr-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{alert.title}</h3>
                <Badge variant="outline" className={getStatusColor(alert.status)}>
                  {getStatusText(alert.status)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{new Date(alert.date).toLocaleDateString("uk-UA")}</span>
                </div>
                <p className="mt-2">{alert.description}</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-1">Пріоритет:</span>
                {getPriorityIcon(alert.priority)}
              </div>
              <Button size="sm">Деталі</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}
