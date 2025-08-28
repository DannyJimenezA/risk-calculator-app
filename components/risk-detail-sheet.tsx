"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, UserIcon, TagIcon, AlertTriangleIcon, EditIcon, TrashIcon } from "lucide-react"
import { SeverityBadge } from "./severity-badge"
import { SPANISH_LABELS } from "@/lib/risk-utils"
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

interface RiskDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  riskId?: string | null
  onEdit?: (risk: Risk) => void
  onDelete?: (risk: Risk) => void
}

export function RiskDetailSheet({ open, onOpenChange, riskId, onEdit, onDelete }: RiskDetailSheetProps) {
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && riskId) {
      fetchRisk()
    }
  }, [open, riskId])

  const fetchRisk = async () => {
    if (!riskId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/risks/${riskId}`)
      if (!response.ok) {
        throw new Error("Error al cargar el riesgo")
      }

      const data = await response.json()
      setRisk(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleEdit = () => {
    if (risk) {
      onEdit?.(risk)
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (risk) {
      onDelete?.(risk)
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle del Riesgo</SheetTitle>
          <SheetDescription>Información completa del riesgo seleccionado</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Cargando...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error: {error}</div>
          </div>
        ) : risk ? (
          <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-balance">{risk.title}</h2>
              {risk.description && <p className="text-muted-foreground text-pretty">{risk.description}</p>}
            </div>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangleIcon className="w-4 h-4" />
                  Evaluación del Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{risk.likelihood}</div>
                    <div className="text-sm text-muted-foreground">Probabilidad</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{risk.impact}</div>
                    <div className="text-sm text-muted-foreground">Impacto</div>
                  </div>
                </div>

                <Separator />

                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{risk.severity}</div>
                  <div className="text-sm text-muted-foreground">
                    Gravedad ({risk.likelihood} × {risk.impact})
                  </div>
                  <SeverityBadge band={risk.band as RiskBand} />
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Categoría</div>
                    <Badge variant="outline">{risk.category}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Propietario</div>
                    <div className="font-medium">{risk.owner}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <Badge
                      variant={
                        risk.status === "Open" ? "destructive" : risk.status === "Monitoring" ? "default" : "secondary"
                      }
                    >
                      {SPANISH_LABELS.status[risk.status as keyof typeof SPANISH_LABELS.status]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Creado</div>
                    <div className="text-sm">{formatDate(risk.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Última actualización</div>
                    <div className="text-sm">{formatDate(risk.updatedAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1 gap-2">
                <EditIcon className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="gap-2 text-destructive hover:text-destructive bg-transparent"
              >
                <TrashIcon className="w-4 h-4" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
