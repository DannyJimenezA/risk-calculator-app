"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircleIcon, InfoIcon } from "lucide-react"
import { createRiskSchema, updateRiskSchema } from "@/lib/validations"
import { computeSeverity, computeBand, getBandColor, getBandColorDark } from "@/lib/risk-utils"
import { SeverityBadge } from "./severity-badge"
import type { CreateRiskInput } from "@/lib/validations"

interface Risk {
  id: string
  title: string
  description?: string
  likelihood: number
  impact: number
  severity: number
  band: string
  createdAt: string
  updatedAt: string
}

interface RiskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  risk?: Risk | null
  onSuccess?: () => void
}

type FormData = CreateRiskInput

export function RiskFormDialog({ open, onOpenChange, risk, onSuccess }: RiskFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!risk

  const form = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateRiskSchema : createRiskSchema),
    defaultValues: {
      title: "",
      description: "",
      likelihood: 1,
      impact: 1,
    },
  })

  const { register, handleSubmit, formState, watch, setValue, reset } = form
  const { errors, isValid } = formState

  // Watch likelihood and impact for live preview
  const watchedLikelihood = watch("likelihood")
  const watchedImpact = watch("impact")

  // Compute live severity and band
  const liveSeverity = computeSeverity(watchedLikelihood || 1, watchedImpact || 1)
  const liveBand = computeBand(liveSeverity)

  // Reset form when dialog opens/closes or risk changes
  useEffect(() => {
    if (open) {
      if (risk) {
        reset({
          title: risk.title,
          description: risk.description || "",
          likelihood: risk.likelihood,
          impact: risk.impact,
        })
      } else {
        reset({
          title: "",
          description: "",
          likelihood: 1,
          impact: 1,
        })
      }
      setError(null)
    }
  }, [open, risk, reset])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      setError(null)

      const url = isEditing ? `/api/risks/${risk.id}` : "/api/risks"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el riesgo")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Riesgo" : "Nuevo Riesgo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique los detalles del riesgo. La gravedad se recalculará automáticamente."
              : "Complete los detalles del nuevo riesgo. La gravedad se calculará automáticamente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md dark:text-red-200 dark:bg-red-950 dark:border-red-800">
              <AlertCircleIcon className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ingrese el título del riesgo"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describa el riesgo en detalle (opcional)"
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <InfoIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-lg font-medium">Evaluación del Riesgo</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="likelihood">
                  Probabilidad (1-5) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedLikelihood?.toString()}
                  onValueChange={(value) => setValue("likelihood", Number.parseInt(value), { shouldValidate: true })}
                >
                  <SelectTrigger className={errors.likelihood ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muy Baja</SelectItem>
                    <SelectItem value="2">2 - Baja</SelectItem>
                    <SelectItem value="3">3 - Media</SelectItem>
                    <SelectItem value="4">4 - Alta</SelectItem>
                    <SelectItem value="5">5 - Muy Alta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.likelihood && <p className="text-sm text-red-500">{errors.likelihood.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">
                  Impacto (1-5) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedImpact?.toString()}
                  onValueChange={(value) => setValue("impact", Number.parseInt(value), { shouldValidate: true })}
                >
                  <SelectTrigger className={errors.impact ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Muy Bajo</SelectItem>
                    <SelectItem value="2">2 - Bajo</SelectItem>
                    <SelectItem value="3">3 - Medio</SelectItem>
                    <SelectItem value="4">4 - Alto</SelectItem>
                    <SelectItem value="5">5 - Muy Alto</SelectItem>
                  </SelectContent>
                </Select>
                {errors.impact && <p className="text-sm text-red-500">{errors.impact.message}</p>}
              </div>
            </div>

            {/* Live Preview */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Gravedad Calculada</div>
                    <div className="text-2xl font-bold">{liveSeverity}</div>
                    <div className="text-xs text-muted-foreground">
                      {watchedLikelihood || 1} × {watchedImpact || 1} = {liveSeverity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Banda de Riesgo</div>
                    <SeverityBadge band={liveBand} className="text-sm" />
                  </div>
                </div>

                {/* Risk Matrix Preview */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Posición en la Matriz</div>
                  <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
                    {Array.from({ length: 25 }, (_, i) => {
                      const row = Math.floor(i / 5)
                      const col = i % 5
                      const likelihood = 5 - row
                      const impact = col + 1
                      const severity = computeSeverity(likelihood, impact)
                      const band = computeBand(severity)
                      const isSelected = likelihood === (watchedLikelihood || 1) && impact === (watchedImpact || 1)

                      return (
                        <div
                          key={i}
                          className={`w-6 h-6 text-xs flex items-center justify-center border ${getBandColor(
                            band,
                          )} ${getBandColorDark(band)} ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                        >
                          {severity}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Riesgo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
