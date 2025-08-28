import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRiskSchema, riskQuerySchema } from "@/lib/validations";
import { computeSeverity, computeBand } from "@/lib/risk-utils";

// ----- Local helpers / types -----
type FindManyArg = NonNullable<Parameters<typeof prisma.risk.findMany>[0]>;
type RiskWhereInput = NonNullable<FindManyArg["where"]>;
type RiskOrderByWithRelationInput = NonNullable<FindManyArg["orderBy"]>;

function isZodError(err: unknown): err is { issues?: Array<{ path?: unknown[]; code?: string }>; message?: string } {
  return !!err && typeof err === "object" && "issues" in (err as any);
}

// ----- GET /api/risks -----
export async function GET(request: NextRequest) {
  try {
    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());

    // Parse; if only error is pageSize > 100, auto-clamp and re-parse
    const parsedAttempt = riskQuerySchema.safeParse(raw);
    const parsed = parsedAttempt.success
      ? parsedAttempt.data
      : (() => {
          const issues = parsedAttempt.error?.issues ?? [];
          const onlyPageSizeTooBig =
            issues.length > 0 &&
            issues.every((i) => Array.isArray(i.path) && i.path[0] === "pageSize" && i.code === "too_big");
          if (!onlyPageSizeTooBig) throw parsedAttempt.error;
          const patched = { ...raw, pageSize: "100" };
          const reparsed = riskQuerySchema.parse(patched);
          return reparsed;
        })();

    const {
      band,
      search = "",
      sortBy = "severity",
      order = "desc",
      page = 1,
      pageSize = 20,
    }: {
      band?: "Low" | "Moderate" | "High" | "Critical";
      search?: string;
      sortBy?: "severity" | "updatedAt";
      order?: "asc" | "desc";
      page?: number;
      pageSize?: number;
    } = parsed as any;

    // Final safety clamp (1..100)
    const safePage = Math.max(1, page || 1);
    const safePageSize = Math.min(Math.max(pageSize || 20, 1), 100);

    // Build where clause
    const where: RiskWhereInput = {};
    if (band) (where as any).band = band;
    if (search) {
      (where as any).OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const orderBy: RiskOrderByWithRelationInput =
      sortBy === "updatedAt" ? { updatedAt: order } : { severity: order };

    // Query
    const [items, total] = await Promise.all([
      prisma.risk.findMany({
        where,
        orderBy,
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      prisma.risk.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    });
  } catch (error) {
    console.error("Error fetching risks:", error);
    if (isZodError(error)) {
      return NextResponse.json(
        { error: "Parámetros de consulta inválidos", details: (error as any).issues ?? (error as any).message },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ----- POST /api/risks -----
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido (JSON requerido)" }, { status: 400 });
    }

    const parsed = createRiskSchema.parse(body);

    const {
      title,
      description = null,
      likelihood,
      impact,
    } = parsed;

    const severity = computeSeverity(likelihood, impact);
    const band = computeBand(severity);

    const risk = await prisma.risk.create({
      data: {
        title,
        description,
        likelihood,
        impact,
        severity,
        band,
      },
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error("Error creating risk:", error);

    if (error && typeof error === "object" && "issues" in (error as any)) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos", details: (error as any).issues ?? (error as any).message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

