"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RiskRegisterTable } from "@/components/risk-register-table"
import { RiskFormDialog } from "@/components/risk-form-dialog"
import { RiskDetailSheet } from "@/components/risk-detail-sheet"
import { ArrowLeftIcon, PlusIcon, HomeIcon } from "lucide-react"

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

export default function RiskRegisterPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)

  const handleCreateRisk = () => {
    setEditingRisk(null)
    setShowCreateDialog(true)
  }

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk)
    setShowCreateDialog(true)
  }

  const handleDeleteRisk = (risk: Risk) => {
    // This will be handled by the table component
  }

  const handleFormSuccess = () => {
    setShowCreateDialog(false)
    setEditingRisk(null)
    // The table will refresh automatically
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
                <Link href="/">
                  <ArrowLeftIcon className="w-4 h-4" />
                  Volver al Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-balance">Registro de Riesgos</h1>
                <p className="text-muted-foreground">Gestione todos los riesgos del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="gap-2 bg-transparent">
                <Link href="/">
                  <HomeIcon className="w-4 h-4" />
                  Dashboard
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
        <RiskRegisterTable
          onCreateRisk={handleCreateRisk}
          onEditRisk={handleEditRisk}
          onDeleteRisk={handleDeleteRisk}
        />
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
