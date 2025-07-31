"use client"

import * as React from "react"
import { DropdownMenuContent as OriginalDropdownMenuContent } from '@/components/ui/dropdown-menu'
import { cn } from "@/lib/utils"

// Create an enhanced version of DropdownMenuContent with proper background styling
export const EnhancedDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof OriginalDropdownMenuContent>,
  React.ComponentPropsWithoutRef<typeof OriginalDropdownMenuContent>
>(({ className, ...props }, ref) => (
  <OriginalDropdownMenuContent
    ref={ref}
    className={cn(
      "bg-white border border-gray-200 shadow-md z-50",
      className
    )}
    {...props}
  />
))
EnhancedDropdownMenuContent.displayName = 'EnhancedDropdownMenuContent'
