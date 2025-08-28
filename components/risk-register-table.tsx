"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronUpIcon, ChevronDownIcon, MoreHorizontalIcon, SearchIcon, FilterIcon, PlusIcon } from "lucide-react"
import { SeverityBadge } from "./severity-badge"
import type { RiskBand } from "@/lib/risk-utils"

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

interface RiskRegisterTableProps {
  onCreateRisk?: () => void
  onEditRisk?: (risk: Risk) => void
  onDeleteRisk?: (risk: Risk) => void
  matrixFilter?: { likelihood: number; impact: number } | null
}

interface Filters {
  band: string
  search: string
}

interface SortConfig {
  sortBy: "severity" | "updatedAt"
  order: "asc" | "desc"
}

export function RiskRegisterTable({ onCreateRisk, onEditRisk, onDeleteRisk, matrixFilter }: RiskRegisterTableProps) {
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    band: "",
    search: "",
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    sortBy: "severity",
    order: "desc",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchRisks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
      })

      // Add filters
      if (filters.band) params.append("band", filters.band)
      if (filters.search) params.append("search", filters.search)

      // Add matrix filter if provided
      if (matrixFilter) {
        // For matrix filter, we need to fetch all risks and filter client-side
        // since the API doesn't support likelihood/impact filtering directly
        params.delete("page")
        params.delete("pageSize")
        params.append("pageSize", "1000")
      }

      const response = await fetch(`/api/risks?${params}`)
      if (!response.ok) {
        throw new Error("Error al cargar los riesgos")
      }

      const data = await response.json()
      let filteredRisks = data.items

      // Apply matrix filter client-side
      if (matrixFilter) {
        filteredRisks = data.items.filter(
          (risk: Risk) => risk.likelihood === matrixFilter.likelihood && risk.impact === matrixFilter.impact,
        )
        // Update pagination for filtered results
        setPagination((prev) => ({
          ...prev,
          total: filteredRisks.length,
          totalPages: Math.ceil(filteredRisks.length / prev.pageSize),
        }))
        // Apply client-side pagination
        const startIndex = (pagination.page - 1) * pagination.pageSize
        filteredRisks = filteredRisks.slice(startIndex, startIndex + pagination.pageSize)
      } else {
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }))
      }

      setRisks(filteredRisks)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [filters, sortConfig, pagination.page, pagination.pageSize, matrixFilter])

  useEffect(() => {
    fetchRisks()
  }, [fetchRisks])

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [filters, matrixFilter])

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSort = (column: "severity" | "updatedAt") => {
    setSortConfig((prev) => ({
      sortBy: column,
      order: prev.sortBy === column && prev.order === "desc" ? "asc" : "desc",
    }))
  }

  const clearFilters = () => {
    setFilters({
      band: "",
      search: "",
    })
  }

  const handleDelete = async (risk: Risk) => {
    if (!confirm(`¿Está seguro de que desea eliminar el riesgo "${risk.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/risks/${risk.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el riesgo")
      }

      // Refresh the table
      fetchRisks()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el riesgo")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSortIcon = (column: "severity" | "updatedAt") => {
    if (sortConfig.sortBy !== column) return null
    return sortConfig.order === "desc" ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "") || matrixFilter

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registro de Riesgos</CardTitle>
          <Button onClick={onCreateRisk} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Nuevo Riesgo
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={filters.band} onValueChange={(value) => handleFilterChange("band", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Banda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Low">Bajo</SelectItem>
                <SelectItem value="Moderate">Moderado</SelectItem>
                <SelectItem value="High">Alto</SelectItem>
                <SelectItem value="Critical">Crítico</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2 bg-transparent">
                <FilterIcon className="w-4 h-4" />
                Limpiar Filtros
              </Button>
            )}
          </div>

          {matrixFilter && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FilterIcon className="w-4 h-4" />
              Filtrado por matriz: Probabilidad {matrixFilter.likelihood}, Impacto {matrixFilter.impact}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Cargando riesgos...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error: {error}</div>
          </div>
        ) : risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <div className="text-lg font-medium">No se encontraron riesgos</div>
            <div className="text-sm">
              {hasActiveFilters ? "Intente ajustar los filtros" : "Comience creando un nuevo riesgo"}
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="text-center">Prob.</TableHead>
                    <TableHead className="text-center">Imp.</TableHead>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("severity")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Gravedad
                        {getSortIcon("severity")}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Banda</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("updatedAt")}>
                      <div className="flex items-center gap-1">
                        Actualizado
                        {getSortIcon("updatedAt")}
                      </div>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => (
                    <TableRow key={risk.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{risk.title}</div>
                          {risk.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{risk.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">{risk.likelihood}</TableCell>
                      <TableCell className="text-center font-mono">{risk.impact}</TableCell>
                      <TableCell className="text-center font-mono font-bold">{risk.severity}</TableCell>
                      <TableCell className="text-center">
                        <SeverityBadge band={risk.band as RiskBand} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(risk.updatedAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontalIcon className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditRisk?.(risk)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(risk)} className="text-destructive">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} riesgos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
