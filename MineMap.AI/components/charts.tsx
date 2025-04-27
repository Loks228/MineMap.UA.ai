"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

// Компонент для відображення кругової діаграми
export function PieChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Імітація завантаження даних
    setTimeout(() => {
      setIsLoading(false)

      // Дані для діаграми
      const data = [35, 25, 20, 15, 5]
      const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"]
      const labels = ["Міни", "Снаряди", "Саморобні пристрої", "Боєприпаси", "Інше"]

      // Малювання діаграми
      const total = data.reduce((sum, value) => sum + value, 0)
      let startAngle = 0

      for (let i = 0; i < data.length; i++) {
        const sliceAngle = (2 * Math.PI * data[i]) / total

        ctx.fillStyle = colors[i]
        ctx.beginPath()
        ctx.moveTo(100, 100)
        ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle)
        ctx.closePath()
        ctx.fill()

        startAngle += sliceAngle
      }

      // Додавання легенди
      ctx.textAlign = "left"
      ctx.font = "12px Arial"

      for (let i = 0; i < labels.length; i++) {
        ctx.fillStyle = colors[i]
        ctx.fillRect(10, 220 + i * 20, 15, 15)

        ctx.fillStyle = "#000"
        ctx.fillText(`${labels[i]} - ${data[i]}%`, 30, 232 + i * 20)
      }
    }, 1000)
  }, [])

  return (
    <div className="relative h-[350px] w-full">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <canvas ref={canvasRef} width="200" height="350" />
      )}
    </div>
  )
}

// Компонент для відображення лінійної діаграми
export function LineChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Імітація завантаження даних
    setTimeout(() => {
      setIsLoading(false)

      // Дані для діаграми
      const data = [
        5, 8, 12, 7, 10, 15, 18, 12, 9, 14, 16, 20, 18, 15, 12, 10, 8, 12, 15, 17, 14, 12, 10, 8, 12, 15, 18, 20, 22,
        25,
      ]
      const width = canvasRef.current.width
      const height = canvasRef.current.height
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // Малювання осей
      ctx.strokeStyle = "#d1d5db"
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.stroke()

      // Малювання графіка
      const maxValue = Math.max(...data)
      const xStep = chartWidth / (data.length - 1)

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < data.length; i++) {
        const x = padding + i * xStep
        const y = height - padding - (data[i] / maxValue) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      // Заповнення області під графіком
      ctx.lineTo(padding + (data.length - 1) * xStep, height - padding)
      ctx.lineTo(padding, height - padding)
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fill()

      // Додавання міток на осі X
      ctx.fillStyle = "#6b7280"
      ctx.textAlign = "center"
      ctx.font = "10px Arial"

      for (let i = 0; i < data.length; i += 5) {
        const x = padding + i * xStep
        ctx.fillText(`${i + 1}`, x, height - padding + 15)
      }

      // Додавання міток на осі Y
      ctx.textAlign = "right"
      const yStep = chartHeight / 5

      for (let i = 0; i <= 5; i++) {
        const y = height - padding - i * yStep
        const value = Math.round((maxValue * i) / 5)
        ctx.fillText(`${value}`, padding - 5, y + 3)
      }
    }, 1000)
  }, [])

  return (
    <div className="relative h-[250px] w-full">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <canvas ref={canvasRef} width="600" height="250" />
      )}
    </div>
  )
}

// Компонент для відображення стовпчикової діаграми
export function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Імітація завантаження даних
    setTimeout(() => {
      setIsLoading(false)

      // Дані для діаграми
      const data = [
        { label: "Харківська", value: 120 },
        { label: "Донецька", value: 180 },
        { label: "Луганська", value: 150 },
        { label: "Запорізька", value: 90 },
        { label: "Херсонська", value: 70 },
        { label: "Миколаївська", value: 50 },
        { label: "Київська", value: 40 },
        { label: "Чернігівська", value: 60 },
        { label: "Сумська", value: 45 },
      ]

      const width = canvasRef.current.width
      const height = canvasRef.current.height
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // Малювання осей
      ctx.strokeStyle = "#d1d5db"
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.stroke()

      // Малювання стовпчиків
      const maxValue = Math.max(...data.map((item) => item.value))
      const barWidth = (chartWidth / data.length) * 0.8
      const barSpacing = (chartWidth / data.length) * 0.2

      for (let i = 0; i < data.length; i++) {
        const x = padding + i * (barWidth + barSpacing) + barSpacing / 2
        const barHeight = (data[i].value / maxValue) * chartHeight
        const y = height - padding - barHeight

        // Градієнт для стовпчиків
        const gradient = ctx.createLinearGradient(x, y, x, height - padding)
        gradient.addColorStop(0, "#3b82f6")
        gradient.addColorStop(1, "#93c5fd")

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)

        // Додавання значень над стовпчиками
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.font = "10px Arial"
        ctx.fillText(`${data[i].value}`, x + barWidth / 2, y - 5)

        // Додавання міток на осі X
        ctx.fillText(data[i].label, x + barWidth / 2, height - padding + 15)
      }

      // Додавання міток на осі Y
      ctx.textAlign = "right"
      const yStep = chartHeight / 5

      for (let i = 0; i <= 5; i++) {
        const y = height - padding - i * yStep
        const value = Math.round((maxValue * i) / 5)
        ctx.fillText(`${value}`, padding - 5, y + 3)
      }
    }, 1000)
  }, [])

  return (
    <div className="relative h-[250px] w-full">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <canvas ref={canvasRef} width="800" height="250" />
      )}
    </div>
  )
}
