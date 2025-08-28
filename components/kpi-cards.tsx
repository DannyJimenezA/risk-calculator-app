"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangleIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ActivityIcon,
  TrendingDownIcon,
  ClockIcon,
} from "lucide-react"

interface KPIData {
  total: number
  critical: number
  high: number
  moderate: number
  low: number
  open: number
  monitoring: number
  closed: number
}

export function KPICards() {
  const [data, setData] = useState<KPIData>({
    total: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    open: 0,
    monitoring: 0,
    closed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKPIData()
  }, [])

  const fetchKPIData = async () => {
    try {
      const response = await fetch("/api/risks?pageSize=1000")
      if (response.ok) {
        const result = await response.json()
        const risks = result.items

        const kpiData: KPIData = {
          total: risks.length,
          critical: risks.filter((r: any) => r.band === "Critical").length,
          high: risks.filter((r: any) => r.band === "High").length,
          moderate: risks.filter((r: any) => r.band === "Moderate").length,
          low: risks.filter((r: any) => r.band === "Low").length,
          open: risks.filter((r: any) => r.status === "Open").length,
          monitoring: risks.filter((r: any) => r.status === "Monitoring").length,
          closed: risks.filter((r: any) => r.status === "Closed").length,
        }

        setData(kpiData)
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error)
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      title: "Total de Riesgos",
      value: data.total,
      description: "Todos los estados",
      icon: AlertTriangleIcon,
      color: "text-blue-600",
    },
    {
      title: "Riesgos Críticos",
      value: data.critical,
      description: "Gravedad 17-25",
      icon: TrendingUpIcon,
      color: "text-red-600",
    },
    {
      title: "Riesgos Altos",
      value: data.high,
      description: "Gravedad 10-16",
      icon: ActivityIcon,
      color: "text-orange-600",
    },
    {
      title: "Riesgos Abiertos",
      value: data.open,
      description: "Estado abierto",
      icon: ShieldCheckIcon,
      color: "text-blue-600",
    },
    {
      title: "En Monitoreo",
      value: data.monitoring,
      description: "Estado monitoreando",
      icon: ClockIcon,
      color: "text-yellow-600",
    },
    {
      title: "Riesgos Cerrados",
      value: data.closed,
      description: "Estado cerrado",
      icon: TrendingDownIcon,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color.replace("text-", "text-").replace("-600", "-500")}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{loading ? "--" : card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
