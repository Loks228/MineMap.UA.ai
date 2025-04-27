import { Badge } from "@/components/ui/badge"

export function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
        Секретна
      </Badge>
      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
        Замінована
      </Badge>
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Непідтверджена
      </Badge>
      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        Архів
      </Badge>
      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
        Розмінована
      </Badge>
    </div>
  )
}
