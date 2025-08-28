import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateRiskSchema } from "@/lib/validations"
import { computeSeverity, computeBand } from "@/lib/risk-utils"

// GET /api/risks/:id - Get a specific risk
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const risk = await prisma.risk.findUnique({
      where: { id: params.id },
    })

    if (!risk) {
      return NextResponse.json({ error: "Riesgo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(risk)
  } catch (error) {
    console.error("Error fetching risk:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH /api/risks/:id - Update a risk
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = updateRiskSchema.parse(body)

    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id: params.id },
    })

    if (!existingRisk) {
      return NextResponse.json({ error: "Riesgo no encontrado" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...validatedData }

    // Recompute severity and band if likelihood or impact changed
    if (validatedData.likelihood !== undefined || validatedData.impact !== undefined) {
      const likelihood = validatedData.likelihood ?? existingRisk.likelihood
      const impact = validatedData.impact ?? existingRisk.impact

      updateData.severity = computeSeverity(likelihood, impact)
      updateData.band = computeBand(updateData.severity)
    }

    const updatedRisk = await prisma.risk.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedRisk)
  } catch (error) {
    console.error("Error updating risk:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos de entrada inválidos", details: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/risks/:id - Delete a risk
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id: params.id },
    })

    if (!existingRisk) {
      return NextResponse.json({ error: "Riesgo no encontrado" }, { status: 404 })
    }

    await prisma.risk.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting risk:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
