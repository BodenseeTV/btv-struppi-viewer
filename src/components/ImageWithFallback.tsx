import { useState } from "react"
import type { Link } from "@/types/struppi"

interface ImageWithFallbackProps {
  links?: Link[]
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg"
  heightOnly?: boolean // Nur Höhe beschränken, nicht Breite
}

export function ImageWithFallback({
  links,
  alt = "Image",
  className = "",
  size = "md",
  heightOnly = false,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  const imageUrl = links?.find((link) => Boolean(link?.link?.trim()))?.link?.trim()

  const sizeClasses = {
    sm: heightOnly ? "h-8" : "w-8 h-8",
    md: heightOnly ? "h-16" : "w-16 h-16",
    lg: heightOnly ? "h-32" : "w-32 h-32",
  }

  if (!imageUrl || hasError) {
    return null
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`rounded-none object-contain ${sizeClasses[size]} ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
