import { Badge } from "@/components/ui/badge"
import { getBandColor, getBandColorDark, SPANISH_LABELS } from "@/lib/risk-utils"
import type { RiskBand } from "@/lib/risk-utils"

interface SeverityBadgeProps {
  band: RiskBand
  severity?: number
  className?: string
}

export function SeverityBadge({ band, severity, className = "" }: SeverityBadgeProps) {
  const bandClasses = `${getBandColor(band)} ${getBandColorDark(band)}`

  return (
    <Badge className={`${bandClasses} ${className}`}>
      {SPANISH_LABELS.bands[band]}
      {severity && <span className="ml-1 text-xs opacity-75">({severity})</span>}
    </Badge>
  )
}
