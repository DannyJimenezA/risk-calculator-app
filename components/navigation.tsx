"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HomeIcon, TableIcon, BarChart3Icon, SettingsIcon } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Registro",
    href: "/riesgos",
    icon: TableIcon,
  },
  {
    name: "Reportes",
    href: "/reportes",
    icon: BarChart3Icon,
    disabled: true,
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: SettingsIcon,
    disabled: true,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-2">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.name}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild={!item.disabled}
            disabled={item.disabled}
            className={cn(
              "gap-2",
              isActive && "bg-primary text-primary-foreground",
              item.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {item.disabled ? (
              <span>
                <Icon className="w-4 h-4" />
                {item.name}
              </span>
            ) : (
              <Link href={item.href}>
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )}
          </Button>
        )
      })}
    </nav>
  )
}
