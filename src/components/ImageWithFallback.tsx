import { ImageOff } from "lucide-react"
import { useState } from "react"
import type { Link } from "@/types/struppi"

interface ImageWithFallbackProps {
  links?: Link[]
  alt?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ImageWithFallback({ links, alt = "Image", className = "", size = "md" }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  // Get the first available link
  const imageUrl = links?.[0]?.link

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-32 h-32",
  }

  if (!imageUrl || hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded ${sizeClasses[size]} ${className}`}>
        <ImageOff className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`rounded object-cover ${sizeClasses[size]} ${className}`}
      onError={() => setHasError(true)}
    />
  )
}

