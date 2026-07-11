import { ImageOff } from "lucide-react"
import { useState } from "react"
import type { Link } from "@/types/struppi"

interface ImageWithFallbackProps {
  links?: Link[]
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg"
  heightOnly?: boolean // Nur Höhe beschränken, nicht Breite
}

export function ImageWithFallback({ links, alt = "Image", className = "", size = "md", heightOnly = false }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  // Get the first available link
  const imageUrl = links?.[0]?.link

  const sizeClasses = {
    sm: heightOnly ? "h-8" : "w-8 h-8",
    md: heightOnly ? "h-16" : "w-16 h-16",
    lg: heightOnly ? "h-32" : "w-32 h-32",
  }

  if (!imageUrl || hasError) {
    // show square placeholder when no image (good for logos)
    const placeholderClasses = `${sizeClasses[size]} ${heightOnly ? 'w-auto' : ''}`
    return (
      <div className={`flex items-center justify-center bg-muted rounded ${placeholderClasses} ${className} ${!imageUrl ? 'aspect-square' : ''}`}>
        <ImageOff className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`rounded object-contain ${sizeClasses[size]} ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
