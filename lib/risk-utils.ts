export type RiskBand = "Low" | "Moderate" | "High" | "Critical"

export function computeSeverity(likelihood: number, impact: number): number {
  return likelihood * impact
}

export function computeBand(severity: number): RiskBand {
  if (severity <= 4) return "Low"
  if (severity <= 9) return "Moderate"
  if (severity <= 16) return "High"
  return "Critical"
}

export function getBandColor(band: RiskBand): string {
  switch (band) {
    case "Low":
      return "bg-green-100 text-green-800 border-green-200"
    case "Moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function getBandColorDark(band: RiskBand): string {
  switch (band) {
    case "Low":
      return "dark:bg-green-900 dark:text-green-100 dark:border-green-800"
    case "Moderate":
      return "dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800"
    case "High":
      return "dark:bg-orange-900 dark:text-orange-100 dark:border-orange-800"
    case "Critical":
      return "dark:bg-red-900 dark:text-red-100 dark:border-red-800"
    default:
      return "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800"
  }
}

export const SPANISH_LABELS = {
  bands: {
    Low: "Bajo",
    Moderate: "Moderado",
    High: "Alto",
    Critical: "Crítico",
  },
  status: {
    Open: "Abierto",
    Monitoring: "Monitoreando",
    Closed: "Cerrado",
  },
} as const
