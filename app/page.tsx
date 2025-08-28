"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskMatrix } from "@/components/risk-matrix"
import { RiskFormDialog } from "@/components/risk-form-dialog"
import { RiskDetailSheet } from "@/components/risk-detail-sheet"
import {
  AlertTriangleIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ActivityIcon,
  PlusIcon,
  TableIcon,
  BarChart3Icon,
} from "lucide-react"

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

export default function DashboardPage() {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)

  const handleMatrixCellClick = (likelihood: number, impact: number) => {
    setSelectedCell({ likelihood, impact })
  }

  const handleCreateRisk = () => {
    setEditingRisk(null)
    setShowCreateDialog(true)
  }

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk)
    setShowCreateDialog(true)
  }

  const handleDeleteRisk = (risk: Risk) => {
    // This will be handled by the individual components
  }

  const handleFormSuccess = () => {
    // Refresh data - this will be handled by the components
    setShowCreateDialog(false)
    setEditingRisk(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-balance">Sistema de Gestión de Riesgos</h1>
              <p className="text-muted-foreground">Matriz de riesgo y panel de control</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="gap-2 bg-transparent">
                <Link href="/riesgos">
                  <TableIcon className="w-4 h-4" />
                  Registro
                </Link>
              </Button>
              <Button onClick={handleCreateRisk} className="gap-2">
                <PlusIcon className="w-4 h-4" />
                Nuevo Riesgo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Riesgos</CardTitle>
                <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Todos los estados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgos Críticos</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">--</div>
                <p className="text-xs text-muted-foreground">Gravedad 17-25</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgos Altos</CardTitle>
                <ActivityIcon className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">--</div>
                <p className="text-xs text-muted-foreground">Gravedad 10-16</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgos Abiertos</CardTitle>
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">--</div>
                <p className="text-xs text-muted-foreground">Estado abierto</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Matrix */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RiskMatrix onCellClick={handleMatrixCellClick} selectedCell={selectedCell} />
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleCreateRisk} className="w-full gap-2">
                    <PlusIcon className="w-4 h-4" />
                    Crear Nuevo Riesgo
                  </Button>
                  <Button variant="outline" asChild className="w-full gap-2 bg-transparent">
                    <Link href="/riesgos">
                      <TableIcon className="w-4 h-4" />
                      Ver Registro Completo
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 bg-transparent" disabled>
                    <BarChart3Icon className="w-4 h-4" />
                    Exportar Reporte
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cómo usar la matriz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Haga clic en cualquier celda de la matriz para filtrar los riesgos por probabilidad e impacto</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>Los números en cada celda muestran la cantidad de riesgos en esa posición</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p>
                      Los colores indican la banda de riesgo: verde (bajo), amarillo (moderado), naranja (alto), rojo
                      (crítico)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedCell && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-900 dark:text-blue-100">Filtro Activo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Probabilidad:</strong> {selectedCell.likelihood}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Impacto:</strong> {selectedCell.impact}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCell(null)}
                      className="w-full mt-2 bg-transparent"
                    >
                      Limpiar Filtro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>La actividad reciente se mostrará aquí una vez que comience a gestionar riesgos.</p>
                <Button onClick={handleCreateRisk} variant="outline" className="mt-4 gap-2 bg-transparent">
                  <PlusIcon className="w-4 h-4" />
                  Crear su primer riesgo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialogs */}
      <RiskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        risk={editingRisk}
        onSuccess={handleFormSuccess}
      />

      <RiskDetailSheet
        open={showDetailSheet}
        onOpenChange={setShowDetailSheet}
        riskId={selectedRiskId}
        onEdit={handleEditRisk}
        onDelete={handleDeleteRisk}
      />
    </div>
  )
}
