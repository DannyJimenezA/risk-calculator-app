import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { riskQuerySchema } from "@/lib/validations"
import { SPANISH_LABELS } from "@/lib/risk-utils"
import type { Prisma } from "@prisma/client"

// GET /api/risks/export - Export risks as CSV or JSON
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const format = searchParams.get("format") || "json"
    if (!["csv", "json"].includes(format)) {
      return NextResponse.json({ error: "Formato no válido. Use 'csv' o 'json'" }, { status: 400 })
    }

    // Parse query parameters (excluding pagination for export)
    const { category, owner, band, status, search, sortBy, order } = riskQuerySchema.parse({
      ...queryParams,
      page: "1",
      pageSize: "1000", // Large number for export
    })

    // Build where clause for filtering
    const where: Prisma.RiskWhereInput = {}

    if (category) where.category = { contains: category, mode: "insensitive" }
    if (owner) where.owner = { contains: owner, mode: "insensitive" }
    if (band) where.band = band
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Build orderBy clause
    const orderBy: Prisma.RiskOrderByWithRelationInput = {}
    if (sortBy === "severity") {
      orderBy.severity = order
    } else if (sortBy === "updatedAt") {
      orderBy.updatedAt = order
    }

    const risks = await prisma.risk.findMany({
      where,
      orderBy,
    })

    if (format === "json") {
      return NextResponse.json(risks)
    }

    // CSV format
    const csvHeaders = [
      "ID",
      "Título",
      "Descripción",
      "Categoría",
      "Propietario",
      "Probabilidad",
      "Impacto",
      "Gravedad",
      "Banda",
      "Estado",
      "Creado",
      "Actualizado",
    ]

    const csvRows = risks.map((risk) => [
      risk.id,
      `"${risk.title.replace(/"/g, '""')}"`,
      `"${(risk.description || "").replace(/"/g, '""')}"`,
      `"${risk.category}"`,
      `"${risk.owner}"`,
      risk.likelihood,
      risk.impact,
      risk.severity,
      `"${SPANISH_LABELS.bands[risk.band as keyof typeof SPANISH_LABELS.bands]}"`,
      `"${SPANISH_LABELS.status[risk.status as keyof typeof SPANISH_LABELS.status]}"`,
      risk.createdAt.toISOString(),
      risk.updatedAt.toISOString(),
    ])

    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="riesgos-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting risks:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Parámetros de consulta inválidos", details: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
