"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { computeSeverity, computeBand, getBandColor, getBandColorDark, SPANISH_LABELS } from "@/lib/risk-utils"
import type { RiskBand } from "@/lib/risk-utils"

interface Risk {
  id: string
  title: string
  description?: string
  category: string
  owner: string
  likelihood: number
  impact: number
  severity: number
  band: string
  status: string
  createdAt: string
  updatedAt: string
}

interface RiskMatrixProps {
  onCellClick?: (likelihood: number, impact: number) => void
  selectedCell?: { likelihood: number; impact: number } | null
}

interface MatrixCell {
  likelihood: number
  impact: number
  severity: number
  band: RiskBand
  count: number
  risks: Risk[]
}

export function RiskMatrix({ onCellClick, selectedCell }: RiskMatrixProps) {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRisks()
  }, [])

  const fetchRisks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/risks?pageSize=1000") // Get all risks for matrix
      if (!response.ok) {
        throw new Error("Error al cargar los riesgos")
      }
      const data = await response.json()
      setRisks(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Create matrix data structure
  const createMatrix = (): MatrixCell[][] => {
    const matrix: MatrixCell[][] = []

    // Initialize 5x5 matrix (likelihood 1-5, impact 1-5)
    for (let likelihood = 5; likelihood >= 1; likelihood--) {
      const row: MatrixCell[] = []
      for (let impact = 1; impact <= 5; impact++) {
        const severity = computeSeverity(likelihood, impact)
        const band = computeBand(severity)
        const cellRisks = risks.filter((risk) => risk.likelihood === likelihood && risk.impact === impact)

        row.push({
          likelihood,
          impact,
          severity,
          band,
          count: cellRisks.length,
          risks: cellRisks,
        })
      }
      matrix.push(row)
    }

    return matrix
  }

  const matrix = createMatrix()

  const handleCellClick = (likelihood: number, impact: number) => {
    onCellClick?.(likelihood, impact)
  }

  const getCellClasses = (cell: MatrixCell) => {
    const baseClasses =
      "relative border border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
    const bandClasses = `${getBandColor(cell.band)} ${getBandColorDark(cell.band)}`
    const selectedClasses =
      selectedCell?.likelihood === cell.likelihood && selectedCell?.impact === cell.impact
        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
        : ""

    return `${baseClasses} ${bandClasses} ${selectedClasses}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Cargando matriz...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Matriz de Riesgo (5×5)</CardTitle>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge className={`${getBandColor("Low")} ${getBandColorDark("Low")}`}>{SPANISH_LABELS.bands.Low}</Badge>
            <span>1-4</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getBandColor("Moderate")} ${getBandColorDark("Moderate")}`}>
              {SPANISH_LABELS.bands.Moderate}
            </Badge>
            <span>5-9</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getBandColor("High")} ${getBandColorDark("High")}`}>{SPANISH_LABELS.bands.High}</Badge>
            <span>10-16</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getBandColor("Critical")} ${getBandColorDark("Critical")}`}>
              {SPANISH_LABELS.bands.Critical}
            </Badge>
            <span>17-25</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Matrix Grid */}
{/* Matrix Wrapper (centered) */}
<div className="flex justify-center">
  <div className="grid grid-cols-[auto_auto] gap-3">
    {/* Left axis (Impacto label + numbers) */}
    <div className="flex flex-col items-center justify-between">
      {/* Label Impacto (rotated, outside the numbers) */}
      <div className="flex-1 flex items-center">
        <span className="-rotate-90 text-sm font-semibold text-muted-foreground whitespace-nowrap">
          Impacto
        </span>
      </div>
      {/* Y-axis numbers (5..1) */}
      <div className="grid grid-rows-5 gap-1 h-[336px] justify-center">
        {[5, 4, 3, 2, 1].map((n) => (
          <div
            key={n}
            className="h-16 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {n}
          </div>
        ))}
      </div>
    </div>

    {/* Grid + bottom axis */}
    <div>
      {/* Grid cells */}
      <div className="grid grid-cols-5 gap-1 w-fit">
        {matrix.map((row) =>
          row.map((cell) => (
            <div
              key={`${cell.likelihood}-${cell.impact}`}
              className={getCellClasses(cell)}
              onClick={() => handleCellClick(cell.likelihood, cell.impact)}
            >
              <div className="w-16 h-16 flex flex-col items-center justify-center p-1">
                <div className="text-lg font-bold">{cell.count}</div>
                <div className="text-xs opacity-75">{cell.severity}</div>
              </div>
            </div>
          )),
        )}
      </div>

      {/* Bottom ticks */}
      <div className="grid grid-cols-5 gap-1 w-fit mt-2 mx-auto">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="w-16 text-center text-sm font-medium text-muted-foreground">
            {n}
          </div>
        ))}
      </div>

      {/* Bottom label */}
      <div className="text-center mt-1 text-sm font-semibold text-muted-foreground">
        Probabilidad
      </div>
    </div>
  </div>
</div>


          {/* Matrix Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {risks.filter((r) => r.band === "Low").length}
              </div>
              <div className="text-sm text-muted-foreground">{SPANISH_LABELS.bands.Low}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {risks.filter((r) => r.band === "Moderate").length}
              </div>
              <div className="text-sm text-muted-foreground">{SPANISH_LABELS.bands.Moderate}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {risks.filter((r) => r.band === "High").length}
              </div>
              <div className="text-sm text-muted-foreground">{SPANISH_LABELS.bands.High}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {risks.filter((r) => r.band === "Critical").length}
              </div>
              <div className="text-sm text-muted-foreground">{SPANISH_LABELS.bands.Critical}</div>
            </div>
          </div>

          {/* Selected Cell Info */}
          {selectedCell && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Celda seleccionada: Probabilidad {selectedCell.likelihood}, Impacto {selectedCell.impact}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Gravedad: {computeSeverity(selectedCell.likelihood, selectedCell.impact)} - Banda:{" "}
                {SPANISH_LABELS.bands[computeBand(computeSeverity(selectedCell.likelihood, selectedCell.impact))]}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
